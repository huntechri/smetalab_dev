import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

type Severity = "critical" | "high" | "medium" | "low"
type Surface = "app" | "shared-ui" | "feature" | "entity" | "component" | "package" | "style" | "unknown"
type Ownership =
  | "canonical-token"
  | "primitive-contract"
  | "feature-family-contract"
  | "compatibility-surface"
  | "marketing-auth-exception"
  | "business-runtime-drift"
  | "unknown"

type ValidationStatus = "PASS" | "PASS_WITH_SHARED_RESIDUAL" | "REVIEW" | "FAIL"

interface Finding {
  filePath: string
  line: number
  category: string
  severity: Severity
  token: string
  reason: string
  surface: Surface
  ownership: Ownership
}

interface AuditReport {
  generatedAt: string
  scanRoots: string[]
  scannedFiles: number
  scannedRootCounts: Record<string, number>
  totalFindings: number
  severityCounts: Record<Severity, number>
  categoryCounts: Record<string, number>
  surfaceCounts: Record<Surface, number>
  ownershipCounts: Record<Ownership, number>
  staleReferences: Array<{ filePath: string; classification: "stale-reference"; reason: string }>
  acceptedSharedContractOwners: string[]
  postRefactorValidation: TargetValidation[]
  findings: Finding[]
}

interface AuditOptions {
  report: boolean
  strict: boolean
}

interface PatternRule {
  category: string
  defaultSeverity: Severity
  pattern: RegExp
  reason: string
  getSeverity?: (filePath: string, surface: Surface, token: string, ownership: Ownership) => Severity
}

interface TargetSurface {
  phase: string
  title: string
  expected: string
  featureMatchers: string[]
  sharedResidualOwners?: string[]
}

interface TargetValidation {
  phase: string
  title: string
  expected: string
  actualFindings: number
  highCriticalFindings: number
  status: ValidationStatus
  files: string[]
  sharedResidualOwners: string[]
}

const ROOT = process.cwd()
const SCAN_ROOTS = ["app", "components", "entities", "features", "shared", "packages", "styles", "widgets"]
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"])
const REPORT_JSON_PATH = path.join(ROOT, "reports", "ui-visual-audit.json")
const REPORT_MD_PATH = path.join(ROOT, "reports", "ui-visual-audit.md")

const EXCLUDED_SEGMENTS = new Set([
  "node_modules",
  ".next",
  ".vercel",
  "drizzle",
  "test-results",
  "coverage",
  "reports",
  "docs",
  ".agents",
  ".git",
  "dist",
  "build",
  "out",
  "playwright-report",
  "__tests__",
  "__mocks__",
  "__fixtures__",
  "fixtures",
])

const TEST_FILE_PATTERN = /(?:^|\/|\.)(test|spec)\.(tsx|ts|jsx|js|mjs|cjs)$/u

const ACCEPTED_PRIMITIVE_CONTRACT_OWNERS = new Set([
  "shared/ui/primitive-density.ts",
  "shared/ui/button.tsx",
  "shared/ui/badge.tsx",
  "shared/ui/input.tsx",
  "shared/ui/textarea.tsx",
  "shared/ui/input-group.tsx",
  "shared/ui/select.tsx",
  "shared/ui/tabs.tsx",
  "shared/ui/dialog.tsx",
  "shared/ui/alert-dialog.tsx",
  "shared/ui/sheet.tsx",
  "shared/ui/sidebar.tsx",
  "shared/ui/data-table.tsx",
  "shared/ui/command.tsx",
  "shared/ui/context-menu.tsx",
  "shared/ui/dropdown-menu.tsx",
  "shared/ui/menubar.tsx",
])

const ACCEPTED_FEATURE_FAMILY_CONTRACT_OWNERS = new Set([
  "shared/ui/dense-list.tsx",
  "shared/ui/dashboard-dynamics-chart.tsx",
  "shared/ui/workspace-tabs.tsx",
  "shared/ui/editable-data-surface.tsx",
  "shared/ui/kpi-card.tsx",
  "shared/ui/dashboard-layout.tsx",
  "shared/ui/admin-surface.tsx",
  "shared/ui/estimate-tab.tsx",
  "shared/ui/cells/directory-table-cells.tsx",
  "shared/ui/cells/table-cell-helpers.tsx",
  "shared/ui/shells/catalog-directory-visual-contracts.ts",
])

const ACCEPTED_SHARED_CONTRACT_OWNERS = new Set([
  ...ACCEPTED_PRIMITIVE_CONTRACT_OWNERS,
  ...ACCEPTED_FEATURE_FAMILY_CONTRACT_OWNERS,
])

