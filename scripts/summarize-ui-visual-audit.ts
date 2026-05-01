import fs from "node:fs"
import path from "node:path"

interface Finding {
  filePath: string
  line: number
  category: string
  severity: "critical" | "high" | "medium" | "low"
  token: string
  reason: string
  surface: string
  ownership?: string
}

interface TargetValidation {
  phase: string
  title: string
  expected: string
  actualFindings: number
  highCriticalFindings: number
  status: "PASS" | "PASS_WITH_SHARED_RESIDUAL" | "REVIEW" | "FAIL"
  files: string[]
  sharedResidualOwners: string[]
}

interface AuditReport {
  generatedAt: string
  scanRoots?: string[]
  scannedFiles: number
  scannedRootCounts?: Record<string, number>
  totalFindings: number
  severityCounts: Record<string, number>
  categoryCounts: Record<string, number>
  surfaceCounts: Record<string, number>
  ownershipCounts?: Record<string, number>
  acceptedSharedContractOwners?: string[]
  postRefactorValidation?: TargetValidation[]
  findings: Finding[]
}

interface ScreenGroup {
  key: string
  files: Set<string>
  findings: Finding[]
}

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, "reports", "ui-visual-audit.json")
const SUMMARY_MD_PATH = path.join(ROOT, "reports", "ui-visual-audit-summary.md")
const COMMENT_MARKER = "<!-- ui-visual-audit-summary -->"
const SEVERITY_ORDER: Record<Finding["severity"], number> = { critical: 0, high: 1, medium: 2, low: 3 }
const IMPORTANT_CATEGORY_ORDER: Record<string, number> = {
  "ui-entrypoint-overlap": 0,
  "font-overlap": 1,
  "radius-overlap": 2,
  "color-overlap": 3,
  "badge-overlap": 4,
  "padding-overlap": 5,
  "border-overlap": 6,
  "shadow-overlap": 7,
  "typography-overlap": 8,
  "inline-style-overlap": 9,
  "arbitrary-layout-overlap": 10,
}

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

function highCount(findings: Finding[]): number {
  return findings.filter((finding) => finding.severity === "critical" || finding.severity === "high").length
}

function compareFindings(a: Finding, b: Finding): number {
  return (
    SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
    (IMPORTANT_CATEGORY_ORDER[a.category] ?? 99) - (IMPORTANT_CATEGORY_ORDER[b.category] ?? 99) ||
    a.filePath.localeCompare(b.filePath) ||
    a.line - b.line ||
    a.token.localeCompare(b.token)
  )
}

function compareScreenGroups(a: ScreenGroup, b: ScreenGroup): number {
  return highCount(b.findings) - highCount(a.findings) || b.findings.length - a.findings.length || a.key.localeCompare(b.key)
}

function buildScreenGroups(findings: Finding[]): ScreenGroup[] {
  const groups = new Map<string, ScreenGroup>()

  for (const finding of findings) {
    const key = deriveScreenKey(finding)
    const group = groups.get(key) ?? { key, files: new Set<string>(), findings: [] }
    group.files.add(finding.filePath)
    group.findings.push(finding)
    groups.set(key, group)
  }

  return [...groups.values()].sort(compareScreenGroups)
}

function countBy(findings: Finding[], key: keyof Pick<Finding, "severity" | "category" | "surface" | "ownership">): Record<string, number> {
  return findings.reduce<Record<string, number>>((acc, finding) => {
    const value = finding[key] ?? "unknown"
    acc[value] = (acc[value] ?? 0) + 1
    return acc
  }, {})
}

function escapeCell(value: unknown): string {
  return String(value ?? "").replace(/\|/g, "\\|")
}

function formatCounts(counts: Record<string, number> | undefined, options: { includeZeroKeys?: string[] } = {}): string {
  const merged = { ...(counts ?? {}) }
  for (const key of options.includeZeroKeys ?? []) merged[key] = merged[key] ?? 0

  const entries = Object.entries(merged)
    .filter(([key, count]) => count > 0 || (options.includeZeroKeys ?? []).includes(key))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

  if (entries.length === 0) return "- none"
  return entries.map(([name, count]) => `- ${name}: ${count}`).join("\n")
}

function topCategories(findings: Finding[], limit = 3): string {
  const entries = Object.entries(countBy(findings, "category")).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  if (entries.length === 0) return "none"
  return entries.slice(0, limit).map(([category, count]) => `${category}: ${count}`).join(", ")
}

function formatFindingTable(findings: Finding[], limit: number): string {
  if (findings.length === 0) return "_No findings._"

  const rows = findings.slice(0, limit).map((finding) => {
    return `| ${finding.severity} | ${finding.category} | ${finding.surface} | ${finding.ownership ?? "unknown"} | \`${finding.filePath}:${finding.line}\` | \`${escapeCell(finding.token)}\` |`
  })

  const suffix = findings.length > limit ? `\n\n_Showing ${limit} of ${findings.length} findings._` : ""
  return [
    "| Severity | Category | Surface | Ownership | Location | Token |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows,
  ].join("\n") + suffix
}

