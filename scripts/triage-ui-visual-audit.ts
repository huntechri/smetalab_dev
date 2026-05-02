import fs from "node:fs"
import path from "node:path"

type Severity = "critical" | "high" | "medium" | "low"
type Priority = "P1" | "P2" | "P3" | "P4"
type Disposition = "bug" | "needs-review" | "accepted-residual" | "accepted-exception" | "false-positive-candidate"

interface Finding {
  filePath: string
  line: number
  category: string
  severity: Severity
  token: string
  reason: string
  surface: string
  ownership?: string
}

interface AuditReport {
  generatedAt: string
  scannedFiles: number
  totalFindings: number
  severityCounts: Record<string, number>
  categoryCounts: Record<string, number>
  surfaceCounts: Record<string, number>
  ownershipCounts?: Record<string, number>
  findings: Finding[]
}

interface BugCandidate {
  id: string
  priority: Priority
  disposition: Disposition
  title: string
  screenKey: string
  files: string[]
  surfaces: Record<string, number>
  ownership: Record<string, number>
  categories: Record<string, number>
  severities: Record<Severity, number>
  findingCount: number
  highCriticalCount: number
  recommendedAction: string
  sampleFindings: Finding[]
}

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, "reports", "ui-visual-audit.json")
const TRIAGE_JSON_PATH = path.join(ROOT, "reports", "ui-visual-audit-triage.json")
const TRIAGE_MD_PATH = path.join(ROOT, "reports", "ui-visual-audit-triage.md")

const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }
const PRIORITY_ORDER: Record<Priority, number> = { P1: 0, P2: 1, P3: 2, P4: 3 }

function stripExtension(filePath: string): string {
  return filePath.replace(/\.(client\.)?(server\.)?(test\.)?(spec\.)?(tsx|ts|jsx|js|css|mjs|cjs)$/u, "")
}