const PHASE_TARGETS: TargetSurface[] = [
  {
    phase: "#175",
    title: "ProjectEstimatesCards visual contract",
    expected: "Feature surface absent from matrix or 0 findings; residuals owned by shared/ui/dense-list.tsx.",
    featureMatchers: ["features/projects/dashboard/components/ProjectEstimatesCards.tsx"],
    sharedResidualOwners: ["shared/ui/dense-list.tsx"],
  },
  {
    phase: "#176",
    title: "Dashboard dynamics charts",
    expected: "Feature chart files absent from matrix or 0 findings; residuals owned by dashboard-dynamics-chart.",
    featureMatchers: [
      "features/projects/dashboard/components/DashboardChart.tsx",
      "features/dashboard/components/HomeDynamicsChart.tsx",
    ],
    sharedResidualOwners: ["shared/ui/dashboard-dynamics-chart.tsx"],
  },
  {
    phase: "#177",
    title: "Estimate shell and table",
    expected: "EstimateDetailsShell and EstimateTable absent from matrix or 0 findings.",
    featureMatchers: [
      "features/projects/estimates/screens/EstimateDetailsShell.client.tsx",
      "features/projects/estimates/components/table/EstimateTable.client.tsx",
    ],
    sharedResidualOwners: ["shared/ui/workspace-tabs.tsx", "shared/ui/editable-data-surface.tsx"],
  },
  {
    phase: "#178",
    title: "Project dashboard/KPI surfaces",
    expected: "ProjectDashboard, DashboardKpiCards and removed DashboardDataTable should not own visual drift.",
    featureMatchers: [
      "features/projects/dashboard/screens/ProjectDashboard.tsx",
      "features/projects/dashboard/components/DashboardKpiCards.tsx",
      "features/projects/dashboard/components/DashboardDataTable.tsx",
    ],
    sharedResidualOwners: ["shared/ui/kpi-card.tsx", "shared/ui/dashboard-layout.tsx"],
  },
  {
    phase: "#179",
    title: "Global Purchases visual contract",
    expected: "Global purchases list/card/metric/table files should delegate repeated recipes to dense-list.",
    featureMatchers: [
      "features/global-purchases/components/GlobalPurchasesView.client.tsx",
      "features/global-purchases/components/GlobalPurchasesCardsList.tsx",
      "features/global-purchases/components/GlobalPurchasesSummary.tsx",
      "features/global-purchases/components/cards/GlobalPurchaseCard.tsx",
      "features/global-purchases/components/cards/PurchaseMetric.tsx",
      "features/global-purchases/components/cards/ProjectPicker.tsx",
      "features/global-purchases/components/cards/SupplierPicker.tsx",
      "features/global-purchases/components/global-purchases-columns.tsx",
    ],
    sharedResidualOwners: ["shared/ui/dense-list.tsx"],
  },
  {
    phase: "#180",
    title: "Admin tenant/activity/pricing surfaces",
    expected: "Admin app/feature files should not contain local visual recipes; residuals owned by admin-surface.",
    featureMatchers: ["app/(admin)/", "features/admin/"],
    sharedResidualOwners: ["shared/ui/admin-surface.tsx"],
  },
  {
    phase: "#181",
    title: "Estimate Execution and Procurement tabs",
    expected: "Execution and Procurement feature files absent from matrix or 0 findings; residuals owned by estimate-tab.",
    featureMatchers: [
      "features/projects/estimates/components/tabs/EstimateExecution.tsx",
      "features/projects/estimates/components/tabs/EstimateProcurement.tsx",
    ],
    sharedResidualOwners: ["shared/ui/estimate-tab.tsx"],
  },
  {
    phase: "#182",
    title: "Catalog and directory contracts",
    expected: "Catalog/directory feature surfaces absent from matrix or 0 findings; residuals owned by catalog-directory contracts.",
    featureMatchers: [
      "features/works/components/columns.tsx",
      "features/materials/components/columns.tsx",
      "features/works/components/WorksSidebar.tsx",
      "features/materials/components/MaterialsSidebar.tsx",
      "features/material-suppliers/components/CreateMaterialSupplierSheet.tsx",
      "features/material-suppliers/components/columns.tsx",
      "features/counterparties/components/columns.tsx",
      "features/_shared/directories/components/directory-entity-sheet-shell.tsx",
      "features/_shared/guide-catalog/components/CatalogScreenShell.tsx",
      "features/_shared/guide-catalog/components/CatalogToolbar.tsx",
    ],
    sharedResidualOwners: [
      "shared/ui/cells/directory-table-cells.tsx",
      "shared/ui/shells/catalog-directory-visual-contracts.ts",
    ],
  },
  {
    phase: "#183",
    title: "Shared UI primitive density baseline",
    expected: "Shared primitive residuals are classified as primitive-contract or feature-family-contract with High/Critical = 0.",
    featureMatchers: ["shared/ui/primitive-density.ts"],
    sharedResidualOwners: ["shared/ui/primitive-density.ts"],
  },
  {
    phase: "#184",
    title: "Auth, landing and low-priority app surfaces",
    expected: "Auth/landing/global findings are reported as exception candidates, not business runtime blockers.",
    featureMatchers: [
      "app/page.tsx",
      "app/not-found.tsx",
      "features/auth/",
      "app/(login)/",
      "app/login/",
      "app/forgot-password/",
      "app/reset-password/",
      "app/verify-email/",
    ],
  },
]

