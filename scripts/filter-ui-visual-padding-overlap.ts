import fs from "node:fs"
import path from "node:path"

type Severity = "critical" | "high" | "medium" | "low"
type ValidationStatus = "PASS" | "PASS_WITH_SHARED_RESIDUAL" | "REVIEW" | "FAIL"

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
  staleReferences?: Array<{ filePath: string; classification: string; reason: string }>
  acceptedSharedContractOwners?: string[]
  postRefactorValidation?: TargetValidation[]
  findings: Finding[]
  suppressedFindings?: {
    generatedAt: string
    reason: string
    counts: Record<string, number>
  }
}

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, "reports", "ui-visual-audit.json")
const REPORT_MD_PATH = path.join(ROOT, "reports", "ui-visual-audit.md")
const SUPPRESSED_CATEGORY = "padding-overlap"

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
    featureMatchers: ["features/projects/dashboard/components/DashboardChart.tsx", "features/dashboard/components/HomeDynamicsChart.tsx"],
    sharedResidualOwners: ["shared/ui/dashboard-dynamics-chart.tsx"],
  },
  {
    phase: "#177",
    title: "Estimate shell and table",
    expected: "EstimateDetailsShell and EstimateTable absent from matrix or 0 findings.",
    featureMatchers: ["features/projects/estimates/screens/EstimateDetailsShell.client.tsx", "features/projects/estimates/components/table/EstimateTable.client.tsx"],
    sharedResidualOwners: ["shared/ui/workspace-tabs.tsx", "shared/ui/editable-data-surface.tsx"],
  },
  {
    phase: "#178",
    title: "Project dashboard/KPI surfaces",
    expected: "ProjectDashboard, DashboardKpiCards and removed DashboardDataTable should not own visual drift.",
    featureMatchers: ["features/projects/dashboard/screens/ProjectDashboard.tsx", "features/projects/dashboard/components/DashboardKpiCards.tsx", "features/projects/dashboard/components/DashboardDataTable.tsx"],
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
    featureMatchers: ["features/projects/estimates/components/tabs/EstimateExecution.tsx", "features/projects/estimates/components/tabs/EstimateProcurement.tsx"],
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
    sharedResidualOwners: ["shared/ui/cells/directory-table-cells.tsx", "shared/ui/shells/catalog-directory-visual-contracts.ts"],
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

function countBy<T extends string>(items: Finding[], selector: (finding: Finding) => T | undefined): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, finding) => {
    const key = selector(finding) ?? "unknown"
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

function countSeverity(findings: Finding[]): Record<Severity, number> {
  return {
    critical: findings.filter((finding) => finding.severity === "critical").length,
    high: findings.filter((finding) => finding.severity === "high").length,
    medium: findings.filter((finding) => finding.severity === "medium").length,
    low: findings.filter((finding) => finding.severity === "low").length,
  }
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

  const targetOnlyAcceptedSharedResiduals =
    targetFindings.length > 0 && targetFindings.every((finding) => sharedResidualOwners.includes(finding.filePath))

  let status: ValidationStatus = "PASS"
  if (targetHighCritical.length > 0 || sharedHighCritical.length > 0) {
    status = "FAIL"
  } else if (targetFindings.length > 0 && !targetOnlyAcceptedSharedResiduals) {
    status = target.phase === "#184" ? "REVIEW" : "REVIEW"
  } else if (sharedResidualFindings.length > 0) {
    status = "PASS_WITH_SHARED_RESIDUAL"
  }

  return {
    phase: target.phase,
    title: target.title,
    expected: target.expected,
    actualFindings: targetFindings.length,
    highCriticalFindings: targetHighCritical.length + sharedHighCritical.length,
    status,
    files,
    sharedResidualOwners: sharedResidualOwners.filter((owner) => sharedResidualFindings.some((finding) => finding.filePath === owner)),
  }
}

function formatCounts(counts: Record<string, number>): string {
  const entries = Object.entries(counts).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  return entries.length > 0 ? entries.map(([key, count]) => `- ${key}: ${count}`).join("\n") : "- none"
}

function writeMarkdown(report: AuditReport): void {
  const suppressed = report.suppressedFindings?.counts ?? {}
  const markdown = `# UI Visual Audit report

Generated at: ${report.generatedAt}

This file was post-processed by \`scripts/filter-ui-visual-padding-overlap.ts\`.

\`padding-overlap\` is treated as audit noise rather than a bug candidate because raw Tailwind spacing utilities are valid inside shared primitives, density contracts, cards, tables, tabs, and marketing/auth layouts. Real spacing bugs should be represented by focused visual-contract tests or by a narrower audit rule, not by one global regex that flags every \`p-*\`, \`px-*\`, and \`py-*\` utility.

## Counts after suppression

- Scanned files: ${report.scannedFiles}
- Total findings: ${report.totalFindings}

## Suppressed findings

${formatCounts(suppressed)}

## Severity counts

${formatCounts(report.severityCounts)}

## Category counts

${formatCounts(report.categoryCounts)}

## Surface counts

${formatCounts(report.surfaceCounts)}

## Ownership counts

${formatCounts(report.ownershipCounts ?? {})}
`

  fs.writeFileSync(REPORT_MD_PATH, markdown)
}

function main(): void {
  if (!fs.existsSync(REPORT_JSON_PATH)) {
    throw new Error(`Missing audit report: ${path.relative(ROOT, REPORT_JSON_PATH)}`)
  }

  const report = JSON.parse(fs.readFileSync(REPORT_JSON_PATH, "utf8")) as AuditReport
  const allFindings = report.findings ?? []
  const suppressed = allFindings.filter((finding) => finding.category === SUPPRESSED_CATEGORY)
  const findings = allFindings.filter((finding) => finding.category !== SUPPRESSED_CATEGORY)
  const suppressedCounts = countBy(suppressed, (finding) => finding.category)

  const nextReport: AuditReport = {
    ...report,
    generatedAt: new Date().toISOString(),
    totalFindings: findings.length,
    severityCounts: countSeverity(findings),
    categoryCounts: countBy(findings, (finding) => finding.category),
    surfaceCounts: countBy(findings, (finding) => finding.surface),
    ownershipCounts: countBy(findings, (finding) => finding.ownership),
    postRefactorValidation: PHASE_TARGETS.map((target) => validateTarget(target, findings)),
    findings,
    suppressedFindings: {
      generatedAt: new Date().toISOString(),
      reason: "Suppressed padding-overlap noise from bug-oriented visual audit output. Spacing utility usage requires targeted visual-contract checks, not one global p*/px*/py* regex.",
      counts: suppressedCounts,
    },
  }

  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(nextReport, null, 2))
  writeMarkdown(nextReport)

  console.log(`Suppressed ${suppressed.length} ${SUPPRESSED_CATEGORY} finding(s) from UI visual audit report.`)
  console.log(`Updated ${path.relative(ROOT, REPORT_JSON_PATH)} and ${path.relative(ROOT, REPORT_MD_PATH)}.`)
}

main()
