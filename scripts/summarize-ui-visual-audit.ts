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
  "badge-overlap": 2,
  "padding-overlap": 3,
  "color-overlap": 4,
  "radius-overlap": 5,
  "border-overlap": 6,
  "shadow-overlap": 7,
  "typography-overlap": 8,
  "inline-style-overlap": 9,
  "arbitrary-layout-overlap": 10,
}

function includesAny(filePath: string, parts: string[]): boolean {
  return parts.some((part) => filePath.includes(part))
}

function lowerPath(finding: Finding): string {
  return finding.filePath.toLowerCase()
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
  if (screenIndex >= 0 && rest[screenIndex + 1]) {
    return `${feature}/screen/${stripExtension(rest.slice(screenIndex + 1).join("/"))}`
  }

  const tabsIndex = rest.indexOf("tabs")
  if (tabsIndex >= 0 && rest[tabsIndex + 1]) {
    return `${feature}/tab/${stripExtension(rest.slice(tabsIndex + 1).join("/"))}`
  }

  const layoutsIndex = rest.indexOf("layouts")
  if (layoutsIndex >= 0 && rest[layoutsIndex + 1]) {
    return `${feature}/layout/${stripExtension(rest.slice(layoutsIndex + 1).join("/"))}`
  }

  const componentsIndex = rest.indexOf("components")
  if (componentsIndex >= 0 && rest[componentsIndex + 1]) {
    return `${feature}/component/${stripExtension(rest.slice(componentsIndex + 1).join("/"))}`
  }

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

function isEstimatePath(finding: Finding): boolean {
  return (
    finding.filePath.startsWith("features/projects/estimates/") ||
    finding.filePath.startsWith("features/estimates/") ||
    /^app\/.*estimates/u.test(finding.filePath)
  )
}

function isProjectPath(finding: Finding): boolean {
  return (
    finding.filePath.startsWith("features/projects/") ||
    finding.filePath.startsWith("app/(workspace)/app/projects") ||
    finding.filePath.startsWith("app/projects")
  )
}

function isProjectNonEstimatePath(finding: Finding): boolean {
  return isProjectPath(finding) && !isEstimatePath(finding)
}

function isBadgeFinding(finding: Finding): boolean {
  const target = `${finding.filePath} ${finding.category} ${finding.token}`.toLowerCase()
  return (
    finding.category === "badge-overlap" ||
    target.includes("badge") ||
    target.includes("chip") ||
    target.includes("pill") ||
    target.includes("status") ||
    target.includes("статус")
  )
}

function isPaddingFinding(finding: Finding): boolean {
  return finding.category === "padding-overlap"
}

function isDataTableFinding(finding: Finding): boolean {
  const target = lowerPath(finding)
  return (
    target.includes("datatable") ||
    target.includes("data-table") ||
    target.includes("table") ||
    target.includes("columns") ||
    target.includes("cell") ||
    target.includes("row")
  )
}

function isCardFinding(finding: Finding): boolean {
  const target = lowerPath(finding)
  return target.includes("card") || target.includes("cards/") || target.includes("projectcard")
}

function isFormSheetDialogFinding(finding: Finding): boolean {
  const target = lowerPath(finding)
  return (
    target.includes("sheet") ||
    target.includes("dialog") ||
    target.includes("form") ||
    target.includes("drawer") ||
    target.includes("modal") ||
    target.includes("create") ||
    target.includes("edit")
  )
}

const FOCUS_AREAS: FocusArea[] = [
  { id: "runtime-feature-screens", title: "All runtime feature screens", matches: (finding) => finding.surface === "feature" || finding.surface === "app" || finding.surface === "entity" },
  { id: "badges-status-chips", title: "Badges / status chips / pills", matches: isBadgeFinding },
  { id: "internal-padding", title: "Internal padding / component density", matches: isPaddingFinding },
  { id: "tables-datatables-cells", title: "Tables / DataTables / cells", matches: isDataTableFinding },
  { id: "cards-compact-surfaces", title: "Cards / compact card surfaces", matches: isCardFinding },
  { id: "forms-sheets-dialogs", title: "Forms / Sheets / Dialogs", matches: isFormSheetDialogFinding },
  {
    id: "admin-all",
    title: "Admin / all admin surfaces",
    matches: (finding) => finding.filePath.startsWith("app/(admin)/") || finding.filePath.startsWith("features/admin/"),
  },
  { id: "admin-tenants", title: "Admin / tenants", matches: (finding) => finding.filePath.startsWith("app/(admin)/") && lowerPath(finding).includes("tenant") },
  { id: "admin-activity", title: "Admin / activity", matches: (finding) => finding.filePath.startsWith("app/(admin)/") && lowerPath(finding).includes("activity") },
  { id: "admin-dashboard", title: "Admin / dashboard", matches: (finding) => finding.filePath.startsWith("app/(admin)/dashboard") },
  {
    id: "workspace-shell-navigation",
    title: "Workspace shell / navigation / layout",
    matches: (finding) =>
      includesAny(finding.filePath, ["app/(workspace)/", "components/layout/", "components/navigation/", "components/providers/", "features/navigation/"]) && !isEstimatePath(finding),
  },
  {
    id: "projects-list-cards",
    title: "Projects list / project cards",
    matches: (finding) => isProjectNonEstimatePath(finding) && includesAny(lowerPath(finding), ["projectcard", "projects/page", "project-list", "projectslist", "registry", "card"]),
  },
  {
    id: "project-dashboard",
    title: "Project dashboard",
    matches: (finding) => isProjectNonEstimatePath(finding) && includesAny(finding.filePath, ["features/projects/dashboard/", "ProjectDashboard", "DashboardChart"]),
  },
  { id: "estimate-module", title: "Estimate module / smeta", matches: isEstimatePath },
  { id: "estimate-padding-density", title: "Estimate internal padding / density", matches: (finding) => isEstimatePath(finding) && isPaddingFinding(finding) },
  { id: "estimate-badges-status-chips", title: "Estimate badges / statuses / chips", matches: (finding) => isEstimatePath(finding) && isBadgeFinding(finding) },
  { id: "estimate-shell-tabs-navigation", title: "Estimate shell and tab navigation", matches: (finding) => includesAny(finding.filePath, ["features/projects/estimates/screens/EstimateDetailsShell", "features/projects/estimates/layouts/EstimateDetailsLayout", "features/projects/estimates/components/EstimateHeader"]) },
  { id: "estimate-table", title: "Estimate table / Смета tab", matches: (finding) => includesAny(finding.filePath, ["features/projects/estimates/components/table/", "features/projects/estimates/components/EstimateTable", "features/projects/estimates/screens/EstimateDetailsShell"]) && !includesAny(finding.filePath, ["components/tabs/", "EstimateExecution", "EstimateProcurement", "EstimateFinance"]) },
  { id: "estimate-execution", title: "Estimate Execution / Выполнение tab", matches: (finding) => includesAny(finding.filePath, ["features/projects/estimates/components/tabs/EstimateExecution", "features/projects/estimates/screens/EstimateAccomplishmentScreen", "features/projects/estimates/types/execution"]) },
  { id: "estimate-procurement", title: "Estimate Procurement / Закупки tab", matches: (finding) => includesAny(finding.filePath, ["features/projects/estimates/components/tabs/EstimateProcurement", "features/projects/estimates/screens/EstimatePurchasesScreen", "features/projects/estimates/types/procurement"]) || (isEstimatePath(finding) && includesAny(lowerPath(finding), ["procurement", "purchase", "purchases"])) },
  { id: "estimate-finance", title: "Estimate Finance / Финансы tab", matches: (finding) => includesAny(finding.filePath, ["features/projects/estimates/components/tabs/EstimateFinance", "features/projects/estimates/types/finance"]) || (isEstimatePath(finding) && lowerPath(finding).includes("finance")) },
  { id: "estimate-params", title: "Estimate Params / Параметры tab", matches: (finding) => includesAny(finding.filePath, ["features/projects/estimates/components/tabs/EstimateParams", "features/projects/estimates/screens/EstimateParametersScreen", "features/projects/estimates/types/room-params"]) || (isEstimatePath(finding) && includesAny(lowerPath(finding), ["params", "parameters", "room-params"])) },
  { id: "estimate-docs", title: "Estimate Docs / Документы tab", matches: (finding) => includesAny(finding.filePath, ["features/projects/estimates/components/tabs/EstimateDocuments", "features/projects/estimates/screens/EstimateDocsScreen"]) || (isEstimatePath(finding) && lowerPath(finding).includes("doc")) },
  { id: "global-purchases", title: "Global purchases / Закупки", matches: (finding) => finding.filePath.includes("global-purchases") || finding.filePath.includes("GlobalPurchases") },
  { id: "materials-catalog", title: "Materials catalog / Материалы", matches: (finding) => finding.filePath.startsWith("features/materials/") || includesAny(lowerPath(finding), ["materials/page", "materialsscreen", "materialstable", "material-card"]) },
  { id: "works-catalog", title: "Works catalog / Работы", matches: (finding) => finding.filePath.startsWith("features/works/") || includesAny(lowerPath(finding), ["works/page", "worksscreen", "workstable"]) },
  { id: "material-suppliers", title: "Material suppliers / Поставщики материалов", matches: (finding) => finding.filePath.includes("material-suppliers") || finding.filePath.includes("MaterialSupplier") },
  { id: "counterparties", title: "Counterparties / Контрагенты", matches: (finding) => finding.filePath.includes("counterparties") || finding.filePath.includes("Counterpart") },
  { id: "shared-directory-catalog-shells", title: "Shared directory/catalog shells", matches: (finding) => includesAny(finding.filePath, ["features/_shared/directories/", "features/_shared/guide-catalog/", "shared/ui/shells/", "DirectoryListScreen", "CatalogScreenShell", "DataTableShell"]) },
  { id: "dashboard-analytics", title: "Dashboard / analytics widgets", matches: (finding) => includesAny(finding.filePath, ["features/dashboard/", "features/projects/dashboard/"]) || includesAny(lowerPath(finding), ["dashboard", "analytics", "chart"]) },
  { id: "permissions", title: "Permissions matrix", matches: (finding) => finding.filePath.includes("permissions") },
  { id: "auth-marketing-landing", title: "Auth / marketing / landing surfaces", matches: (finding) => finding.filePath === "app/page.tsx" || finding.filePath.includes("/(login)/") || finding.filePath.includes("/(marketing)/") || finding.filePath.startsWith("features/auth/") || includesAny(lowerPath(finding), ["login", "register", "sign-in", "sign-up", "pricing", "landing"]) },
  { id: "shared-ui-primitives", title: "Shared UI primitives / compatibility surfaces", matches: (finding) => finding.filePath.startsWith("shared/ui/") || finding.filePath.startsWith("components/ui/") || finding.filePath.startsWith("components/ui-primitives/") || finding.filePath.startsWith("packages/ui/") },
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

function topCategories(findings: Finding[], limit = 3): string {
  const entries = Object.entries(countBy(findings, "category")).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  if (entries.length === 0) return "none"
  return entries.slice(0, limit).map(([category, count]) => `${category}: ${count}`).join(", ")
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

function escapeCell(value: unknown): string {
  return String(value ?? "").replace(/\|/g, "\\|")
}

function formatFindingTable(findings: Finding[], limit: number): string {
  if (findings.length === 0) return "_No findings._"

  const rows = findings.slice(0, limit).map((finding) => {
    return `| ${finding.severity} | ${finding.category} | ${finding.surface} | \`${finding.filePath}:${finding.line}\` | \`${escapeCell(finding.token)}\` |`
  })

  const suffix = findings.length > limit ? `\n\n_Showing ${limit} of ${findings.length} findings._` : ""
  return ["| Severity | Category | Surface | Location | Token |", "| --- | --- | --- | --- | --- |", ...rows].join("\n") + suffix
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

Top findings:
${formatFindingTable(findings, 10)}
`
    })
    .join("\n")
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

### Top high-priority findings
${formatFindingTable(highPriority, 20)}

## Generated screen/file matrix

This matrix is generated from every finding path in the audit report. It is not a manually curated allowlist, so newly added screens appear automatically when they have findings.

${formatScreenMatrix(screenGroups)}

## Top screen/file details

${formatTopScreenDetails(screenGroups, 30)}

## Focus areas

${FOCUS_AREAS.map((area) => summarizeFocusArea(area, findings)).join("\n")}
`

  fs.mkdirSync(path.dirname(SUMMARY_MD_PATH), { recursive: true })
  fs.writeFileSync(SUMMARY_MD_PATH, markdown)
  console.log(`UI visual audit summary written to ${path.relative(ROOT, SUMMARY_MD_PATH)}`)
}

main()