const TAILWIND_PALETTE_NAMES = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
].join("|")

const COLOR_PREFIXES = "bg|text|border|ring|from|via|to|fill|stroke|decoration|outline"
const LAYOUT_PREFIXES = "w|h|min-w|max-w|min-h|max-h|gap|gap-x|gap-y|space-x|space-y|mx|my|mt|mr|mb|ml|m|top|right|bottom|left|inset|translate-x|translate-y"
const PADDING_PREFIXES = "p|px|py|pt|pr|pb|pl"
const BADGE_SYMBOLS = "Badge|badgeVariants|StatusBadge|StatusPill|BadgeCell|StatusCell|statusBadge|statusPill|badgeClassName|chipClassName|pillClassName"
const BADGE_STYLE_MARKERS = "rounded-full|rounded-2xl|rounded-xl|inline-flex|items-center|whitespace-nowrap"

function parseArgs(argv: string[]): AuditOptions {
  const args = new Set(argv)
  return {
    report: args.has("--report") || args.has("--strict"),
    strict: args.has("--strict"),
  }
}

function toPosix(filePath: string): string {
  return filePath.split(path.sep).join("/")
}

function getRootName(relativePath: string): string {
  return relativePath.split("/")[0] || "unknown"
}

function isExcludedPath(relativePath: string): boolean {
  return relativePath.split("/").some((segment) => EXCLUDED_SEGMENTS.has(segment)) || TEST_FILE_PATTERN.test(relativePath)
}

function classifySurface(relativePath: string): Surface {
  if (relativePath.startsWith("shared/ui/")) return "shared-ui"
  if (relativePath.startsWith("app/")) return "app"
  if (relativePath.startsWith("features/")) return "feature"
  if (relativePath.startsWith("entities/")) return "entity"
  if (relativePath.startsWith("components/")) return "component"
  if (relativePath.startsWith("packages/")) return "package"
  if (relativePath.startsWith("styles/")) return "style"
  return "unknown"
}

function isMarketingOrAuthSurface(relativePath: string): boolean {
  return (
    relativePath === "app/page.tsx" ||
    relativePath.includes("/(login)/") ||
    relativePath.includes("/(marketing)/") ||
    relativePath.includes("/landing") ||
    relativePath.startsWith("features/auth/") ||
    relativePath.startsWith("app/(login)/") ||
    relativePath.startsWith("app/(marketing)/") ||
    relativePath.startsWith("app/login/") ||
    relativePath.startsWith("app/register/") ||
    relativePath.startsWith("app/pricing/") ||
    relativePath.startsWith("app/sign-in/") ||
    relativePath.startsWith("app/sign-up/") ||
    relativePath.startsWith("app/forgot-password/") ||
    relativePath.startsWith("app/reset-password/") ||
    relativePath.startsWith("app/verify-email/") ||
    relativePath.startsWith("app/invitations/")
  )
}

function classifyOwnership(relativePath: string, surface: Surface): Ownership {
  if (relativePath === "app/globals.css" || relativePath === "app/layout.tsx" || relativePath.startsWith("styles/tokens/")) {
    return "canonical-token"
  }
  if (ACCEPTED_PRIMITIVE_CONTRACT_OWNERS.has(relativePath)) return "primitive-contract"
  if (ACCEPTED_FEATURE_FAMILY_CONTRACT_OWNERS.has(relativePath)) return "feature-family-contract"
  if (relativePath.startsWith("components/ui/") || relativePath.startsWith("packages/ui/")) return "compatibility-surface"
  if (isMarketingOrAuthSurface(relativePath)) return "marketing-auth-exception"
  if (surface === "app" || surface === "feature" || surface === "entity") return "business-runtime-drift"
  if (surface === "shared-ui") return "unknown"
  return "unknown"
}

function isAcceptedSharedContract(relativePath: string): boolean {
  return ACCEPTED_SHARED_CONTRACT_OWNERS.has(relativePath)
}

function isCanonicalTokenFile(relativePath: string): boolean {
  return (
    relativePath === "app/globals.css" ||
    relativePath === "app/layout.tsx" ||
    relativePath.startsWith("styles/tokens/") ||
    isAcceptedSharedContract(relativePath) ||
    relativePath.startsWith("components/ui/") ||
    relativePath.startsWith("packages/ui/")
  )
}

function isBusinessRuntimeSurface(surface: Surface, relativePath: string): boolean {
  if (isMarketingOrAuthSurface(relativePath)) return false
  return surface === "app" || surface === "feature" || surface === "entity"
}

