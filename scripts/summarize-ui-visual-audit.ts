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
  findings: Finding[]
}

interface FocusArea {
  id: string
  title: string
  matches: (finding: Finding) => boolean
}

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, "reports", "ui-visual-audit.json")
const SUMMARY_MD_PATH = path.join(ROOT, "reports", "ui-visual-audit-summary.md")
const COMMENT_MARKER = "<!-- ui-visual-audit-summary -->"
const SEVERITY_ORDER: Record<Finding["severity"], number> = { critical: 0, high: 1, medium: 2, low: 3 }
const IMPORTANT_CATEGORY_ORDER: Record<string, number> = {
  "ui-entrypoint-overlap": 0,
  "font-overlap": 1,
  "color-overlap": 2,
  "radius-overlap": 3,
  "border-overlap": 4,
  "shadow-overlap": 5,
  "typography-overlap": 6,
  "inline-style-overlap": 7,
  "arbitrary-layout-overlap": 8,
}

function isEstimatePath(finding: Finding): boolean {
  return (
    finding.filePath.startsWith("features/projects/estimates/") ||
    finding.filePath.startsWith("features/estimates/") ||
    /^app\/.*estimates/.test(finding.filePath)
  )
}

function includesAny(filePath: string, parts: string[]): boolean {
  return parts.some((part) => filePath.includes(part))
}

const FOCUS_AREAS: FocusArea[] = [
  {
    id: "estimate-module",
    title: "Estimate module / smeta",
    matches: isEstimatePath,
  },
  {
    id: "estimate-shell-tabs-navigation",
    title: "Estimate shell and tab navigation",
    matches: (finding) =>
      includesAny(finding.filePath, [
        "features/projects/estimates/screens/EstimateDetailsShell",
        "features/projects/estimates/layouts/EstimateDetailsLayout",
        "features/projects/estimates/components/EstimateHeader",
      ]),
  },
  {
    id: "estimate-table",
    title: "Estimate table / Смета tab",
    matches: (finding) =>
      includesAny(finding.filePath, [
        "features/projects/estimates/components/table/",
        "features/projects/estimates/components/EstimateTable",
        "features/projects/estimates/screens/EstimateDetailsShell",
      ]) && !includesAny(finding.filePath, ["components/tabs/", "EstimateExecution", "EstimateProcurement", "EstimateFinance"]),
  },
  {
    id: "estimate-execution",
    title: "Estimate Execution / Выполнение tab",
    matches: (finding) =>
      includesAny(finding.filePath, [
        "features/projects/estimates/components/tabs/EstimateExecution",
        "features/projects/estimates/screens/EstimateAccomplishmentScreen",
        "features/projects/estimates/types/execution",
      ]),
  },
  {
    id: "estimate-procurement",
    title: "Estimate Procurement / Закупки tab",
    matches: (finding) =>
      includesAny(finding.filePath, [
        "features/projects/estimates/components/tabs/EstimateProcurement",
        "features/projects/estimates/screens/EstimatePurchasesScreen",
        "features/projects/estimates/types/procurement",
      ]) ||
      (isEstimatePath(finding) && includesAny(finding.filePath.toLowerCase(), ["procurement", "purchase", "purchases"])),
  },
  {
    id: "estimate-finance",
    title: "Estimate Finance / Финансы tab",
    matches: (finding) =>
      includesAny(finding.filePath, [
        "features/projects/estimates/components/tabs/EstimateFinance",
        "features/projects/estimates/types/finance",
      ]) || (isEstimatePath(finding) && finding.filePath.toLowerCase().includes("finance")),
  },
  {
    id: "estimate-params",
    title: "Estimate Params / Параметры tab",
    matches: (finding) =>
      includesAny(finding.filePath, [
        "features/projects/estimates/components/tabs/EstimateParams",
        "features/projects/estimates/screens/EstimateParametersScreen",
        "features/projects/estimates/types/room-params",
      ]) || (isEstimatePath(finding) && includesAny(finding.filePath.toLowerCase(), ["params", "parameters", "room-params"])),
  },
  {
    id: "estimate-docs",
    title: "Estimate Docs / Документы tab",
    matches: (finding) =>
      includesAny(finding.filePath, [
        "features/projects/estimates/components/tabs/EstimateDocuments",
        "features/projects/estimates/screens/EstimateDocsScreen",
      ]) || (isEstimatePath(finding) && finding.filePath.toLowerCase().includes("doc")),
  },
  {
    id: "dashboard-cards-charts",
    title: "Dashboard cards and charts",
    matches: (finding) => finding.filePath.includes("dashboard") || finding.filePath.includes("Dashboard"),
  },
  {
    id: "global-purchases",
    title: "Global purchases",
    matches: (finding) => finding.filePath.includes("global-purchases") || finding.filePath.includes("GlobalPurchases"),
  },
  {
    id: "permissions",
    title: "Permissions matrix",
    matches: (finding) => finding.filePath.includes("permissions"),
  },
]

