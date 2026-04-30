import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

type Severity = "critical" | "high" | "medium" | "low"
type Surface = "app" | "shared-ui" | "feature" | "entity" | "component" | "package" | "style" | "unknown"

interface Finding {
  filePath: string
  line: number
  category: string
  severity: Severity
  token: string
  reason: string
  surface: Surface
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
  staleReferences: Array<{ filePath: string; classification: "stale-reference"; reason: string }>
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
  getSeverity?: (filePath: string, surface: Surface, token: string) => Severity
  getReason?: (filePath: string, surface: Surface, token: string) => string
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
])

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
const LAYOUT_PREFIXES = "w|h|min-w|max-w|min-h|max-h|gap|gap-x|gap-y|space-x|space-y|px|py|pt|pr|pb|pl|p|mx|my|mt|mr|mb|ml|m|top|right|bottom|left|inset|translate-x|translate-y"

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

function isExcludedPath(relativePath: string): boolean {
  return relativePath.split("/").some((segment) => EXCLUDED_SEGMENTS.has(segment))
}

function getRootName(relativePath: string): string {
  return relativePath.split("/")[0] || "unknown"
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

function isCanonicalTokenFile(relativePath: string): boolean {
  return (
    relativePath === "app/globals.css" ||
    relativePath.startsWith("styles/tokens/") ||
    relativePath.startsWith("shared/ui/") ||
    relativePath.startsWith("components/ui/") ||
    relativePath.startsWith("packages/ui/")
  )
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

function severityForColor(filePath: string, surface: Surface): Severity {
  if (isCanonicalTokenFile(filePath)) return "low"
  if (isBusinessRuntimeSurface(surface, filePath)) return downgradeForMarketingAuth("high", filePath)
  return "medium"
}

function severityForBorder(filePath: string, surface: Surface): Severity {
  if (isCanonicalTokenFile(filePath)) return "low"
  if (isBusinessRuntimeSurface(surface, filePath)) return downgradeForMarketingAuth("medium", filePath)
  return "low"
}

function severityForRadius(filePath: string, surface: Surface): Severity {
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

function reasonSuffix(relativePath: string): string {
  if (isCanonicalTokenFile(relativePath)) {
    return " Classified as canonical token/primitive or compatibility surface; keep visible but do not treat as immediate business UI drift."
  }
  if (isMarketingOrAuthSurface(relativePath)) {
    return " Marketing/auth surface: reported as an exception candidate with downgraded severity."
  }
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
    getSeverity: (filePath, surface) => (isBusinessRuntimeSurface(surface, filePath) ? downgradeForMarketingAuth("medium", filePath) : "low"),
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
    getSeverity: (filePath, surface) => (isBusinessRuntimeSurface(surface, filePath) ? downgradeForMarketingAuth("medium", filePath) : "low"),
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

  for (const rule of RULES) {
    for (const match of line.matchAll(rule.pattern)) {
      const token = (match[1] || match[2] || match[0]).trim()
      if (!token) continue

      const severity = rule.getSeverity?.(relativePath, surface, token) ?? rule.defaultSeverity
      const baseReason = rule.getReason?.(relativePath, surface, token) ?? rule.reason
      addFinding(findings, seen, {
        filePath: relativePath,
        line: lineNumber,
        category: rule.category,
        severity,
        token,
        reason: `${baseReason}${reasonSuffix(relativePath)}`,
        surface,
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

function countScannedRoots(files: string[]): Record<string, number> {
  const counts = Object.fromEntries(SCAN_ROOTS.map((root) => [root, 0])) as Record<string, number>
  for (const filePath of files) {
    const relativePath = toPosix(path.relative(ROOT, filePath))
    const rootName = getRootName(relativePath)
    counts[rootName] = (counts[rootName] ?? 0) + 1
  }
  return counts
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
    staleReferences: [
      {
        filePath: "docs/DESIGN_SYSTEM.md",
        classification: "stale-reference",
        reason: "Issue #173 requires this audit to be generated from runtime source code, not stale design docs.",
      },
    ],
    findings,
  }
}

function formatCounts(counts: Record<string, number>): string {
  const entries = Object.entries(counts).filter(([, count]) => count > 0)
  if (entries.length === 0) return "_None._"
  return entries
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => `- ${name}: ${count}`)
    .join("\n")
}

function formatFindingTable(findings: Finding[], limit: number): string {
  if (findings.length === 0) return "_None._"

  const rows = findings.slice(0, limit).map((finding) => {
    const reason = finding.reason.replace(/\|/g, "\\|")
    const token = finding.token.replace(/\|/g, "\\|")
    return `| ${finding.severity} | ${finding.category} | ${finding.surface} | \`${finding.filePath}:${finding.line}\` | \`${token}\` | ${reason} |`
  })

  const suffix = findings.length > limit ? `\n\n_Showing ${limit} of ${findings.length} findings._` : ""
  return [
    "| Severity | Category | Surface | Location | Token | Reason |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows,
  ].join("\n") + suffix
}

function writeReports(report: AuditReport): void {
  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)

  const bySeverity = [...report.findings].sort((a, b) => {
    const order: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.severity] - order[b.severity] || a.filePath.localeCompare(b.filePath) || a.line - b.line
  })
  const highPriority = bySeverity.filter((finding) => finding.severity === "critical" || finding.severity === "high")

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

## Source-of-truth notes

- Runtime source is the source of truth for this audit: app/globals.css, app/layout.tsx, shared/ui/**, features/**, entities/**, components/ui/**, packages/ui/**, styles/**, widgets/**, and existing audit/package scripts.
- docs/DESIGN_SYSTEM.md is classified as stale-reference for this phase and is not scanned as source of truth.
- Canonical token/primitive and compatibility surfaces remain reported, but findings there are intentionally lower severity than business runtime drift.
- Marketing/auth surfaces, including app/page.tsx and auth/pricing routes, remain reported as exception candidates with downgraded severity.

## Top high-priority findings

${formatFindingTable(highPriority, 50)}

## Intended cleanup order

1. Normalize root layout token/font ownership.
2. Normalize estimate tabs visual contract.
3. Normalize dashboard compact cards colors, borders, and badges.
4. Normalize permissions matrix palette, radius, and shadow.
5. Deduplicate delete confirmation wrappers.
6. Introduce dense table typography utilities.
7. Enable strict UI visual audit gate after baseline cleanup.

## All findings by severity

${formatFindingTable(bySeverity, 250)}
`

  fs.writeFileSync(REPORT_MD_PATH, markdown)
}

function getStrictViolations(findings: Finding[]): Finding[] {
  return findings.filter((finding) => {
    if (finding.severity !== "critical" && finding.severity !== "high") return false
    if (!isBusinessRuntimeSurface(finding.surface, finding.filePath)) return false

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