function downgradeForMarketingAuth(severity: Severity, relativePath: string): Severity {
  if (!isMarketingOrAuthSurface(relativePath)) return severity
  if (severity === "critical" || severity === "high") return "medium"
  if (severity === "medium") return "low"
  return severity
}

function severityForColor(filePath: string, surface: Surface, _token: string, ownership: Ownership): Severity {
  if (ownership === "canonical-token" || ownership === "primitive-contract" || ownership === "feature-family-contract") return "low"
  if (isBusinessRuntimeSurface(surface, filePath)) return downgradeForMarketingAuth("high", filePath)
  return "medium"
}

function severityForBorder(filePath: string, surface: Surface, _token: string, ownership: Ownership): Severity {
  if (ownership === "canonical-token" || ownership === "primitive-contract" || ownership === "feature-family-contract") return "low"
  if (isBusinessRuntimeSurface(surface, filePath)) return downgradeForMarketingAuth("medium", filePath)
  return "low"
}

function severityForRadius(filePath: string, surface: Surface, _token: string, ownership: Ownership): Severity {
  if (ownership === "primitive-contract" || ownership === "feature-family-contract") return "low"
  if (isBusinessRuntimeSurface(surface, filePath)) return downgradeForMarketingAuth("high", filePath)
  return "medium"
}

function severityForFont(filePath: string, surface: Surface): Severity {
  if (filePath === "app/layout.tsx" || filePath === "app/globals.css") return "low"
  if (surface === "feature" || surface === "entity") return "high"
  if (surface === "app") return downgradeForMarketingAuth("medium", filePath)
  return "medium"
}

function severityForEntrypoint(filePath: string, surface: Surface, token: string): Severity {
  if (token.startsWith("@radix-ui/") && surface === "shared-ui") return "low"
  if (surface === "component" || surface === "package") return "medium"
  if (isBusinessRuntimeSurface(surface, filePath)) return "high"
  return "medium"
}

function severityForBadge(filePath: string, surface: Surface, _token: string, ownership: Ownership): Severity {
  if (ownership === "primitive-contract" || ownership === "feature-family-contract") return "low"
  if (isCanonicalTokenFile(filePath)) return "low"
  if (isBusinessRuntimeSurface(surface, filePath)) return downgradeForMarketingAuth("medium", filePath)
  return "low"
}

function severityForPadding(filePath: string, surface: Surface, token: string, ownership: Ownership): Severity {
  if (ownership === "primitive-contract" || ownership === "feature-family-contract" || ownership === "canonical-token") return "low"
  const isCompactPadding = /\b(?:p|px|py|pt|pr|pb|pl)-(?:0|0\.5|1|1\.5|2|\[[^\]]+\])\b/.test(token)
  if (isBusinessRuntimeSurface(surface, filePath)) return downgradeForMarketingAuth(isCompactPadding ? "medium" : "low", filePath)
  return "low"
}

function reasonSuffix(relativePath: string, ownership: Ownership): string {
  if (ownership === "canonical-token") return " Classified as canonical token/global ownership surface."
  if (ownership === "primitive-contract") return " Classified as accepted primitive-level shared UI contract owner."
  if (ownership === "feature-family-contract") return " Classified as accepted feature-family visual contract owner after #175-#184 cleanup."
  if (ownership === "compatibility-surface") return " Classified as compatibility surface; keep visible but do not treat as primary runtime drift."
  if (ownership === "marketing-auth-exception") return " Marketing/auth/landing surface: reported as exception candidate with downgraded severity."
  return ""
}

