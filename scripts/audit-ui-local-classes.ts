import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

type Severity = "high" | "medium" | "low"
type LocalClassBucket =
  | "layout"
  | "spacing"
  | "surface"
  | "card"
  | "table"
  | "table-cell"
  | "form"
  | "control"
  | "badge-status"
  | "dialog-sheet"
  | "navigation"
  | "state"
  | "dashboard-chart"
  | "typography"
  | "color"
  | "unknown"

type Options = {
  report: boolean
  strict: boolean
}

type LocalClassFinding = {
  filePath: string
  line: number
  severity: Severity
  bucket: LocalClassBucket
  token: string
  evidence: string
  reason: string
  recommendedContract: string
}

type LocalClassesReport = {
  generatedAt: string
  mode: "local-classes"
  scannedRoots: string[]
  scannedFiles: number
  filesWithFindings: number
  totalFindings: number
  severityCounts: Record<Severity, number>
  rootCounts: Record<string, number>
  bucketCounts: Record<LocalClassBucket, number>
  findings: LocalClassFinding[]
}

const ROOT = process.cwd()
const SCAN_ROOTS = ["app", "features", "entities", "components", "widgets"]
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"])
const REPORT_JSON_PATH = path.join(ROOT, "reports", "ui-local-classes.json")
const REPORT_MD_PATH = path.join(ROOT, "reports", "ui-local-classes.md")

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

const NON_VISUAL_ALLOWED_CLASSES = new Set([
  "sr-only",
  "not-sr-only",
  "hidden",
  "pointer-events-none",
  "pointer-events-auto",
])

const RECOMMENDED_CONTRACTS: Record<LocalClassBucket, string> = {
  layout: "shared/ui/page-shell.tsx, shared/ui/section.tsx, or a narrower shared layout contract",
  spacing: "shared/ui/primitive-spacing.ts, shared/ui/primitive-density.ts, or component semantic density props",
  surface: "shared/ui/surface.tsx or shared/ui/card-shell.tsx",
  card: "shared/ui/card-shell.tsx, shared/ui/surface.tsx, or shared dashboard/card contracts",
  table: "shared/ui/data-table.tsx or shared/ui/table-density.tsx",
  "table-cell": "shared/ui/cells/*, shared/ui/table-density.tsx, or shared table cell helpers",
  form: "shared/ui/form-layout.tsx and shared form/control primitives",
  control: "shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx",
  "badge-status": "shared/ui/badge.tsx or shared/ui/status-badge.tsx",
  "dialog-sheet": "shared/ui/dialog.tsx, shared/ui/sheet.tsx, or shared overlay semantic props",
  navigation: "shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts",
  state: "shared/ui/states/*",
  "dashboard-chart": "shared/ui/kpi-card.tsx, shared/ui/dashboard-layout.tsx, or shared/ui/dashboard-dynamics-chart.tsx",
  typography: "shared typography/density token or semantic text prop on the owning shared component",
  color: "shared/ui primitive token, semantic variant/tone prop, or status/badge/card contract",
  unknown: "Add or extend a semantic shared/ui contract before keeping local visual classes",
}

const VISUAL_CONTEXT_PATTERN = /\b(?:className|cn\(|clsx\(|cva\(|classNames?|classes|styles|variants?|statusClass|badgeClass|chipClass|pillClass|cellClass|rowClass|toolbarClass|cardClass|surfaceClass)\b/u
const QUOTED_STRING_WITH_DASH_PATTERN = /["'`]([^"'`]*-[^"'`]*)["'`]/u
const CLASS_MAP_PATTERN = /\b(?:const|let|var)\s+[A-Za-z0-9_$]*(?:class|classes|className|styles|variants|status|badge|pill|chip|cell|row|surface|card)[A-Za-z0-9_$]*\s*=/iu

function parseArgs(argv: string[]): Options {
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
  if (relativePath === "app/globals.css" || relativePath === "app/layout.tsx") return true
  if (relativePath.startsWith("shared/")) return true
  if (relativePath.startsWith("components/ui/")) return true
  if (relativePath.startsWith("packages/ui/")) return true
  if (relativePath.startsWith("styles/")) return true
  return relativePath.split("/").some((segment) => EXCLUDED_SEGMENTS.has(segment)) || TEST_FILE_PATTERN.test(relativePath)
}

function walk(directoryPath: string, files: string[] = []): string[] {
  if (!fs.existsSync(directoryPath)) return files

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const fullPath = path.join(directoryPath, entry.name)
    const relativePath = toPosix(path.relative(ROOT, fullPath))
    if (isExcludedPath(relativePath)) continue

    if (entry.isDirectory()) walk(fullPath, files)
    else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) files.push(fullPath)
  }

  return files
}

function lastVariantSegment(token: string): string {
  let bracketDepth = 0
  let segmentStart = 0

  for (let index = 0; index < token.length; index += 1) {
    const char = token[index]
    if (char === "[") bracketDepth += 1
    if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1)
    if (char === ":" && bracketDepth === 0) segmentStart = index + 1
  }

  return token.slice(segmentStart).replace(/^!/, "")
}