function appRouteFromPath(filePath: string): string {
  const withoutApp = filePath.replace(/^app\//u, "")
  const route = withoutApp.replace(/\/(page|layout|loading|error|not-found)\.(tsx|ts|jsx|js)$/u, "")
  if (route === "page.tsx" || route === "") return "/"
  return `/${route}`
}

function featureAreaFromPath(filePath: string): string {
  const parts = filePath.split("/")
  const feature = parts[1] ?? "unknown"
  const rest = parts.slice(2)

  const screenIndex = rest.indexOf("screens")
  if (screenIndex >= 0 && rest[screenIndex + 1]) return `${feature}/screen/${stripExtension(rest.slice(screenIndex + 1).join("/"))}`

  const tabsIndex = rest.indexOf("tabs")
  if (tabsIndex >= 0 && rest[tabsIndex + 1]) return `${feature}/tab/${stripExtension(rest.slice(tabsIndex + 1).join("/"))}`

  const componentsIndex = rest.indexOf("components")
  if (componentsIndex >= 0 && rest[componentsIndex + 1]) return `${feature}/component/${stripExtension(rest.slice(componentsIndex + 1).join("/"))}`

  return `${feature}/${stripExtension(rest.join("/")) || "root"}`
}

function deriveScreenKey(finding: Finding): string {
  const filePath = finding.filePath
  if (filePath.startsWith("app/")) return `app route: ${appRouteFromPath(filePath)}`
  if (filePath.startsWith("features/")) return `feature: ${featureAreaFromPath(filePath)}`
  if (filePath.startsWith("entities/")) return `entity: ${stripExtension(filePath.replace(/^entities\//u, ""))}`
  if (filePath.startsWith("shared/ui/")) return `shared-ui: ${stripExtension(filePath.replace(/^shared\/ui\//u, ""))}`
  if (filePath.startsWith("components/ui/")) return `compat-ui: ${stripExtension(filePath.replace(/^components\/ui\//u, ""))}`
  if (filePath.startsWith("components/")) return `component: ${stripExtension(filePath.replace(/^components\//u, ""))}`
  if (filePath.startsWith("packages/ui/")) return `package-ui: ${stripExtension(filePath.replace(/^packages\/ui\//u, ""))}`
  return `file: ${stripExtension(filePath)}`
}

function countBy<T extends string>(items: Finding[], selector: (finding: Finding) => T | undefined): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = selector(item) ?? "unknown"
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

function countSeverities(findings: Finding[]): Record<Severity, number> {
  return {
    critical: findings.filter((finding) => finding.severity === "critical").length,
    high: findings.filter((finding) => finding.severity === "high").length,
    medium: findings.filter((finding) => finding.severity === "medium").length,
    low: findings.filter((finding) => finding.severity === "low").length,
  }
}

function highCriticalCount(findings: Finding[]): number {
  return findings.filter((finding) => finding.severity === "critical" || finding.severity === "high").length
}

function groupFindings(findings: Finding[]): Map<string, Finding[]> {
  const groups = new Map<string, Finding[]>()
  for (const finding of findings) {
    const key = deriveScreenKey(finding)
    const group = groups.get(key) ?? []
    group.push(finding)
    groups.set(key, group)
  }
  return groups
}

function classifyPriority(findings: Finding[]): Priority {
  const highCritical = highCriticalCount(findings)
  const medium = findings.filter((finding) => finding.severity === "medium").length
  const surfaces = new Set(findings.map((finding) => finding.surface))
  const ownership = new Set(findings.map((finding) => finding.ownership ?? "unknown"))
  const categories = new Set(findings.map((finding) => finding.category))
  const isRuntimeSurface = ["app", "feature", "entity", "component"].some((surface) => surfaces.has(surface))

  if (highCritical > 0) return "P1"
  if (isRuntimeSurface && ownership.has("business-runtime-drift") && medium >= 5 && categories.size >= 2) return "P1"
  if (isRuntimeSurface && (ownership.has("business-runtime-drift") || ownership.has("marketing-auth-exception")) && medium > 0) return "P2"
  if (surfaces.has("shared-ui") && ownership.has("unknown") && medium > 0) return "P2"
  if (ownership.has("unknown") && medium > 0) return "P3"
  return "P4"
}

function classifyDisposition(findings: Finding[], priority: Priority): Disposition {
  const ownership = new Set(findings.map((finding) => finding.ownership ?? "unknown"))

  if (priority === "P1") return "bug"
  if (ownership.has("business-runtime-drift")) return "needs-review"
  if (ownership.has("marketing-auth-exception")) return "accepted-exception"
  if (ownership.has("primitive-contract") || ownership.has("feature-family-contract") || ownership.has("canonical-token")) return "accepted-residual"
  if (ownership.has("unknown")) return "needs-review"
  return "false-positive-candidate"
}

function recommendedAction(findings: Finding[], priority: Priority, disposition: Disposition): string {
  const surfaces = new Set(findings.map((finding) => finding.surface))
  const ownership = new Set(findings.map((finding) => finding.ownership ?? "unknown"))
  const categories = new Set(findings.map((finding) => finding.category))

  if (disposition === "bug") {
    return "Open a concrete UI bug/refactor issue. This is a runtime surface with dense visual-contract drift and should be normalized or given explicit coverage."
  }

  if (ownership.has("marketing-auth-exception")) {
    return "Do not blindly normalize to runtime-app UI. Classify the surface as accepted marketing/auth exception or extract a dedicated marketing/auth visual contract."
  }

  if (surfaces.has("shared-ui") && ownership.has("unknown")) {
    return "Review ownership. Either classify as accepted shared primitive contract or replace local arbitrary tokens with canonical shared UI tokens."
  }

  if (ownership.has("primitive-contract") || ownership.has("feature-family-contract")) {
    return "Keep as accepted residual unless this surface starts producing new visual drift or runtime smoke diagnostics."
  }

  if (categories.has("ui-entrypoint-overlap")) {
    return "Check import ownership. Ensure Radix/direct primitive imports are only present in approved shared UI entrypoints."
  }

  return "Review in the next UI audit pass. Decide whether this is a real bug, accepted residual, or false-positive audit signal."
}

function compareFindings(a: Finding, b: Finding): number {
  return (
    SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
    a.category.localeCompare(b.category) ||
    a.filePath.localeCompare(b.filePath) ||
    a.line - b.line ||
    a.token.localeCompare(b.token)
  )
}

function buildBugCandidates(findings: Finding[]): BugCandidate[] {
  return Array.from(groupFindings(findings).entries())
    .map(([screenKey, groupFindings], index) => {
      const sortedFindings = [...groupFindings].sort(compareFindings)
      const priority = classifyPriority(groupFindings)
      const disposition = classifyDisposition(groupFindings, priority)
      const files = [...new Set(groupFindings.map((finding) => finding.filePath))].sort()
      return {
        id: `UI-AUDIT-${String(index + 1).padStart(3, "0")}`,
        priority,
        disposition,
        title: `Review ${screenKey}`,
        screenKey,
        files,
        surfaces: countBy(groupFindings, (finding) => finding.surface),
        ownership: countBy(groupFindings, (finding) => finding.ownership),
        categories: countBy(groupFindings, (finding) => finding.category),
        severities: countSeverities(groupFindings),
        findingCount: groupFindings.length,
        highCriticalCount: highCriticalCount(groupFindings),
        recommendedAction: recommendedAction(groupFindings, priority, disposition),
        sampleFindings: sortedFindings.slice(0, 12),
      }
    })
    .sort((a, b) => {
      return (
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        b.highCriticalCount - a.highCriticalCount ||
        b.findingCount - a.findingCount ||
        a.screenKey.localeCompare(b.screenKey)
      )
    })
}

function formatRecord(record: Record<string, number>): string {
  const entries = Object.entries(record).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  return entries.length > 0 ? entries.map(([key, value]) => `${key}: ${value}`).join(", ") : "none"
}

function formatFinding(finding: Finding): string {
  return `\`${finding.filePath}:${finding.line}\` — ${finding.severity} / ${finding.category} / ${finding.ownership ?? "unknown"} / \`${String(finding.token).replace(/`/g, "'").replace(/\|/g, "\\|")}\``
}