const RULES: PatternRule[] = [
  {
    category: "ui-entrypoint-overlap",
    defaultSeverity: "high",
    pattern: /from\s+["'](@\/components\/ui\/[^"']+|@repo\/ui(?:\/[^"']*)?)["']|import\s+["'](@repo\/ui(?:\/[^"']*)?|@\/components\/ui\/[^"']+)["']/g,
    reason: "Runtime code should import canonical primitives from @/shared/ui/*; components/ui and @repo/ui are compatibility entrypoints.",
    getSeverity: severityForEntrypoint,
  },
  {
    category: "ui-entrypoint-overlap",
    defaultSeverity: "high",
    pattern: /from\s+["'](@radix-ui\/[^"']+)["']|import\s+["'](@radix-ui\/[^"']+)["']/g,
    reason: "Direct Radix imports should stay inside canonical shared/ui primitives unless explicitly reviewed.",
    getSeverity: severityForEntrypoint,
  },
  {
    category: "font-overlap",
    defaultSeverity: "high",
    pattern: /\[font-family:[^\]]+\]|\bfont-\[[^\]]+\]|font-family\s*:\s*[^;]+/g,
    reason: "Font ownership should be centralized in app/layout.tsx and app/globals.css, not feature-local UI.",
    getSeverity: severityForFont,
  },
  {
    category: "badge-overlap",
    defaultSeverity: "medium",
    pattern: new RegExp(`\\b(?:${BADGE_SYMBOLS})\\b`, "g"),
    reason: "Badge/status/chip usage is tracked separately. Prefer shared badge variants and avoid feature-local visual recipes.",
    getSeverity: severityForBadge,
  },
  {
    category: "badge-overlap",
    defaultSeverity: "medium",
    pattern: new RegExp(`\\b(?:${BADGE_STYLE_MARKERS})\\b(?=.*\\b(?:${COLOR_PREFIXES})-(?:${TAILWIND_PALETTE_NAMES})-(?:50|100|200|300|400|500|600|700|800|900|950)|.*\\b(?:${COLOR_PREFIXES})-\\[#(?:[0-9a-fA-F]{3,8})\\])`, "g"),
    reason: "Badge-like pill/chip class recipe with local color styling should be normalized to shared badge variants.",
    getSeverity: severityForBadge,
  },
  {
    category: "padding-overlap",
    defaultSeverity: "medium",
    pattern: new RegExp(`\\b(?:${PADDING_PREFIXES})-(?:0|0\\.5|1|1\\.5|2|2\\.5|3|3\\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|\\[[^\\]]+\\])\\b`, "g"),
    reason: "Internal padding is tracked separately from layout. Repeated dense values should move into shared size contracts for buttons, tabs, badges, cards, and table cells.",
    getSeverity: severityForPadding,
  },
  {
    category: "color-overlap",
    defaultSeverity: "high",
    pattern: new RegExp(`\\b(?:${COLOR_PREFIXES})-\\[#(?:[0-9a-fA-F]{3,8})\\](?:\\/\\d+)?`, "g"),
    reason: "Hardcoded hex Tailwind color bypasses semantic design tokens.",
    getSeverity: severityForColor,
  },
  {
    category: "color-overlap",
    defaultSeverity: "high",
    pattern: /#[0-9a-fA-F]{6,8}\b/g,
    reason: "Raw hex color value should be expressed through semantic tokens or token definitions.",
    getSeverity: severityForColor,
  },
  {
    category: "color-overlap",
    defaultSeverity: "high",
    pattern: new RegExp(`\\b(?:${COLOR_PREFIXES})-\\[oklab\\([^\\]]+\\)\\]`, "g"),
    reason: "Raw oklab color utility bypasses semantic design tokens.",
    getSeverity: severityForColor,
  },
  {
    category: "color-overlap",
    defaultSeverity: "medium",
    pattern: new RegExp(`\\b(?:${COLOR_PREFIXES})-(?:${TAILWIND_PALETTE_NAMES})-(?:50|100|200|300|400|500|600|700|800|900|950)(?:\\/\\d+)?\\b`, "g"),
    reason: "Raw Tailwind palette utility in runtime UI should usually be replaced by semantic tokens or Badge variants.",
    getSeverity: (filePath, surface, _token, ownership) => {
      if (ownership === "primitive-contract" || ownership === "feature-family-contract" || ownership === "canonical-token") return "low"
      return isBusinessRuntimeSurface(surface, filePath) ? downgradeForMarketingAuth("medium", filePath) : "low"
    },
  },
  {
    category: "border-overlap",
    defaultSeverity: "medium",
    pattern: /\bborder-\[[^\]]+\]|\bborder-\[#(?:[0-9a-fA-F]{3,8})\]|\bborder-\[oklab\([^\]]+\)\]/g,
    reason: "Business UI borders should generally use border-border, border-border/*, or border-input.",
    getSeverity: severityForBorder,
  },
  {
    category: "border-overlap",
    defaultSeverity: "medium",
    pattern: new RegExp(`\\bborder-(?:${TAILWIND_PALETTE_NAMES})-(?:50|100|200|300|400|500|600|700|800|900|950)(?:\\/\\d+)?\\b`, "g"),
    reason: "Raw palette border utility should usually map to border-border or border-input.",
    getSeverity: severityForBorder,
  },
  {
    category: "radius-overlap",
    defaultSeverity: "high",
    pattern: /\brounded-\[[^\]]+\]/g,
    reason: "Arbitrary radius values should use the explicit radius scale: rounded-md/lg/xl/2xl/full.",
    getSeverity: severityForRadius,
  },
  {
    category: "typography-overlap",
    defaultSeverity: "medium",
    pattern: /\btext-\[(?:9|10|11|12|13)px\]|\bleading-\[[^\]]+\]|\btracking-\[[^\]]+\]/g,
    reason: "Dense typography should be reported first, then moved into named table/chip typography contracts where repeated.",
    getSeverity: (filePath, surface, _token, ownership) => {
      if (ownership === "primitive-contract" || ownership === "feature-family-contract") return "low"
      return isBusinessRuntimeSurface(surface, filePath) ? downgradeForMarketingAuth("medium", filePath) : "low"
    },
  },
  {
    category: "shadow-overlap",
    defaultSeverity: "medium",
    pattern: /\bshadow-\[[^\]]+\]|\bshadow-2xl\b/g,
    reason: "Custom or heavy shadow recipes should be normalized to the shared shadow scale where used in business UI.",
    getSeverity: (filePath, surface) => (isBusinessRuntimeSurface(surface, filePath) ? downgradeForMarketingAuth("medium", filePath) : "low"),
  },
  {
    category: "inline-style-overlap",
    defaultSeverity: "medium",
    pattern: /style=\{\{[^}]+\}\}/g,
    reason: "Inline style usage should remain exceptional; repeated visual recipes should move to tokens or shared UI contracts.",
    getSeverity: (filePath, surface) => (isBusinessRuntimeSurface(surface, filePath) ? downgradeForMarketingAuth("medium", filePath) : "low"),
  },
  {
    category: "arbitrary-layout-overlap",
    defaultSeverity: "low",
    pattern: new RegExp(`\\b(?:${LAYOUT_PREFIXES})-\\[[^\\]]+\\]`, "g"),
    reason: "Arbitrary layout values are allowed in isolated cases, but repeated values should become named layout contracts.",
    getSeverity: (filePath, surface) => (isBusinessRuntimeSurface(surface, filePath) ? downgradeForMarketingAuth("medium", filePath) : "low"),
  },
]