function extractCandidateTokens(line: string): string[] {
  const matches = line.match(/[!A-Za-z0-9_:@/\-.\[\]=#%()]+/g) ?? []
  return matches.map((token) => token.trim()).filter(Boolean)
}

function isSpacingClass(base: string): boolean {
  return /^(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-/u.test(base)
}

function isSizeClass(base: string): boolean {
  return /^(?:w|h|size|min-w|max-w|min-h|max-h)-/u.test(base)
}

function isLayoutClass(base: string): boolean {
  return /^(?:flex|inline-flex|grid|inline-grid|block|inline-block|hidden|items-|justify-|content-|self-|place-|grid-cols-|grid-rows-|col-|row-|basis-|grow|shrink|order-)/u.test(base)
}

function isPositionClass(base: string): boolean {
  return /^(?:absolute|relative|fixed|sticky|static|top-|right-|bottom-|left-|inset-|z-|translate-x-|translate-y-|scale-|rotate-)/u.test(base)
}

function isSurfaceClass(base: string): boolean {
  return /^(?:rounded|rounded-|border|border-|shadow|shadow-|ring|ring-|outline|outline-|bg-|backdrop-|opacity-|overflow-|overflow-x-|overflow-y-)/u.test(base)
}

function isColorClass(base: string): boolean {
  return /^(?:bg|text|border|ring|from|via|to|fill|stroke|decoration|outline)-/u.test(base)
}

function isTypographyClass(base: string): boolean {
  return /^(?:text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|\[[^\]]+\])|font-|leading-|tracking-|truncate|whitespace-|break-|line-clamp-)/u.test(base)
}

function isStateOrResponsiveVariant(token: string): boolean {
  return /^(?:sm|md|lg|xl|2xl|hover|focus|focus-visible|active|disabled|group-hover|peer-focus|data-\[[^\]]+\]|aria-\[[^\]]+\]):/u.test(token)
}

function isVisualClassToken(token: string): boolean {
  const base = lastVariantSegment(token)
  if (!base || NON_VISUAL_ALLOWED_CLASSES.has(base)) return false

  return (
    isSpacingClass(base) ||
    isSizeClass(base) ||
    isLayoutClass(base) ||
    isPositionClass(base) ||
    isSurfaceClass(base) ||
    isColorClass(base) ||
    isTypographyClass(base) ||
    isStateOrResponsiveVariant(token)
  )
}

function extractVisualTokens(line: string): string[] {
  const tokens = extractCandidateTokens(line).filter(isVisualClassToken)
  return Array.from(new Set(tokens))
}

function hasLocalVisualContext(line: string): boolean {
  return VISUAL_CONTEXT_PATTERN.test(line) || CLASS_MAP_PATTERN.test(line) || QUOTED_STRING_WITH_DASH_PATTERN.test(line)
}

function includesAny(value: string, words: string[]): boolean {
  return words.some((word) => value.includes(word))
}

function classifyBucket(filePath: string, line: string, tokens: string[]): LocalClassBucket {
  const context = `${filePath} ${line}`.toLowerCase()
  const bases = tokens.map(lastVariantSegment)

  if (includesAny(context, ["dialog", "sheet", "popover", "drawer", "overlay", "alertdialog"])) return "dialog-sheet"
  if (includesAny(context, ["badge", "status", "pill", "chip", "tag"])) return "badge-status"
  if (includesAny(context, ["tablecell", "cell", "columns", "column", " td", " th", "tabular-nums", "text-right", "align-middle"])) return "table-cell"
  if (includesAny(context, ["table", "datatable", "thead", "tbody", "row", "pagination"])) return "table"
  if (includesAny(context, ["form", "field", "label"])) return "form"
  if (includesAny(context, ["button", "input", "select", "textarea", "search", "control", "tabs", "trigger"])) return "control"
  if (includesAny(context, ["sidebar", "navigation", "nav", "menu", "breadcrumb", "header"])) return "navigation"
  if (includesAny(context, ["empty", "loading", "skeleton", "error", "forbidden", "noresults", "no-results", "notfound", "not-found"])) return "state"
  if (includesAny(context, ["dashboard", "chart", "kpi", "metric", "dynamics"])) return "dashboard-chart"
  if (includesAny(context, ["card", "cardshell", "panel", "summary", "tile"])) return "card"
  if (includesAny(context, ["surface", "section", "shell", "page"])) return "surface"

  if (bases.some(isColorClass)) return "color"
  if (bases.some(isTypographyClass)) return "typography"
  if (bases.some((base) => isSurfaceClass(base) && !isColorClass(base))) return "surface"
  if (bases.some(isSpacingClass)) return "spacing"
  if (bases.some((base) => isLayoutClass(base) || isSizeClass(base) || isPositionClass(base))) return "layout"

  return "unknown"
}

