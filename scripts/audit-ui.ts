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
  actionable: boolean
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
      description: "Canonical UI import boundary errors.",
    },
    {
      id: "buttons",
      title: "Button migration",
      command: ["pnpm", "audit:buttons"],
      description: "Button migration errors.",
    },
    {
      id: "inputs",
      title: "Input migration",
      command: ["pnpm", "audit:inputs"],
      description: "Input migration errors.",
    },
    {
      id: "visual-ownership",
      title: "Visual ownership",
      command: ["pnpm", options.strict ? "audit:ui:visual:strict" : "audit:ui:visual"],
      reportJson: "reports/ui-visual-audit.json",
      reportMd: "reports/ui-visual-audit.md",
      description: "Full visual surface. Not shown in fix summary unless it blocks.",
    },
    {
      id: "coverage",
      title: "UI coverage radar",
      command: ["pnpm", options.strict ? "audit:ui:coverage:strict" : "audit:ui:coverage"],
      reportJson: "reports/ui-coverage-audit.json",
      reportMd: "reports/ui-coverage-audit.md",
      description: "Report-only coverage radar. Not shown in fix summary unless it blocks.",
    },
    {
      id: "inventory",
      title: "UI inventory",
      command: ["pnpm", options.strict ? "audit:ui-inventory:strict" : "audit:ui-inventory"],
      reportJson: "reports/ui-inventory.json",
      reportMd: "reports/ui-inventory.md",
      description: "Report-only inventory diagnostics. Not shown in fix summary unless it blocks.",
    },
    {
      id: "local-classes",
      title: "Local classes",
      command: ["pnpm", options.strict ? "audit:ui:local-classes:strict" : "audit:ui:local-classes"],
      reportJson: "reports/ui-local-classes.json",
      reportMd: "reports/ui-local-classes.md",
      description: "Local visual classes outside shared/ui that should be migrated.",
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
      summary: high + critical > 0 ? "Fix high/critical visual ownership violations." : "No blocking visual ownership errors.",
    }
  }

  if (check.id === "coverage") {
    return {
      totalFindings: numberFrom(report, ["totalFindings"]),
      blockingFindings: 0,
      summary: "Coverage radar is report-only.",
    }
  }

  if (check.id === "local-classes") {
    const totalFindings = numberFrom(report, ["totalFindings"])
    const high = nestedNumberFrom(report, ["severityCounts", "high"])
    const medium = nestedNumberFrom(report, ["severityCounts", "medium"])
    const low = nestedNumberFrom(report, ["severityCounts", "low"])
    return {
      totalFindings,
      blockingFindings: high,
      summary: `Migrate local visual classes: high ${high}, medium ${medium}, low ${low}.`,
    }
  }

  if (check.id === "inventory") {
    const totalFindings = numberFrom(report, ["totalFindings", "findingCount", "total"])
    const blockingFindings = numberFrom(report, ["blockingFindings", "violationCount"])
    return {
      totalFindings,
      blockingFindings,
      summary: blockingFindings > 0 ? "Fix UI inventory violations." : "Inventory diagnostics are report-only.",
    }
  }

  return {
    totalFindings: numberFrom(report, ["totalFindings", "findingCount", "violationCount"]),
    blockingFindings: numberFrom(report, ["blockingFindings", "violationCount"]),
    summary: "Fix the failing audit step.",
  }
}

function isActionable(check: AuditCheck, status: CheckStatus, reportSummary: Pick<AuditCheckResult, "totalFindings" | "blockingFindings">): boolean {
  if (status === "fail" || status === "missing-report") return true
  if (check.id === "local-classes" && reportSummary.totalFindings > 0) return true
  if (!REPORT_ONLY_CHECKS.has(check.id) && reportSummary.blockingFindings > 0) return true
  return false
}

function runCheck(check: AuditCheck, options: Options): AuditCheckResult {
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
  else if (REPORT_ONLY_CHECKS.has(check.id) && reportSummary.blockingFindings > 0) status = "fail"
  else if (check.id === "local-classes" && reportSummary.totalFindings > 0) {
    status = options.strict && reportSummary.blockingFindings > 0 ? "fail" : "review"
  }

  const blockingFindings =
    status === "review" && check.id === "local-classes"
      ? 0
      : reportSummary.blockingFindings

  return {
    id: check.id,
    title: check.title,
    status,
    exitCode,
    blockingFindings,
    totalFindings: reportSummary.totalFindings,
    actionable: isActionable(check, status, reportSummary),
    reportJson: check.reportJson,
    reportMd: check.reportMd,
    description: check.description,
    summary: reportSummary.summary,
  }
}

function aggregateStatus(results: AuditCheckResult[]): CheckStatus {
  if (results.some((result) => result.status === "fail" || result.status === "missing-report")) return "fail"
  if (results.some((result) => result.actionable)) return "review"
  return "pass"
}

function escapeMarkdownCell(value: string | undefined): string {
  if (!value) return "-"
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ")
}

function formatActionableRows(checks: AuditCheckResult[]): string {
  const rows = checks
    .filter((check) => check.actionable)
    .map(
      (check) =>
        `| ${check.title} | ${check.status} | ${check.blockingFindings} | ${check.totalFindings} | ${check.reportMd ? `\`${check.reportMd}\`` : "-"} | ${escapeMarkdownCell(check.summary)} |`
    )

  return rows.length > 0 ? rows.join("\n") : "| - | pass | 0 | 0 | - | No actionable UI audit errors. |"
}

function writeSummary(report: SummaryReport): void {
  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(report, null, 2))

  const actionableChecks = report.checks.filter((check) => check.actionable)
  const markdown = `# UI Audit Fix Summary

- Status: ${report.status}
- Strict: ${report.strict ? "yes" : "no"}
- Blocking errors: ${report.blockingFindings}
- Items to review/fix: ${actionableChecks.length}

## Fix now

| Check | Status | Blocking | Findings | Report | What to fix |
| --- | --- | ---: | ---: | --- | --- |
${formatActionableRows(report.checks)}

## Notes

- \`reports/ui-local-classes.md\` is the only human cleanup report for local visual classes.
- Full machine data is still available in \`reports/ui-audit-summary.json\`.
- Report-only inventory/coverage/visual-surface noise is hidden from this summary unless it blocks.
`

  fs.writeFileSync(REPORT_MD_PATH, markdown)
}

function main(): void {
  const options = parseArgs(process.argv.slice(2))
  const checks = buildChecks(options)
  const results = checks.map((check) => runCheck(check, options))
  const status = aggregateStatus(results)
  const blockingFindings = results.reduce((sum, result) => sum + result.blockingFindings, 0)
  const totalFindings = results.filter((result) => result.actionable).reduce((sum, result) => sum + result.totalFindings, 0)

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

  if (status === "fail") {
    console.error(`UI audit failed. Fix summary: ${path.relative(ROOT, REPORT_MD_PATH)}`)
    process.exitCode = 1
    return
  }

  if (status === "review") {
    console.log(`UI audit needs review. Fix summary: ${path.relative(ROOT, REPORT_MD_PATH)}`)
    return
  }

  console.log(`UI audit passed. Fix summary: ${path.relative(ROOT, REPORT_MD_PATH)}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
