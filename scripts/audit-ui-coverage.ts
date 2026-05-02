import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

type Severity = "high" | "medium" | "low"
type Priority = "P1" | "P2" | "P3" | "P4"
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

type BugCandidate = {
  id: string
  priority: Priority
  title: string
  surface: Surface
  filePath: string
  categories: Record<string, number>
  severityCounts: Record<Severity, number>
  findingCount: number
  recommendedAction: string
  sampleFindings: Finding[]
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

function countFindingsBy<T extends string>(items: Finding[], selector: (finding: Finding) => T): Record<T, number> {
  return countBy(items, selector)
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

function classifyPriority(fileFindings: Finding[]): Priority {
  const surface = fileFindings[0]?.surface ?? "unknown"
  const mediumCount = fileFindings.filter((finding) => finding.severity === "medium").length
  const categories = new Set(fileFindings.map((finding) => finding.category))

  if ((surface === "app" || surface === "feature") && mediumCount >= 5 && categories.size >= 2) return "P1"
  if ((surface === "app" || surface === "feature" || surface === "entity") && mediumCount > 0) return "P2"
  if (surface === "shared-ui") return "P3"
  return "P4"
}

function recommendedActionFor(candidate: Omit<BugCandidate, "recommendedAction">): string {
  if (candidate.priority === "P1") {
    return "Create a follow-up UI bug/refactor ticket. This runtime surface has multiple medium coverage signals and should either gain a shared visual contract or targeted smoke/a11y coverage."
  }

  if (candidate.priority === "P2") {
    return "Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface."
  }

  if (candidate.priority === "P3") {
    return "Classify as an accepted shared primitive contract or move repeated density/token logic into a narrower shared owner."
  }

  return "Keep as report-only evidence unless this surface starts producing route-level smoke errors or visual regressions."
}

function buildBugCandidates(findings: Finding[]): BugCandidate[] {
  return Array.from(groupByFile(findings).entries())
    .map(([filePath, fileFindings], index) => {
      const severityCounts = {
        high: fileFindings.filter((finding) => finding.severity === "high").length,
        medium: fileFindings.filter((finding) => finding.severity === "medium").length,
        low: fileFindings.filter((finding) => finding.severity === "low").length,
      }
      const categories = countFindingsBy(fileFindings, (finding) => finding.category)
      const surface = fileFindings[0]?.surface ?? "unknown"
      const baseCandidate = {
        id: `UI-COVERAGE-${String(index + 1).padStart(3, "0")}`,
        priority: classifyPriority(fileFindings),
        title: `Review UI coverage signals in ${filePath}`,
        surface,
        filePath,
        categories,
        severityCounts,
        findingCount: fileFindings.length,
        sampleFindings: fileFindings.slice(0, 8),
      }

      return {
        ...baseCandidate,
        recommendedAction: recommendedActionFor(baseCandidate),
      }
    })
    .sort((a, b) => {
      const priorityOrder: Record<Priority, number> = { P1: 0, P2: 1, P3: 2, P4: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority] || b.findingCount - a.findingCount
    })
}

function formatRecord(record: Record<string, number>): string {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ")
}

function formatFinding(finding: Finding): string {
  return `\`${finding.filePath}:${finding.line}\` — ${finding.category} / ${finding.severity} / \`${finding.token.replace(/`/g, "'")}\``
}

function writeReports(findings: Finding[], scannedFiles: number, options: Options): void {
  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  const bugCandidates = buildBugCandidates(findings)
  const report = {
    generatedAt: new Date().toISOString(),
    mode: "report-only",
    note: "This audit intentionally does not fail CI when coverage signals are found. Use bugCandidates to create follow-up tickets.",
    strictRequested: options.strict,
    scanRoots: SCAN_ROOTS,
    scannedFiles,
    totalFindings: findings.length,
    severityCounts: countBy(findings, (finding) => finding.severity),
    categoryCounts: countBy(findings, (finding) => finding.category),
    surfaceCounts: countBy(findings, (finding) => finding.surface),
    bugCandidateCounts: bugCandidates.reduce<Record<Priority, number>>(
      (acc, candidate) => {
        acc[candidate.priority] += 1
        return acc
      },
      { P1: 0, P2: 0, P3: 0, P4: 0 }
    ),
    bugCandidates,
    findings,
  }

  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(report, null, 2))

  const topFindings = findings
    .slice(0, 80)
    .map((finding) => `| ${finding.severity} | ${finding.category} | \`${finding.filePath}:${finding.line}\` | \`${finding.token.replace(/\|/g, "\\|")}\` |`)
    .join("\n")

  const bugCandidateSections = bugCandidates
    .slice(0, 25)
    .map(
      (candidate) =>
        `### ${candidate.id} — ${candidate.priority} — ${candidate.title}\n\n- Surface: ${candidate.surface}\n- Findings: ${candidate.findingCount}\n- Severity: ${formatRecord(candidate.severityCounts)}\n- Categories: ${formatRecord(candidate.categories)}\n- Recommended action: ${candidate.recommendedAction}\n\nSample evidence:\n${candidate.sampleFindings.map((finding) => `- ${formatFinding(finding)}`).join("\n")}\n`
    )
    .join("\n")

  fs.writeFileSync(
    REPORT_MD_PATH,
    `# UI Coverage Audit\n\nThis report is a refactor-stage coverage radar. It does not replace \`audit:ui:visual\`, Playwright smoke tests, accessibility tests, or manual UI review. It intentionally does not fail CI when coverage signals are found.\n\n- Mode: report-only\n- Strict requested: ${options.strict ? "yes, report-only" : "no"}\n- Scanned files: ${scannedFiles}\n- Total findings: ${findings.length}\n- Bug candidates: ${bugCandidates.length}\n\n## Category counts\n\n${Object.entries(report.categoryCounts).map(([key, value]) => `- ${key}: ${value}`).join("\n") || "- none"}\n\n## Surface counts\n\n${Object.entries(report.surfaceCounts).map(([key, value]) => `- ${key}: ${value}`).join("\n") || "- none"}\n\n## Bug candidate counts\n\n${Object.entries(report.bugCandidateCounts).map(([key, value]) => `- ${key}: ${value}`).join("\n") || "- none"}\n\n## Bug report candidates\n\n${bugCandidateSections || "_No bug candidates detected._"}\n\n## Findings\n\n| Severity | Category | Location | Token |\n| --- | --- | --- | --- |\n${topFindings || "| - | - | - | - |"}\n`
  )
}

function main(): void {
  const options = parseArgs(process.argv.slice(2))
  const files = SCAN_ROOTS.flatMap((root) => walk(path.join(ROOT, root)))
  const findings: Finding[] = []
  const seen = new Set<string>()

  for (const file of files) scanFile(file, findings, seen)

  if (options.report) {
    writeReports(findings, files.length, options)
    console.log(`Report: ${path.relative(ROOT, REPORT_JSON_PATH)}`)
    console.log(`Markdown: ${path.relative(ROOT, REPORT_MD_PATH)}`)
  }

  console.log(`UI coverage audit complete. Found ${findings.length} coverage signal(s).`)
  if (options.strict) {
    console.log("UI coverage strict mode is currently report-only; findings do not fail CI.")
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