function classifySeverity(bucket: LocalClassBucket, line: string, tokens: string[]): Severity {
  if (/\bcva\(/u.test(line)) return "high"
  if (CLASS_MAP_PATTERN.test(line) && tokens.length >= 2) return "high"
  if (["badge-status", "card", "table", "table-cell", "dialog-sheet", "dashboard-chart"].includes(bucket)) return "high"
  if (bucket === "surface" && tokens.some((token) => /^(?:rounded|rounded-|border|border-|shadow|shadow-|bg-|ring|ring-)/u.test(lastVariantSegment(token)))) return "high"
  if (tokens.length >= 6) return "high"
  if (/\b(?:cn|clsx)\(/u.test(line) && tokens.length >= 2) return "medium"
  if (["form", "control", "spacing", "layout", "color", "typography"].includes(bucket)) return "medium"
  return "low"
}

function reasonFor(bucket: LocalClassBucket): string {
  switch (bucket) {
    case "badge-status":
      return "Runtime code appears to own badge/status color, shape, or spacing. Use semantic shared badge/status contracts."
    case "card":
    case "surface":
      return "Runtime code appears to own card/surface visual recipe. Move this to a shared visual contract or semantic props."
    case "table":
    case "table-cell":
      return "Runtime code appears to own table/cell density, alignment, or typography. Use shared table/cell contracts."
    case "dialog-sheet":
      return "Runtime code appears to own overlay width, padding, or scroll layout. Use shared dialog/sheet semantic sizes."
    case "form":
    case "control":
      return "Runtime code appears to own form/control layout or sizing. Use shared form/control contracts."
    case "state":
      return "Runtime code appears to own empty/loading/error state visuals. Use shared state contracts."
    case "dashboard-chart":
      return "Runtime code appears to own dashboard/chart/KPI visual layout. Use dashboard shared contracts."
    case "navigation":
      return "Runtime code appears to own navigation/header/sidebar visual layout. Use shared navigation/layout contracts."
    case "spacing":
      return "Runtime code contains local spacing classes. Prefer density/spacing semantic props on shared components."
    case "layout":
      return "Runtime code contains local layout classes. Prefer shared shell/layout contracts when the recipe is visual."
    case "typography":
      return "Runtime code contains local typography classes. Prefer semantic shared typography or density contracts."
    case "color":
      return "Runtime code contains local color classes. Prefer semantic tone/variant props on shared components."
    default:
      return "Runtime code contains local visual classes outside shared/ui. Review and move to an owning shared contract if visual."
  }
}

function scanFile(filePath: string, findings: LocalClassFinding[], seen: Set<string>): void {
  const relativePath = toPosix(path.relative(ROOT, filePath))
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/u)

  lines.forEach((line, index) => {
    if (!hasLocalVisualContext(line)) return

    const tokens = extractVisualTokens(line)
    if (tokens.length === 0) return

    const bucket = classifyBucket(relativePath, line, tokens)
    const severity = classifySeverity(bucket, line, tokens)
    const evidence = line.trim().slice(0, 260)
    const token = tokens.slice(0, 16).join(" ")
    const key = `${relativePath}:${index + 1}:${bucket}:${token}`
    if (seen.has(key)) return
    seen.add(key)

    findings.push({
      filePath: relativePath,
      line: index + 1,
      severity,
      bucket,
      token,
      evidence,
      reason: reasonFor(bucket),
      recommendedContract: RECOMMENDED_CONTRACTS[bucket],
    })
  })
}

function emptySeverityCounts(): Record<Severity, number> {
  return { high: 0, medium: 0, low: 0 }
}

function emptyBucketCounts(): Record<LocalClassBucket, number> {
  return {
    layout: 0,
    spacing: 0,
    surface: 0,
    card: 0,
    table: 0,
    "table-cell": 0,
    form: 0,
    control: 0,
    "badge-status": 0,
    "dialog-sheet": 0,
    navigation: 0,
    state: 0,
    "dashboard-chart": 0,
    typography: 0,
    color: 0,
    unknown: 0,
  }
}

function countSeverities(findings: LocalClassFinding[]): Record<Severity, number> {
  return findings.reduce<Record<Severity, number>>((acc, finding) => {
    acc[finding.severity] += 1
    return acc
  }, emptySeverityCounts())
}

function countBuckets(findings: LocalClassFinding[]): Record<LocalClassBucket, number> {
  return findings.reduce<Record<LocalClassBucket, number>>((acc, finding) => {
    acc[finding.bucket] += 1
    return acc
  }, emptyBucketCounts())
}

function countRoots(findings: LocalClassFinding[]): Record<string, number> {
  return findings.reduce<Record<string, number>>((acc, finding) => {
    const root = getRootName(finding.filePath)
    acc[root] = (acc[root] ?? 0) + 1
    return acc
  }, {})
}

function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ").replace(/`/g, "'")
}

