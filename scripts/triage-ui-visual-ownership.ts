import fs from "node:fs"
import path from "node:path"

type Severity = "critical" | "high" | "medium" | "low"
type MigrationPriority = "P1" | "P2" | "P3" | "P4"
type MigrationDisposition = "migrate-to-shared" | "classify-shared-contract" | "accepted-shared" | "marketing-contract" | "observe"

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

interface OwnershipGroup {
  id: string
  priority: MigrationPriority
  disposition: MigrationDisposition
  title: string
  filePath: string
  surface: string
  ownership: string
  findings: Finding[]
  findingCount: number
  categories: Record<string, number>
  severities: Record<Severity, number>
  recommendedSharedContract: string
  recommendedAction: string
}

const ROOT = process.cwd()
const SOURCE_REPORT_PATH = path.join(ROOT, "reports", "ui-visual-audit.json")
const OWNERSHIP_JSON_PATH = path.join(ROOT, "reports", "ui-visual-ownership.json")
const OWNERSHIP_MD_PATH = path.join(ROOT, "reports", "ui-visual-ownership.md")

const VISUAL_CATEGORIES = new Set([
  "padding-overlap",
  "color-overlap",
  "typography-overlap",
  "badge-overlap",
  "radius-overlap",
  "border-overlap",
  "shadow-overlap",
  "arbitrary-layout-overlap",
  "inline-style-overlap",
  "font-overlap",
  "ui-entrypoint-overlap",
])

const PRIORITY_ORDER: Record<MigrationPriority, number> = { P1: 0, P2: 1, P3: 2, P4: 3 }
const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }

const ACCEPTED_PRIMITIVE_SHARED_CONTRACT_OWNERS = new Set([
  "shared/ui/badge.tsx",
  "shared/ui/button.tsx",
  "shared/ui/card.tsx",
  "shared/ui/data-table.tsx",
  "shared/ui/dialog.tsx",
  "shared/ui/form.tsx",
  "shared/ui/form-layout.tsx",
  "shared/ui/input.tsx",
  "shared/ui/label.tsx",
  "shared/ui/select.tsx",
  "shared/ui/sheet.tsx",
  "shared/ui/textarea.tsx",
])

const ACCEPTED_FEATURE_FAMILY_SHARED_CONTRACT_OWNERS = new Set([
  "shared/ui/admin-surface.tsx",
  "shared/ui/dense-list.tsx",
  "shared/ui/estimate-tab.tsx",
])

const ACCEPTED_SHARED_CONTRACT_PREFIXES = ["shared/ui/shells/"]

function classifySharedContractOwnership(filePath: string, ownership: string): string {
  if (ownership === "primitive-contract" || ownership === "feature-family-contract" || ownership === "canonical-token") {
    return ownership
  }

  if (ACCEPTED_PRIMITIVE_SHARED_CONTRACT_OWNERS.has(filePath)) return "primitive-contract"

  if (
    ACCEPTED_FEATURE_FAMILY_SHARED_CONTRACT_OWNERS.has(filePath) ||
    ACCEPTED_SHARED_CONTRACT_PREFIXES.some((prefix) => filePath.startsWith(prefix))
  ) {
    return "feature-family-contract"
  }

  return ownership
}