function formatScreenMatrix(groups: ScreenGroup[]): string {
  if (groups.length === 0) return "_No screen/file groups with findings._"

  const rows = groups.map((group) => {
    return `| ${escapeCell(group.key)} | ${group.files.size} | ${group.findings.length} | ${highCount(group.findings)} | ${escapeCell(topCategories(group.findings))} |`
  })

  return [
    "| Screen / file surface | Files | Findings | High/Critical | Top categories |",
    "| --- | ---: | ---: | ---: | --- |",
    ...rows,
  ].join("\n")
}

function formatValidationTable(validations: TargetValidation[] | undefined): string {
  if (!validations || validations.length === 0) return "_No post-refactor validation data in report._"

  const rows = validations.map((validation) => {
    const files = validation.files.length > 0 ? validation.files.map((file) => `\`${file}\``).join(", ") : "—"
    const owners = validation.sharedResidualOwners.length > 0 ? validation.sharedResidualOwners.map((file) => `\`${file}\``).join(", ") : "—"
    return `| ${validation.phase} | ${escapeCell(validation.title)} | ${validation.actualFindings} | ${validation.highCriticalFindings} | ${validation.status} | ${files} | ${owners} |`
  })

  return [
    "| Phase | Target | Feature findings | High/Critical | Status | Target files with findings | Accepted shared residual owner(s) |",
    "| --- | --- | ---: | ---: | --- | --- | --- |",
    ...rows,
  ].join("\n")
}

function formatTopScreenDetails(groups: ScreenGroup[], limit: number): string {
  const topGroups = groups.slice(0, limit)
  if (topGroups.length === 0) return "_No screen/file groups with findings._"

  return topGroups
    .map((group) => {
      const findings = [...group.findings].sort(compareFindings)
      return `### ${group.key}

- Files: ${group.files.size}
- Findings: ${group.findings.length}
- High/Critical findings: ${highCount(group.findings)}
- Files touched: ${[...group.files].sort().map((filePath) => `\`${filePath}\``).join(", ")}

Categories:
${formatCounts(countBy(group.findings, "category"))}

Ownership:
${formatCounts(countBy(group.findings, "ownership"))}

Top findings:
${formatFindingTable(findings, 10)}
`
    })
    .join("\n")
}

function main(): void {
  if (!fs.existsSync(REPORT_JSON_PATH)) {
    throw new Error(`Missing audit report: ${path.relative(ROOT, REPORT_JSON_PATH)}`)
  }

  const report = JSON.parse(fs.readFileSync(REPORT_JSON_PATH, "utf8")) as AuditReport
  const findings = [...(report.findings ?? [])].sort(compareFindings)
  const highPriority = findings.filter((finding) => finding.severity === "critical" || finding.severity === "high")
  const businessRuntimeHighPriority = highPriority.filter((finding) => finding.ownership === "business-runtime-drift")
  const acceptedSharedResiduals = findings.filter((finding) => finding.ownership === "primitive-contract" || finding.ownership === "feature-family-contract")
  const unclassifiedSharedUi = findings.filter((finding) => finding.surface === "shared-ui" && (!finding.ownership || finding.ownership === "unknown"))
  const marketingAuthExceptions = findings.filter((finding) => finding.ownership === "marketing-auth-exception")
  const appFeatureEntityFindings = findings.filter((finding) => ["app", "feature", "entity"].includes(finding.surface))
  const scanRoots = report.scanRoots ?? []
  const rootsLabel = scanRoots.length > 0 ? scanRoots.map((root) => `\`${root}\``).join(", ") : "_not reported_"
  const screenGroups = buildScreenGroups(findings)

  const markdown = `${COMMENT_MARKER}
## UI Visual Audit report

Generated at: ${report.generatedAt}

- Scanned files: ${report.scannedFiles}
- Total findings: ${report.totalFindings}
- Generated screen/file groups with findings: ${screenGroups.length}
- Scan roots: ${rootsLabel}

### Scanned root counts
${formatCounts(report.scannedRootCounts, { includeZeroKeys: scanRoots })}

### Severity counts
${formatCounts(report.severityCounts)}

### Category counts
${formatCounts(report.categoryCounts)}

### Surface counts
${formatCounts(report.surfaceCounts)}

### Ownership counts
${formatCounts(report.ownershipCounts ?? countBy(findings, "ownership"))}

## Business runtime High/Critical findings

${formatFindingTable(businessRuntimeHighPriority, 20)}

## Closed phase target validation (#175-#184)

${formatValidationTable(report.postRefactorValidation)}

## Accepted shared contract residuals

${formatFindingTable(acceptedSharedResiduals, 40)}

## Shared UI contracts requiring review

${formatFindingTable(unclassifiedSharedUi, 40)}

## Marketing/auth/landing exceptions

${formatFindingTable(marketingAuthExceptions, 40)}

## Top remaining app/feature/entity findings

${formatFindingTable(appFeatureEntityFindings, 40)}

## Generated screen/file matrix

This matrix is generated from every finding path in the audit report. It is not a manually curated allowlist, so newly added screens appear automatically when they have findings.

${formatScreenMatrix(screenGroups)}

## Top screen/file details

${formatTopScreenDetails(screenGroups, 20)}
`

  fs.mkdirSync(path.dirname(SUMMARY_MD_PATH), { recursive: true })
  fs.writeFileSync(SUMMARY_MD_PATH, markdown)
  console.log(`UI visual audit summary written to ${path.relative(ROOT, SUMMARY_MD_PATH)}`)
}

main()