function formatCandidateTable(candidates: BugCandidate[]): string {
  if (candidates.length === 0) return "_No UI audit bug candidates._"

  const rows = candidates.map((candidate) => {
    return `| ${candidate.id} | ${candidate.priority} | ${candidate.disposition} | ${candidate.findingCount} | ${candidate.highCriticalCount} | ${candidate.screenKey.replace(/\|/g, "\\|")} | ${formatRecord(candidate.categories).replace(/\|/g, "\\|")} | ${formatRecord(candidate.ownership).replace(/\|/g, "\\|")} |`
  })

  return [
    "| ID | Priority | Disposition | Findings | High/Critical | Screen/file surface | Categories | Ownership |",
    "| --- | --- | --- | ---: | ---: | --- | --- | --- |",
    ...rows,
  ].join("\n")
}

function formatCandidateDetails(candidates: BugCandidate[], limit = 40): string {
  if (candidates.length === 0) return "_No UI audit bug candidates._"

  const shown = candidates.slice(0, limit)
  const body = shown
    .map((candidate) => {
      return `### ${candidate.id} — ${candidate.priority} — ${candidate.disposition} — ${candidate.screenKey}

- Findings: ${candidate.findingCount}
- High/Critical: ${candidate.highCriticalCount}
- Files: ${candidate.files.map((filePath) => `\`${filePath}\``).join(", ")}
- Categories: ${formatRecord(candidate.categories)}
- Ownership: ${formatRecord(candidate.ownership)}
- Recommended action: ${candidate.recommendedAction}

Sample evidence:
${candidate.sampleFindings.map((finding) => `- ${formatFinding(finding)}`).join("\n")}
`
    })
    .join("\n")

  const suffix = candidates.length > limit ? `\n_Showing ${limit} of ${candidates.length} candidates. See \`reports/ui-visual-audit-triage.json\` for the full structured list._\n` : ""
  return `${body}${suffix}`
}