function formatCountRows(record: Record<string, number>): string {
  const rows = Object.entries(record)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `| ${key} | ${count} |`)

  return rows.length > 0 ? rows.join("\n") : "| - | 0 |"
}

function formatBucketRows(bucketCounts: Record<LocalClassBucket, number>): string {
  const rows = Object.entries(bucketCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([bucket, count]) => `| ${bucket} | ${count} | ${RECOMMENDED_CONTRACTS[bucket as LocalClassBucket]} |`)

  return rows.length > 0 ? rows.join("\n") : "| - | 0 | - |"
}

function writeReports(findings: LocalClassFinding[], scannedFiles: number): LocalClassesReport {
  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })

  const severityCounts = countSeverities(findings)
  const bucketCounts = countBuckets(findings)
  const rootCounts = countRoots(findings)
  const filesWithFindings = new Set(findings.map((finding) => finding.filePath)).size

  const report: LocalClassesReport = {
    generatedAt: new Date().toISOString(),
    mode: "local-classes",
    scannedRoots: SCAN_ROOTS,
    scannedFiles,
    filesWithFindings,
    totalFindings: findings.length,
    severityCounts,
    rootCounts,
    bucketCounts,
    findings,
  }

  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(report, null, 2))

  const findingRows = findings
    .slice(0, 500)
    .map(
      (finding) =>
        `| ${finding.severity} | ${finding.bucket} | \`${finding.filePath}:${finding.line}\` | \`${escapeMarkdownCell(finding.evidence)}\` | ${escapeMarkdownCell(finding.recommendedContract)} |`
    )
    .join("\n")

  const markdown = `# UI Local Classes Audit

This report intentionally excludes \`shared/ui/**\`, token/global files, tests, mocks, fixtures and reports. It is the actionable cleanup list for local visual ownership in runtime/business layers.

- Status: ${severityCounts.high > 0 ? "fail" : findings.length > 0 ? "review" : "pass"}
- Scanned files: ${scannedFiles}
- Files with local classes: ${filesWithFindings}
- Total local class findings: ${findings.length}
- High priority: ${severityCounts.high}
- Medium priority: ${severityCounts.medium}
- Low priority: ${severityCounts.low}

## Summary by root

| Root | Findings |
| --- | ---: |
${formatCountRows(rootCounts)}

## Summary by bucket

| Bucket | Findings | Recommended shared contract |
| --- | ---: | --- |
${formatBucketRows(bucketCounts)}

## Findings

| Severity | Bucket | Location | Evidence | Recommended contract |
| --- | --- | --- | --- | --- |
${findingRows || "| - | - | - | - | - |"}
`

  fs.writeFileSync(REPORT_MD_PATH, markdown)
  return report
}

function main(): void {
  const options = parseArgs(process.argv.slice(2))
  const files = SCAN_ROOTS.flatMap((root) => walk(path.join(ROOT, root)))
  const findings: LocalClassFinding[] = []
  const seen = new Set<string>()

  for (const file of files) scanFile(file, findings, seen)

  const report = writeReports(findings, files.length)
  const highFindings = report.severityCounts.high

  if (options.report) {
    console.log(`Report: ${path.relative(ROOT, REPORT_JSON_PATH)}`)
    console.log(`Markdown: ${path.relative(ROOT, REPORT_MD_PATH)}`)
  }

  if (options.strict && highFindings > 0) {
    console.error(`UI local classes audit failed with ${highFindings} high finding(s).`)
    console.error(`Report: ${path.relative(ROOT, REPORT_MD_PATH)}`)
    process.exitCode = 1
    return
  }

  if (options.strict) {
    const reviewOnly = report.severityCounts.medium + report.severityCounts.low
    console.log(`UI local classes audit passed. Found ${reviewOnly} medium/low local class finding(s).`)
    console.log(`Report: ${path.relative(ROOT, REPORT_MD_PATH)}`)
    return
  }

  console.log(`UI local classes audit complete. Found ${report.totalFindings} local class finding(s), ${highFindings} high.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
