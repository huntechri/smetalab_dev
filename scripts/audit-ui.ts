import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

type CheckStatus = "pass" | "review" | "fail" | "missing-report"

type Options = {
  strict: boolean
  report: boolean
}

type AuditCheck = {
  id: string
  title: string
  command: string[]
  reportJson?: string
  reportMd?: string
  description: string
}

type AuditCheckResult = {
  id: string
  title: string
  status: CheckStatus
  exitCode: number | null
  blockingFindings: number
  totalFindings: number
  reportJson?: string
  reportMd?: string
  description: string
  summary: string
}

type SummaryReport = {
  generatedAt: string
  mode: "ui-audit-summary"
  strict: boolean
  status: CheckStatus
  blockingFindings: number
  totalFindings: number
  checks: AuditCheckResult[]
}

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, "reports", "ui-audit-summary.json")
const REPORT_MD_PATH = path.join(ROOT, "reports", "ui-audit-summary.md")

const REPORT_ONLY_CHECKS = new Set(["visual-ownership", "coverage", "inventory"])

function parseArgs(argv: string[]): Options {
  const args = new Set(argv)
  return {
    strict: args.has("--strict"),
    report: args.has("--report") || args.has("--strict"),
  }
}

function buildChecks(options: Options): AuditCheck[] {
  return [
    {
      id: "imports",
      title: "UI imports",
      command: ["pnpm", "audit:ui-imports"],
      description: "Canonical UI import boundaries and compatibility entrypoints.",
    },
    {
      id: "buttons",
      title: "Button migration report",
      command: ["pnpm", "audit:buttons"],
      description: "Button migration/codemod report.",
    },
    {
      id: "inputs",
      title: "Input migration report",
      command: ["pnpm", "audit:inputs"],
      description: "Input migration/codemod report.",
    },
    {
      id: "visual-ownership",
      title: "Visual ownership",
      command: ["pnpm", options.strict ? "audit:ui:visual:strict" : "audit:ui:visual"],
      reportJson: "reports/ui-visual-audit.json",
      reportMd: "reports/ui-visual-audit.md",
      description: "Full visual ownership surface. Includes accepted shared/ui owners and is not the direct local-cleanup backlog.",
    },
    {
      id: "coverage",
      title: "UI coverage radar",
      command: ["pnpm", options.strict ? "audit:ui:coverage:strict" : "audit:ui:coverage"],
      reportJson: "reports/ui-coverage-audit.json",
      reportMd: "reports/ui-coverage-audit.md",
      description: "Report-only UI coverage and bug-candidate radar.",
    },
    {
      id: "inventory",
      title: "UI inventory",
      command: ["pnpm", options.strict ? "audit:ui-inventory:strict" : "audit:ui-inventory"],
      reportJson: "reports/ui-inventory.json",
      reportMd: "reports/ui-inventory.md",
      description: "UI inventory and compatibility surface diagnostics.",
    },
    {
      id: "local-classes",
      title: "Local classes",
      command: ["pnpm", options.strict ? "audit:ui:local-classes:strict" : "audit:ui:local-classes"],
      reportJson: "reports/ui-local-classes.json",
      reportMd: "reports/ui-local-classes.md",
      description: "Actionable cleanup list for local visual classes outside shared/ui.",
    },
  ]
}

function readJsonReport<T extends Record<string, unknown>>(relativePath: string | undefined): T | undefined {
  if (!relativePath) return undefined

  const reportPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(reportPath)) return undefined

  try {
    return JSON.parse(fs.readFileSync(reportPath, "utf8")) as T
  } catch {
    return undefined
  }
}

function numberFrom(report: Record<string, unknown> | undefined, keys: string[]): number {
  if (!report) return 0

  for (const key of keys) {
    const value = report[key]
    if (typeof value === "number" && Number.isFinite(value)) return value
  }

  return 0
}

function nestedNumberFrom(report: Record<string, unknown> | undefined, pathParts: string[]): number {
  if (!report) return 0
  let current: unknown = report

  for (const part of pathParts) {
    if (!current || typeof current !== "object" || !(part in current)) return 0
    current = (current as Record<string, unknown>)[part]
  }

  return typeof current === "number" && Number.isFinite(current) ? current : 0
}