function formatCounts(counts: Record<string, number> | undefined, options: { includeZeroKeys?: string[] } = {}): string {
  const merged = { ...(counts ?? {}) }
  for (const key of options.includeZeroKeys ?? []) merged[key] = merged[key] ?? 0

  const entries = Object.entries(merged)
    .filter(([key, count]) => count > 0 || (options.includeZeroKeys ?? []).includes(key))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

  if (entries.length === 0) return "- none"
  return entries.map(([name, count]) => `- ${name}: ${count}`).join("\n")
}

function countBy(findings: Finding[], key: keyof Pick<Finding, "severity" | "category" | "surface">): Record<string, number> {
  return findings.reduce<Record<string, number>>((acc, finding) => {
    const value = finding[key]
    acc[value] = (acc[value] ?? 0) + 1
    return acc
  }, {})
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

function escapeCell(value: unknown): string {
  return String(value ?? "").replace(/\|/g, "\\|")
}

function formatFindingTable(findings: Finding[], limit: number): string {
  if (findings.length === 0) return "_No findings._"

  const rows = findings.slice(0, limit).map((finding) => {
    return `| ${finding.severity} | ${finding.category} | ${finding.surface} | \`${finding.filePath}:${finding.line}\` | \`${escapeCell(finding.token)}\` |`
  })

  const suffix = findings.length > limit ? `\n\n_Showing ${limit} of ${findings.length} findings._` : ""
  return [
    "| Severity | Category | Surface | Location | Token |",
    "| --- | --- | --- | --- | --- |",
    ...rows,
  ].join("\n") + suffix
}

function summarizeFocusArea(area: FocusArea, findings: Finding[]): string {
  const areaFindings = findings.filter(area.matches).sort(compareFindings)
  const highPriority = areaFindings.filter((finding) => finding.severity === "critical" || finding.severity === "high")
  const prioritized = highPriority.length > 0 ? highPriority : areaFindings

  return `### ${area.title}

- Findings: ${areaFindings.length}
- High/Critical findings: ${highPriority.length}

Severity:
${formatCounts(countBy(areaFindings, "severity"))}

Categories:
${formatCounts(countBy(areaFindings, "category"))}

Top findings:
${formatFindingTable(prioritized, 15)}
`
}

function main(): void {
  if (!fs.existsSync(REPORT_JSON_PATH)) {
    throw new Error(`Missing audit report: ${path.relative(ROOT, REPORT_JSON_PATH)}`)
  }

  const report = JSON.parse(fs.readFileSync(REPORT_JSON_PATH, "utf8")) as AuditReport
  const findings = [...(report.findings ?? [])].sort(compareFindings)
  const highPriority = findings.filter((finding) => finding.severity === "critical" || finding.severity === "high")
  const scanRoots = report.scanRoots ?? []
  const rootsLabel = scanRoots.length > 0 ? scanRoots.map((root) => `\`${root}\``).join(", ") : "_not reported_"

  const markdown = `${COMMENT_MARKER}
## UI Visual Audit report

Generated at: ${report.generatedAt}

- Scanned files: ${report.scannedFiles}
- Total findings: ${report.totalFindings}
- Scan roots: ${rootsLabel}

### Scanned root counts
${formatCounts(report.scannedRootCounts, { includeZeroKeys: scanRoots })}

### Severity counts
${formatCounts(report.severityCounts)}

### Category counts
${formatCounts(report.categoryCounts)}

### Surface counts
${formatCounts(report.surfaceCounts)}

### Top high-priority findings
${formatFindingTable(highPriority, 20)}

## Focus areas

${FOCUS_AREAS.map((area) => summarizeFocusArea(area, findings)).join("\n")}
`

  fs.mkdirSync(path.dirname(SUMMARY_MD_PATH), { recursive: true })
  fs.writeFileSync(SUMMARY_MD_PATH, markdown)
  console.log(`UI visual audit summary written to ${path.relative(ROOT, SUMMARY_MD_PATH)}`)
}

main()