function priorityCounts(candidates: BugCandidate[]): Record<Priority, number> {
  return {
    P1: candidates.filter((candidate) => candidate.priority === "P1").length,
    P2: candidates.filter((candidate) => candidate.priority === "P2").length,
    P3: candidates.filter((candidate) => candidate.priority === "P3").length,
    P4: candidates.filter((candidate) => candidate.priority === "P4").length,
  }
}

function dispositionCounts(candidates: BugCandidate[]): Record<Disposition, number> {
  return {
    bug: candidates.filter((candidate) => candidate.disposition === "bug").length,
    "needs-review": candidates.filter((candidate) => candidate.disposition === "needs-review").length,
    "accepted-residual": candidates.filter((candidate) => candidate.disposition === "accepted-residual").length,
    "accepted-exception": candidates.filter((candidate) => candidate.disposition === "accepted-exception").length,
    "false-positive-candidate": candidates.filter((candidate) => candidate.disposition === "false-positive-candidate").length,
  }
}

function main(): void {
  if (!fs.existsSync(REPORT_JSON_PATH)) {
    throw new Error(`Missing audit report: ${path.relative(ROOT, REPORT_JSON_PATH)}`)
  }

  const report = JSON.parse(fs.readFileSync(REPORT_JSON_PATH, "utf8")) as AuditReport
  const findings = report.findings ?? []
  const candidates = buildBugCandidates(findings)
  const priorities = priorityCounts(candidates)
  const dispositions = dispositionCounts(candidates)

  const triageReport = {
    generatedAt: new Date().toISOString(),
    sourceReportGeneratedAt: report.generatedAt,
    mode: "report-only",
    note: "Findings are grouped into bug candidates. One bug candidate can contain many audit findings.",
    scannedFiles: report.scannedFiles,
    totalFindings: report.totalFindings,
    candidateCount: candidates.length,
    priorityCounts: priorities,
    dispositionCounts: dispositions,
    severityCounts: report.severityCounts,
    categoryCounts: report.categoryCounts,
    surfaceCounts: report.surfaceCounts,
    ownershipCounts: report.ownershipCounts,
    candidates,
  }

  fs.mkdirSync(path.dirname(TRIAGE_JSON_PATH), { recursive: true })
  fs.writeFileSync(TRIAGE_JSON_PATH, JSON.stringify(triageReport, null, 2))

  const markdown = `# UI Visual Audit Bug Triage

This report is generated from the primary \`audit:ui\` output in the main CI/CD Pipeline. It is report-only and intentionally does not fail CI.

A single real UI bug can produce many audit findings. This report groups all findings into screen/file-level bug candidates.

- Source report generated at: ${report.generatedAt}
- Scanned files: ${report.scannedFiles}
- Total raw findings: ${report.totalFindings}
- Bug candidates: ${candidates.length}

## Priority counts

- P1: ${priorities.P1}
- P2: ${priorities.P2}
- P3: ${priorities.P3}
- P4: ${priorities.P4}

## Disposition counts

- bug: ${dispositions.bug}
- needs-review: ${dispositions["needs-review"]}
- accepted-residual: ${dispositions["accepted-residual"]}
- accepted-exception: ${dispositions["accepted-exception"]}
- false-positive-candidate: ${dispositions["false-positive-candidate"]}

## How to read this report

- P1 = likely real runtime UI bug/refactor target.
- P2 = must be reviewed; often auth/landing/shared-ui ownership or dense runtime drift.
- P3 = lower-priority ownership/token cleanup.
- P4 = accepted residual, intentional exception, or low-priority observation.

## Full candidate matrix

${formatCandidateTable(candidates)}

## Candidate details

${formatCandidateDetails(candidates, 40)}
`

  fs.writeFileSync(TRIAGE_MD_PATH, markdown)
  console.log(`UI visual audit triage written to ${path.relative(ROOT, TRIAGE_JSON_PATH)}`)
  console.log(`UI visual audit triage markdown written to ${path.relative(ROOT, TRIAGE_MD_PATH)}`)
}

main()
