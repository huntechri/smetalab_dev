import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

type Severity = "high" | "medium" | "low"
type Surface = "app" | "feature" | "entity" | "shared-ui" | "component" | "package" | "style" | "unknown"

type Finding = {
  filePath: string
  line: number
  category: string
  severity: Severity
  token: string
  reason: string
  surface: Surface
}

type Options = {
  report: boolean
  strict: boolean
}

type Rule = {
  category: string
  severity: Severity
  pattern: RegExp
  reason: string
  businessOnly?: boolean
}

const ROOT = process.cwd()
const SCAN_ROOTS = ["app", "components", "entities", "features", "shared", "packages", "styles", "widgets"]
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"])
const REPORT_JSON_PATH = path.join(ROOT, "reports", "ui-coverage-audit.json")
const REPORT_MD_PATH = path.join(ROOT, "reports", "ui-coverage-audit.md")

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

const RULES: Rule[] = [
  {
    category: "card-surface-coverage",
    severity: "medium",
    pattern: /\b(?:Card|CardHeader|CardContent|CardFooter|card|panel|surface|metric|kpi)\b(?=.*\bclassName=)|\b(?:rounded-(?:xl|2xl|3xl|\[[^\]]+])|shadow(?:-[a-z0-9[\]]+)?|bg-card|border-border)\b(?=.*\b(?:Card|card|panel|surface|metric|kpi)\b)/gi,
    reason: "Card-like surfaces should be reviewed for shared visual contracts instead of feature-local shell recipes.",
    businessOnly: true,
  },
  {
    category: "table-toolbar-coverage",
    severity: "medium",
    pattern: /\b(?:Table|DataTable|columns|Toolbar|Filter|Pagination|Search)\b(?=.*\bclassName=)|\b(?:table|thead|tbody|tr|td|th)\b(?=.*\bclassName=)/g,
    reason: "Table, toolbar, filter and pagination surfaces need explicit shared density/action contracts.",
    businessOnly: true,
  },
  {
    category: "overlay-interaction-coverage",
    severity: "medium",
    pattern: /\b(?:Dialog|AlertDialog|Sheet|Popover|DropdownMenu|ContextMenu|Tooltip|Drawer)\b(?=.*\bclassName=)|\b(?:z-\[[^\]]+]|z-(?:40|50|\d{2,3})|backdrop-blur|fixed inset-0)\b/g,
    reason: "Overlay and interaction primitives need browser smoke/a11y coverage beyond static visual tokens.",
    businessOnly: true,
  },
  {
    category: "state-surface-coverage",
    severity: "low",
    pattern: /\b(?:Empty|empty|Loading|loading|Skeleton|skeleton|ErrorState|error state|No data|not found)\b(?=.*\bclassName=)/gi,
    reason: "Empty/loading/error states should be covered by smoke tests or shared state primitives.",
    businessOnly: true,
  },
  {
    category: "icon-action-coverage",
    severity: "low",
    pattern: /\b(?:Icon|Chevron|Plus|Trash|Edit|Search|X|MoreHorizontal|Settings|Loader2)\b(?=.*\b(?:size-|h-\d|w-\d|className=))/g,
    reason: "Icon action sizing should stay consistent across compact action surfaces.",
    businessOnly: true,
  },
  {
    category: "form-control-coverage",
    severity: "medium",
    pattern: /\b(?:Form|Input|Textarea|Select|Checkbox|Switch|RadioGroup|CommandInput)\b(?=.*\bclassName=)/g,
    reason: "Form controls should use canonical input/control contracts and interaction smoke coverage.",
    businessOnly: true,
  },
]

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

function isBusinessSurface(surface: Surface): boolean {
  return surface === "app" || surface === "feature" || surface === "entity"
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

function scanFile(filePath: string, findings: Finding[], seen: Set<string>): void {
  const relativePath = toPosix(path.relative(ROOT, filePath))
  const surface = classifySurface(relativePath)
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/)

  lines.forEach((line, index) => {
    for (const rule of RULES) {
      if (rule.businessOnly && !isBusinessSurface(surface)) continue
      for (const match of line.matchAll(rule.pattern)) {
        const token = match[0].trim()
        const key = `${relativePath}:${index + 1}:${rule.category}:${token}`
        if (seen.has(key)) continue
        seen.add(key)
        findings.push({
          filePath: relativePath,
          line: index + 1,
          category: rule.category,
          severity: rule.severity,
          token,
          reason: rule.reason,
          surface,
        })
      }
    }
  })
}

function countBy<T extends string>(items: Finding[], selector: (finding: Finding) => T): Record<T, number> {
  return items.reduce<Record<T, number>>((acc, item) => {
    const key = selector(item)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {} as Record<T, number>)
}

function writeReports(findings: Finding[], scannedFiles: number): void {
  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  const report = {
    generatedAt: new Date().toISOString(),
    scanRoots: SCAN_ROOTS,
    scannedFiles,
    totalFindings: findings.length,
    severityCounts: countBy(findings, (finding) => finding.severity),
    categoryCounts: countBy(findings, (finding) => finding.category),
    surfaceCounts: countBy(findings, (finding) => finding.surface),
    findings,
  }

  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(report, null, 2))

  const topFindings = findings
    .slice(0, 80)
    .map((finding) => `| ${finding.severity} | ${finding.category} | \`${finding.filePath}:${finding.line}\` | \`${finding.token.replace(/\|/g, "\\|")}\` |`)
    .join("\n")

  fs.writeFileSync(
    REPORT_MD_PATH,
    `# UI Coverage Audit\n\nThis report is a refactor-stage coverage radar. It does not replace \`audit:ui:visual\`, Playwright smoke tests, or accessibility tests.\n\n- Scanned files: ${scannedFiles}\n- Total findings: ${findings.length}\n\n## Category counts\n\n${Object.entries(report.categoryCounts).map(([key, value]) => `- ${key}: ${value}`).join("\n") || "- none"}\n\n## Surface counts\n\n${Object.entries(report.surfaceCounts).map(([key, value]) => `- ${key}: ${value}`).join("\n") || "- none"}\n\n## Findings\n\n| Severity | Category | Location | Token |\n| --- | --- | --- | --- |\n${topFindings || "| - | - | - | - |"}\n`
  )
}

function main(): void {
  const options = parseArgs(process.argv.slice(2))
  const files = SCAN_ROOTS.flatMap((root) => walk(path.join(ROOT, root)))
  const findings: Finding[] = []
  const seen = new Set<string>()

  for (const file of files) scanFile(file, findings, seen)

  if (options.report) {
    writeReports(findings, files.length)
    console.log(`Report: ${path.relative(ROOT, REPORT_JSON_PATH)}`)
    console.log(`Markdown: ${path.relative(ROOT, REPORT_MD_PATH)}`)
  }

  console.log(`UI coverage audit complete. Found ${findings.length} coverage signal(s).`)

  if (options.strict && findings.some((finding) => finding.severity === "high")) {
    console.error("UI coverage strict audit failed: high-severity findings detected.")
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