function acceptedSharedContractOwners(): string[] {
  return [
    ...ACCEPTED_PRIMITIVE_SHARED_CONTRACT_OWNERS,
    ...ACCEPTED_FEATURE_FAMILY_SHARED_CONTRACT_OWNERS,
    ...ACCEPTED_SHARED_CONTRACT_PREFIXES.map((prefix) => `${prefix}*`),
  ].sort()
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

function recommendedSharedContractFor(filePath: string, categories: Record<string, number>): string {
  const pathAndCategories = `${filePath} ${Object.keys(categories).join(" ")}`.toLowerCase()

  if (pathAndCategories.includes("badge") || pathAndCategories.includes("status") || categories["badge-overlap"]) {
    return "shared/ui/badge.tsx + shared/ui/status-badge.tsx"
  }

  if (pathAndCategories.includes("table") || pathAndCategories.includes("columns") || pathAndCategories.includes("cell")) {
    return "shared/ui/data-table.tsx + shared/ui/cells/* + shared/ui/table-density.ts"
  }

  if (pathAndCategories.includes("dialog") || pathAndCategories.includes("sheet") || pathAndCategories.includes("popover")) {
    return "shared/ui/dialog.tsx / sheet.tsx / popover.tsx layout contracts"
  }

  if (pathAndCategories.includes("toolbar") || pathAndCategories.includes("filter") || pathAndCategories.includes("search")) {
    return "shared/ui/toolbar.tsx + shared/ui/filter-bar.tsx"
  }

  if (pathAndCategories.includes("card") || pathAndCategories.includes("surface") || pathAndCategories.includes("dashboard")) {
    return "shared/ui/surface.tsx + shared/ui/card-shell.tsx"
  }

  if (pathAndCategories.includes("form") || pathAndCategories.includes("input") || pathAndCategories.includes("field")) {
    return "shared/ui/form-layout.tsx + shared/ui/input.tsx"
  }

  if (categories["padding-overlap"] || categories["arbitrary-layout-overlap"]) {
    return "shared/ui/surface.tsx + shared/ui/layout-density.ts"
  }

  if (categories["color-overlap"] || categories["typography-overlap"] || categories["radius-overlap"] || categories["shadow-overlap"]) {
    return "shared/ui visual tokens + composed component variants"
  }

  return "shared/ui component-specific visual contract"
}

function classifyPriority(findings: Finding[]): MigrationPriority {
  const filePath = findings[0]?.filePath ?? "unknown"
  const ownership = classifySharedContractOwnership(filePath, findings[0]?.ownership ?? "unknown")
  const surface = findings[0]?.surface ?? "unknown"
  const categories = countBy(findings, (finding) => finding.category)
  const hasBusinessRuntimeDrift = ownership === "business-runtime-drift"
  const hasCoreVisualRecipe = Boolean(
    categories["padding-overlap"] ||
      categories["color-overlap"] ||
      categories["badge-overlap"] ||
      categories["typography-overlap"] ||
      categories["radius-overlap"] ||
      categories["arbitrary-layout-overlap"]
  )

  if (hasBusinessRuntimeDrift && findings.length >= 10 && hasCoreVisualRecipe) return "P1"
  if (hasBusinessRuntimeDrift && hasCoreVisualRecipe) return "P2"
  if (surface === "shared-ui" && ownership === "unknown") return "P2"
  if (ownership === "marketing-auth-exception") return "P3"
  return "P4"
}

function classifyDisposition(findings: Finding[], priority: MigrationPriority): MigrationDisposition {
  const filePath = findings[0]?.filePath ?? "unknown"
  const ownership = classifySharedContractOwnership(filePath, findings[0]?.ownership ?? "unknown")
  const surface = findings[0]?.surface ?? "unknown"

  if (ownership === "business-runtime-drift") return "migrate-to-shared"
  if (surface === "shared-ui" && ownership === "unknown") return "classify-shared-contract"
  if (ownership === "primitive-contract" || ownership === "feature-family-contract" || ownership === "canonical-token") return "accepted-shared"
  if (ownership === "marketing-auth-exception") return "marketing-contract"
  if (priority === "P1" || priority === "P2") return "migrate-to-shared"
  return "observe"
}

function recommendedActionFor(group: Omit<OwnershipGroup, "recommendedAction">): string {
  if (group.disposition === "migrate-to-shared") {
    return "Move visual constants out of this app/feature file. The component should select semantic variants, statuses, density, or slots; shared UI should own padding, colors, typography, radius, borders, shadows, and icon sizing."
  }

  if (group.disposition === "classify-shared-contract") {
    return "Either register this file as an accepted shared visual contract owner or refactor its raw classes into a narrower shared primitive/composed contract."
  }

  if (group.disposition === "accepted-shared") {
    return "Keep as shared-owned visual contract. Changes here are expected to cascade across project UI."
  }

  if (group.disposition === "marketing-contract") {
    return "Do not normalize blindly to runtime app UI. Extract or document a dedicated marketing/auth visual contract if these recipes should be centrally controlled."
  }

  return "Keep visible in the report until a migration batch decides whether this is a real shared ownership issue."
}

function groupByFile(findings: Finding[]): Map<string, Finding[]> {
  const groups = new Map<string, Finding[]>()
  for (const finding of findings) {
    const existing = groups.get(finding.filePath) ?? []
    existing.push(finding)
    groups.set(finding.filePath, existing)
  }
  return groups
}

function compareFindings(a: Finding, b: Finding): number {
  return (
    SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
    a.category.localeCompare(b.category) ||
    a.line - b.line ||
    a.token.localeCompare(b.token)
  )
}

function buildGroups(findings: Finding[]): OwnershipGroup[] {
  return Array.from(groupByFile(findings).entries())
    .map(([filePath, fileFindings], index) => {
      const categories = countBy(fileFindings, (finding) => finding.category)
      const priority = classifyPriority(fileFindings)
      const ownership = classifySharedContractOwnership(filePath, fileFindings[0]?.ownership ?? "unknown")
      const baseGroup = {
        id: `UI-OWNERSHIP-${String(index + 1).padStart(3, "0")}`,
        priority,
        disposition: classifyDisposition(fileFindings, priority),
        title: `Visual ownership migration for ${filePath}`,
        filePath,
        surface: fileFindings[0]?.surface ?? "unknown",
        ownership,
        findings: [...fileFindings].sort(compareFindings),
        findingCount: fileFindings.length,
        categories,
        severities: countSeverities(fileFindings),
        recommendedSharedContract: recommendedSharedContractFor(filePath, categories),
      }

      return {
        ...baseGroup,
        recommendedAction: recommendedActionFor(baseGroup),
      }
    })
    .sort((a, b) => {
      return (
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        b.findingCount - a.findingCount ||
        a.filePath.localeCompare(b.filePath)
      )
    })
}

function formatRecord(record: Record<string, number>): string {
  const entries = Object.entries(record).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  return entries.length > 0 ? entries.map(([key, value]) => `${key}: ${value}`).join(", ") : "none"
}

function formatFinding(finding: Finding): string {
  const token = String(finding.token).replace(/`/g, "'").replace(/\|/g, "\\|")
  return `\`${finding.filePath}:${finding.line}\` — ${finding.severity} / ${finding.category} / \`${token}\``
}

function priorityCounts(groups: OwnershipGroup[]): Record<MigrationPriority, number> {
  return {
    P1: groups.filter((group) => group.priority === "P1").length,
    P2: groups.filter((group) => group.priority === "P2").length,
    P3: groups.filter((group) => group.priority === "P3").length,
    P4: groups.filter((group) => group.priority === "P4").length,
  }
}

function dispositionCounts(groups: OwnershipGroup[]): Record<MigrationDisposition, number> {
  return {
    "migrate-to-shared": groups.filter((group) => group.disposition === "migrate-to-shared").length,
    "classify-shared-contract": groups.filter((group) => group.disposition === "classify-shared-contract").length,
    "accepted-shared": groups.filter((group) => group.disposition === "accepted-shared").length,
    "marketing-contract": groups.filter((group) => group.disposition === "marketing-contract").length,
    observe: groups.filter((group) => group.disposition === "observe").length,
  }
}

function formatMatrix(groups: OwnershipGroup[]): string {
  if (groups.length === 0) return "_No visual ownership migration groups._"

  const rows = groups.map((group) => {
    return `| ${group.id} | ${group.priority} | ${group.disposition} | \`${group.filePath}\` | ${group.findingCount} | ${group.ownership} | ${formatRecord(group.categories).replace(/\|/g, "\\|")} | ${group.recommendedSharedContract.replace(/\|/g, "\\|")} |`
  })

  return [
    "| ID | Priority | Disposition | File | Findings | Current owner | Categories | Target shared contract |",
    "| --- | --- | --- | --- | ---: | --- | --- | --- |",
    ...rows,
  ].join("\n")
}

function formatDetails(groups: OwnershipGroup[], limit = 50): string {
  if (groups.length === 0) return "_No visual ownership migration groups._"

  const body = groups
    .slice(0, limit)
    .map((group) => {
      return `### ${group.id} — ${group.priority} — ${group.disposition} — \`${group.filePath}\`

- Current owner: ${group.ownership}
- Surface: ${group.surface}
- Findings: ${group.findingCount}
- Categories: ${formatRecord(group.categories)}
- Severity: ${formatRecord(group.severities)}
- Target shared contract: ${group.recommendedSharedContract}
- Action: ${group.recommendedAction}

Sample evidence:
${group.findings.slice(0, 10).map((finding) => `- ${formatFinding(finding)}`).join("\n")}
`
    })
    .join("\n")

  const suffix = groups.length > limit ? `\n_Showing ${limit} of ${groups.length} groups. See \`reports/ui-visual-ownership.json\` for the full structured report._\n` : ""
  return `${body}${suffix}`
}

function main(): void {
  if (!fs.existsSync(SOURCE_REPORT_PATH)) {
    throw new Error(`Missing source report: ${path.relative(ROOT, SOURCE_REPORT_PATH)}`)
  }

  const report = JSON.parse(fs.readFileSync(SOURCE_REPORT_PATH, "utf8")) as AuditReport
  const visualFindings = (report.findings ?? []).filter((finding) => VISUAL_CATEGORIES.has(finding.category))
  const groups = buildGroups(visualFindings)
  const priorities = priorityCounts(groups)
  const dispositions = dispositionCounts(groups)
  const migrateFindings = groups
    .filter((group) => group.disposition === "migrate-to-shared")
    .reduce((total, group) => total + group.findingCount, 0)
  const acceptedOwners = acceptedSharedContractOwners()

  const ownershipReport = {
    generatedAt: new Date().toISOString(),
    sourceReportGeneratedAt: report.generatedAt,
    mode: "report-only",
    intent: "Track visual ownership migration from app/features into shared UI contracts.",
    scannedFiles: report.scannedFiles,
    totalVisualFindings: visualFindings.length,
    migrationGroupCount: groups.length,
    migrateToSharedFindings: migrateFindings,
    priorityCounts: priorities,
    dispositionCounts: dispositions,
    acceptedSharedContractOwners: acceptedOwners,
    sourceCategoryCounts: report.categoryCounts,
    sourceOwnershipCounts: report.ownershipCounts,
    groups,
  }

  fs.mkdirSync(path.dirname(OWNERSHIP_JSON_PATH), { recursive: true })
  fs.writeFileSync(OWNERSHIP_JSON_PATH, JSON.stringify(ownershipReport, null, 2))

  const markdown = `# UI Visual Ownership Migration Report

This report is generated from the primary \`audit:ui\` visual findings. It does not treat every raw finding as a bug. It answers one architectural question:

> Who currently owns the visual decision: shared UI contracts or app/feature components?

The target architecture is that shared UI contracts own padding, gap, height, typography, color, radius, border, shadow, icon size, and density. App/features should select semantic variants, statuses, density, and slots only.

- Source report generated at: ${report.generatedAt}
- Scanned files: ${report.scannedFiles}
- Total visual findings: ${visualFindings.length}
- Migration groups: ${groups.length}
- Findings currently marked for migration to shared: ${migrateFindings}

## Priority counts

- P1: ${priorities.P1}
- P2: ${priorities.P2}
- P3: ${priorities.P3}
- P4: ${priorities.P4}

## Disposition counts

- migrate-to-shared: ${dispositions["migrate-to-shared"]}
- classify-shared-contract: ${dispositions["classify-shared-contract"]}
- accepted-shared: ${dispositions["accepted-shared"]}
- marketing-contract: ${dispositions["marketing-contract"]}
- observe: ${dispositions.observe}

## Accepted shared contract owners

${acceptedOwners.map((owner) => `- \`${owner}\``).join("\n")}

## How to read this report

- \`migrate-to-shared\`: app/feature code currently owns visual constants and should be migrated into shared contracts.
- \`classify-shared-contract\`: shared UI file uses visual constants but is not yet classified as an accepted owner.
- \`accepted-shared\`: shared UI already owns the visual decision; changing it should intentionally cascade across the product.
- \`marketing-contract\`: landing/auth visual recipes should be extracted to a dedicated marketing/auth contract or explicitly accepted.
- \`observe\`: low-priority or compatibility signal.

## Migration matrix

${formatMatrix(groups)}

## Migration details

${formatDetails(groups, 50)}
`

  fs.writeFileSync(OWNERSHIP_MD_PATH, markdown)
  console.log(`UI visual ownership report written to ${path.relative(ROOT, OWNERSHIP_JSON_PATH)}`)
  console.log(`UI visual ownership markdown written to ${path.relative(ROOT, OWNERSHIP_MD_PATH)}`)
}

main()