function walk(directoryPath: string, files: string[] = []): string[] {
  if (!fs.existsSync(directoryPath)) return files

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const fullPath = path.join(directoryPath, entry.name)
    const relativePath = toPosix(path.relative(ROOT, fullPath))
    if (isExcludedPath(relativePath)) continue

    if (entry.isDirectory()) {
      walk(fullPath, files)
    } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

function addFinding(findings: Finding[], seen: Set<string>, finding: Finding): void {
  const key = `${finding.filePath}:${finding.line}:${finding.category}:${finding.token}`
  if (seen.has(key)) return
  seen.add(key)
  findings.push(finding)
}

function scanLine(relativePath: string, line: string, lineNumber: number, findings: Finding[], seen: Set<string>): void {
  const surface = classifySurface(relativePath)
  const ownership = classifyOwnership(relativePath, surface)

  for (const rule of RULES) {
    for (const match of line.matchAll(rule.pattern)) {
      const token = (match[1] || match[2] || match[0]).trim()
      if (!token) continue

      const severity = rule.getSeverity?.(relativePath, surface, token, ownership) ?? rule.defaultSeverity
      addFinding(findings, seen, {
        filePath: relativePath,
        line: lineNumber,
        category: rule.category,
        severity,
        token,
        reason: `${rule.reason}${reasonSuffix(relativePath, ownership)}`,
        surface,
        ownership,
      })
    }
  }
}

function scanFile(filePath: string, findings: Finding[], seen: Set<string>): void {
  const relativePath = toPosix(path.relative(ROOT, filePath))
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/)

  lines.forEach((line, index) => {
    scanLine(relativePath, line, index + 1, findings, seen)
  })
}

function countBy<T extends string>(items: Finding[], selector: (finding: Finding) => T): Record<T, number> {
  return items.reduce<Record<T, number>>((acc, finding) => {
    const key = selector(finding)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {} as Record<T, number>)
}

function countBySeverity(findings: Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const finding of findings) counts[finding.severity] += 1
  return counts
}

function countBySurface(findings: Finding[]): Record<Surface, number> {
  const counts: Record<Surface, number> = {
    app: 0,
    "shared-ui": 0,
    feature: 0,
    entity: 0,
    component: 0,
    package: 0,
    style: 0,
    unknown: 0,
  }
  for (const finding of findings) counts[finding.surface] += 1
  return counts
}

function countByOwnership(findings: Finding[]): Record<Ownership, number> {
  const counts: Record<Ownership, number> = {
    "canonical-token": 0,
    "primitive-contract": 0,
    "feature-family-contract": 0,
    "compatibility-surface": 0,
    "marketing-auth-exception": 0,
    "business-runtime-drift": 0,
    unknown: 0,
  }
  for (const finding of findings) counts[finding.ownership] += 1
  return counts
}

function countScannedRoots(files: string[]): Record<string, number> {
  const counts = Object.fromEntries(SCAN_ROOTS.map((root) => [root, 0])) as Record<string, number>
  for (const filePath of files) {
    const relativePath = toPosix(path.relative(ROOT, filePath))
    const rootName = getRootName(relativePath)
    counts[rootName] = (counts[rootName] ?? 0) + 1
  }
  return counts
}

function targetMatches(filePath: string, matcher: string): boolean {
  return filePath === matcher || filePath.startsWith(matcher)
}