function summarizeReport(check: AuditCheck, report: Record<string, unknown> | undefined): Pick<AuditCheckResult, "totalFindings" | "blockingFindings" | "summary"> {
  if (!report) {
    return {
      totalFindings: 0,
      blockingFindings: 0,
      summary: check.reportJson ? `Report not found: ${check.reportJson}` : "No JSON report configured.",
    }
  }

  if (check.id === "visual-ownership") {
    const totalFindings = numberFrom(report, ["totalFindings"])
    const high = nestedNumberFrom(report, ["severityCounts", "high"])
    const critical = nestedNumberFrom(report, ["severityCounts", "critical"])
    return {
      totalFindings,
      blockingFindings: high + critical,
      summary: "Full visual ownership surface. Shared/ui findings can be valid accepted ownership.",
    }
  }

  if (check.id === "coverage") {
    const totalFindings = numberFrom(report, ["totalFindings"])
    return {
      totalFindings,
      blockingFindings: 0,
      summary: "Coverage radar is report-only.",
    }
  }

  if (check.id === "local-classes") {
    const totalFindings = numberFrom(report, ["totalFindings"])
    const high = nestedNumberFrom(report, ["severityCounts", "high"])
    return {
      totalFindings,
      blockingFindings: high,
      summary: "Actionable local visual class cleanup outside shared/ui.",
    }
  }

  if (check.id === "inventory") {
    const totalFindings = numberFrom(report, ["totalFindings", "findingCount", "total"])
    const blockingFindings = numberFrom(report, ["blockingFindings", "violationCount"])
    return {
      totalFindings,
      blockingFindings,
      summary: "Inventory diagnostics. See detailed inventory report for exact interpretation.",
    }
  }

  return {
    totalFindings: numberFrom(report, ["totalFindings", "findingCount", "violationCount"]),
    blockingFindings: numberFrom(report, ["blockingFindings", "violationCount"]),
    summary: "Completed.",
  }
}

function runCheck(check: AuditCheck): AuditCheckResult {
  const [command, ...args] = check.command
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "inherit",
    shell: process.platform === "win32",
  })

  const exitCode = result.status ?? (result.error ? 1 : 0)
  const report = readJsonReport(check.reportJson)
  const reportSummary = summarizeReport(check, report)
  const reportMissing = Boolean(check.reportJson) && !report

  let status: CheckStatus = "pass"
  if (reportMissing) status = "missing-report"
  else if (exitCode !== 0) status = "fail"
  else if (REPORT_ONLY_CHECKS.has(check.id) && reportSummary.totalFindings > 0) status = "review"
  else if (check.id === "local-classes" && reportSummary.totalFindings > 0) status = reportSummary.blockingFindings > 0 ? "fail" : "review"

  return {
    id: check.id,
    title: check.title,
    status,
    exitCode,
    blockingFindings: status === "review" && REPORT_ONLY_CHECKS.has(check.id) ? 0 : reportSummary.blockingFindings,
    totalFindings: reportSummary.totalFindings,
    reportJson: check.reportJson,
    reportMd: check.reportMd,
    description: check.description,
    summary: reportSummary.summary,
  }
}

function aggregateStatus(results: AuditCheckResult[]): CheckStatus {
  if (results.some((result) => result.status === "fail" || result.status === "missing-report")) return "fail"
  if (results.some((result) => result.status === "review")) return "review"
  return "pass"
}

function escapeMarkdownCell(value: string | undefined): string {
  if (!value) return "-"
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ")
}

function writeSummary(report: SummaryReport): void {
  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(report, null, 2))

  const rows = report.checks
    .map(
      (check) =>
        `| ${check.title} | ${check.status} | ${check.blockingFindings} | ${check.totalFindings} | ${check.exitCode ?? "-"} | ${check.reportMd ? `\`${check.reportMd}\`` : "-"} | ${escapeMarkdownCell(check.summary)} |`
    )
    .join("\n")

  const markdown = `# UI Audit Summary

- Status: ${report.status}
- Strict: ${report.strict ? "yes" : "no"}
- Blocking findings: ${report.blockingFindings}
- Total findings: ${report.totalFindings}

## Interpretation

- \`visual ownership\` includes accepted \`shared/ui\` owners. It is the full visual surface, not the direct cleanup backlog.
- \`local classes\` is the actionable cleanup report for \`app/features/entities/components/widgets\` outside \`shared/ui\`.
- Report-only checks can return \`review\` without blocking release by themselves.

## Checks

| Check | Status | Blocking findings | Total findings | Exit code | Report | Summary |
| --- | --- | ---: | ---: | ---: | --- | --- |
${rows || "| - | - | 0 | 0 | - | - | - |"}
`

  fs.writeFileSync(REPORT_MD_PATH, markdown)
}

function main(): void {
  const options = parseArgs(process.argv.slice(2))
  const checks = buildChecks(options)
  const results = checks.map(runCheck)
  const status = aggregateStatus(results)
  const blockingFindings = results.reduce((sum, result) => sum + result.blockingFindings, 0)
  const totalFindings = results.reduce((sum, result) => sum + result.totalFindings, 0)

  const report: SummaryReport = {
    generatedAt: new Date().toISOString(),
    mode: "ui-audit-summary",
    strict: options.strict,
    status,
    blockingFindings,
    totalFindings,
    checks: results,
  }

  writeSummary(report)

  if (options.report) {
    console.log(`UI audit summary: ${path.relative(ROOT, REPORT_MD_PATH)}`)
  }

  if (status === "fail") {
    console.error(`UI audit failed with ${blockingFindings} blocking finding(s).`)
    process.exitCode = 1
    return
  }

  if (status === "review") {
    console.log(`UI audit completed with review-only findings. Summary: ${path.relative(ROOT, REPORT_MD_PATH)}`)
    return
  }

  console.log(`UI audit passed. Summary: ${path.relative(ROOT, REPORT_MD_PATH)}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