function isHighCritical(finding: Finding): boolean {
  return finding.severity === "critical" || finding.severity === "high"
}

function validateTarget(target: TargetSurface, findings: Finding[]): TargetValidation {
  const targetFindings = findings.filter((finding) => target.featureMatchers.some((matcher) => targetMatches(finding.filePath, matcher)))
  const sharedResidualOwners = target.sharedResidualOwners ?? []
  const sharedResidualFindings = findings.filter((finding) => sharedResidualOwners.includes(finding.filePath))
  const targetHighCritical = targetFindings.filter(isHighCritical)
  const sharedHighCritical = sharedResidualFindings.filter(isHighCritical)
  const files = [...new Set(targetFindings.map((finding) => finding.filePath))].sort()

  let status: ValidationStatus = "PASS"
  if (targetHighCritical.length > 0) {
    status = "FAIL"
  } else if (targetFindings.length > 0) {
    status = "REVIEW"
  } else if (sharedResidualFindings.length > 0 && sharedHighCritical.length === 0) {
    status = "PASS_WITH_SHARED_RESIDUAL"
  } else if (sharedHighCritical.length > 0) {
    status = "REVIEW"
  }

  return {
    phase: target.phase,
    title: target.title,
    expected: target.expected,
    actualFindings: targetFindings.length,
    highCriticalFindings: targetHighCritical.length,
    status,
    files,
    sharedResidualOwners,
  }
}

function createReport(files: string[], findings: Finding[]): AuditReport {
  return {
    generatedAt: new Date().toISOString(),
    scanRoots: SCAN_ROOTS,
    scannedFiles: files.length,
    scannedRootCounts: countScannedRoots(files),
    totalFindings: findings.length,
    severityCounts: countBySeverity(findings),
    categoryCounts: countBy(findings, (finding) => finding.category),
    surfaceCounts: countBySurface(findings),
    ownershipCounts: countByOwnership(findings),
    staleReferences: [
      {
        filePath: "docs/DESIGN_SYSTEM.md",
        classification: "stale-reference",
        reason: "Issue #173 requires this audit to be generated from runtime source code, not stale design docs.",
      },
    ],
    acceptedSharedContractOwners: [...ACCEPTED_SHARED_CONTRACT_OWNERS].sort(),
    postRefactorValidation: PHASE_TARGETS.map((target) => validateTarget(target, findings)),
    findings,
  }
}

function formatCounts(counts: Record<string, number>): string {
  const entries = Object.entries(counts).filter(([, count]) => count > 0)
  if (entries.length === 0) return "_None._"
  return entries
    .sort((a, b) => b[1] - a[0].localeCompare(b[0]))
    .map(([name, count]) => `- ${name}: ${count}`)
    .join("\n")
}

function compareFindings(a: Finding, b: Finding): number {
  const severityOrder: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  return severityOrder[a.severity] - severityOrder[b.severity] || a.filePath.localeCompare(b.filePath) || a.line - b.line
}

function formatFindingTable(findings: Finding[], limit: number): string {
  if (findings.length === 0) return "_None._"

  const rows = findings.slice(0, limit).map((finding) => {
    const token = finding.token.replace(/\|/g, "\\|")
    return `| ${finding.severity} | ${finding.category} | ${finding.surface} | ${finding.ownership} | \`${finding.filePath}:${finding.line}\` | \`${token}\` |`
  })

  const suffix = findings.length > limit ? `\n\n_Showing ${limit} of ${findings.length} findings._` : ""
  return [
    "| Severity | Category | Surface | Ownership | Location | Token |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows,
  ].join("\n") + suffix
}

function formatValidationTable(validations: TargetValidation[]): string {
  if (validations.length === 0) return "_None._"

  const rows = validations.map((validation) => {
    const files = validation.files.length > 0 ? validation.files.map((file) => `\`${file}\``).join(", ") : "—"
    const owners = validation.sharedResidualOwners.length > 0 ? validation.sharedResidualOwners.map((file) => `\`${file}\``).join(", ") : "—"
    return `| ${validation.phase} | ${validation.title} | ${validation.actualFindings} | ${validation.highCriticalFindings} | ${validation.status} | ${files} | ${owners} |`
  })

  return [
    "| Phase | Target | Feature findings | High/Critical | Status | Target files with findings | Accepted shared residual owner(s) |",
    "| --- | --- | ---: | ---: | --- | --- | --- |",
    ...rows,
  ].join("\n")
}

function writeReports(report: AuditReport): void {
  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)

  const sortedFindings = [...report.findings].sort(compareFindings)
  const highPriority = sortedFindings.filter((finding) => finding.severity === "critical" || finding.severity === "high")
  const businessRuntimeHighPriority = highPriority.filter((finding) => finding.ownership === "business-runtime-drift")
  const unclassifiedSharedUi = sortedFindings.filter((finding) => finding.surface === "shared-ui" && finding.ownership === "unknown")
  const acceptedSharedResiduals = sortedFindings.filter(
    (finding) => finding.ownership === "primitive-contract" || finding.ownership === "feature-family-contract",
  )
  const marketingAuthExceptions = sortedFindings.filter((finding) => finding.ownership === "marketing-auth-exception")
  const featureAppEntityFindings = sortedFindings.filter((finding) => ["app", "feature", "entity"].includes(finding.surface))

  const markdown = `# UI Visual Overlap Audit

Generated at: ${report.generatedAt}

## Summary

- Scanned files: ${report.scannedFiles}
- Total findings: ${report.totalFindings}

## Scan coverage

Roots: ${report.scanRoots.map((root) => `\`${root}\``).join(", ")}

${formatCounts(report.scannedRootCounts)}

## Findings by severity

${formatCounts(report.severityCounts)}

## Findings by category

${formatCounts(report.categoryCounts)}

## Findings by surface

${formatCounts(report.surfaceCounts)}

## Findings by ownership

${formatCounts(report.ownershipCounts)}

## Source-of-truth notes

- Runtime source is the source of truth for this audit: app/globals.css, app/layout.tsx, shared/ui/**, features/**, entities/**, components/ui/**, packages/ui/**, styles/**, widgets/**, and existing audit/package scripts.
- docs/DESIGN_SYSTEM.md is classified as stale-reference for this phase and is not scanned as source of truth.
- Shared UI residuals are split into primitive-contract, feature-family-contract, compatibility-surface, and unknown ownership classes.
- Marketing/auth surfaces, including app/page.tsx and auth/pricing routes, remain reported as exception candidates with downgraded severity.
- Test, mock, fixture, build, report, and documentation paths are excluded from visual runtime audit scope.

## Business runtime High/Critical findings

${formatFindingTable(businessRuntimeHighPriority, 50)}

## Closed phase target validation (#175-#184)

${formatValidationTable(report.postRefactorValidation)}

## Accepted shared contract residuals

${formatFindingTable(acceptedSharedResiduals, 80)}

## Shared UI contracts requiring review

${formatFindingTable(unclassifiedSharedUi, 80)}

## Marketing/auth/landing exceptions

${formatFindingTable(marketingAuthExceptions, 80)}

## Top remaining app/feature/entity findings

${formatFindingTable(featureAppEntityFindings, 120)}

## Suggested next cleanup order after #173-#184

1. Fix any business-runtime High/Critical finding first.
2. Verify closed phase targets that show REVIEW or FAIL in the validation table.
3. Classify or split any unknown shared-ui contract with repeated findings.
4. Review marketing/auth/landing exceptions only if they affect product runtime consistency.
5. Establish an accepted post-refactor baseline before enabling strict visual audit as a release blocker.

## All findings by severity

${formatFindingTable(sortedFindings, 300)}
`

  fs.writeFileSync(REPORT_MD_PATH, markdown)
}

function getStrictViolations(findings: Finding[]): Finding[] {
  return findings.filter((finding) => {
    if (finding.severity !== "critical" && finding.severity !== "high") return false
    if (finding.ownership !== "business-runtime-drift") return false

    return (
      finding.category === "ui-entrypoint-overlap" ||
      finding.category === "font-overlap" ||
      finding.category === "radius-overlap" ||
      (finding.category === "color-overlap" && (/#[0-9a-fA-F]{3,8}|oklab\(/.test(finding.token)))
    )
  })
}

function main(): void {
  const options = parseArgs(process.argv.slice(2))
  const files = SCAN_ROOTS.flatMap((root) => walk(path.join(ROOT, root)))
  const findings: Finding[] = []
  const seen = new Set<string>()

  for (const filePath of files) scanFile(filePath, findings, seen)

  const report = createReport(files, findings)
  if (options.report) writeReports(report)

  console.log(`UI visual audit complete. Scanned ${report.scannedFiles} file(s), found ${report.totalFindings} finding(s).`)
  console.log(`Reports: ${toPosix(path.relative(ROOT, REPORT_JSON_PATH))}, ${toPosix(path.relative(ROOT, REPORT_MD_PATH))}`)

  const failedTargets = report.postRefactorValidation.filter((validation) => validation.status === "FAIL")
  if (failedTargets.length > 0) {
    console.warn(`Post-refactor validation found ${failedTargets.length} failed target group(s). See reports/ui-visual-audit.md.`)
  }

  if (options.strict) {
    const strictViolations = getStrictViolations(findings)
    if (strictViolations.length > 0) {
      console.error(`UI visual strict audit failed with ${strictViolations.length} high-priority business runtime violation(s).`)
      console.error(formatFindingTable(strictViolations, 25))
      process.exitCode = 1
    } else {
      console.log("UI visual strict audit passed.")
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
