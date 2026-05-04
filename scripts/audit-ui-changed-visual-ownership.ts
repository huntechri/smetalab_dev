import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

type GuardrailBucket =
  | "badge-status"
  | "card-surface"
  | "toolbar-filter"
  | "table-cell-density"
  | "overlay-layout"
  | "form-layout"
  | "state-surface"
  | "action-surface"

type Ownership =
  | "accepted-shared-contract"
  | "accepted-marketing-auth-exception"
  | "canonical-token"
  | "business-runtime"
  | "out-of-scope"

type Severity = "fail"

interface Options {
  baseRef?: string
  headRef?: string
}

interface ChangedFilesResult {
  baseRef?: string
  headRef: string
  range?: string
  files: string[]
  skippedReason?: string
}

interface AddedLine {
  filePath: string
  line: number
  text: string
}

interface GuardrailViolation {
  filePath: string
  line: number
  bucket: GuardrailBucket
  severity: Severity
  token: string
  ownership: Ownership
  reason: string
  recommendedContract: string
}

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, "reports", "ui-changed-visual-ownership.json")
const REPORT_MD_PATH = path.join(ROOT, "reports", "ui-changed-visual-ownership.md")

const SCAN_ROOTS = ["app", "components", "entities", "features", "shared", "packages", "styles", "widgets"]
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"])
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

const ACCEPTED_SHARED_CONTRACT_OWNERS = new Set([
  "shared/ui/action-menu.tsx",
  "shared/ui/admin-surface.tsx",
  "shared/ui/badge.tsx",
  "shared/ui/button.tsx",
  "shared/ui/card-shell.tsx",
  "shared/ui/card.tsx",
  "shared/ui/catalog-token.tsx",
  "shared/ui/cells/directory-table-cells.tsx",
  "shared/ui/cells/table-cell-helpers.tsx",
  "shared/ui/data-table.tsx",
  "shared/ui/data-table/data-table-row.tsx",
  "shared/ui/data-table/data-table-toolbar.tsx",
  "shared/ui/dense-list.tsx",
  "shared/ui/dialog.tsx",
  "shared/ui/estimate-tab.tsx",
  "shared/ui/filter-bar.tsx",
  "shared/ui/form-layout.tsx",
  "shared/ui/form.tsx",
  "shared/ui/input.tsx",
  "shared/ui/kpi-card.tsx",
  "shared/ui/label.tsx",
  "shared/ui/page-shell.tsx",
  "shared/ui/popover.tsx",
  "shared/ui/primitive-density.ts",
  "shared/ui/search-control.tsx",
  "shared/ui/section.tsx",
  "shared/ui/select.tsx",
  "shared/ui/sheet.tsx",
  "shared/ui/shells/catalog-directory-visual-contracts.ts",
  "shared/ui/status-badge.tsx",
  "shared/ui/surface.tsx",
  "shared/ui/table-density.tsx",
  "shared/ui/textarea.tsx",
  "shared/ui/toolbar.tsx",
  "shared/ui/table-empty-state.tsx",
  "shared/ui/states/EmptyState.tsx",
  "shared/ui/states/ErrorState.tsx",
  "shared/ui/states/ForbiddenState.tsx",
  "shared/ui/states/LoadingState.tsx",
  "shared/ui/states/NoResultsState.tsx",
  "shared/ui/states/StateShell.tsx",
])

const ACCEPTED_MARKETING_AUTH_EXCEPTIONS = new Set([
  "app/page.tsx",
  "app/(login)/forgot-password/page.tsx",
  "app/(login)/reset-password/page.tsx",
  "app/(login)/sign-in/page.tsx",
  "app/(login)/sign-up/page.tsx",
  "app/(login)/verify-email/page.tsx",
  "features/auth/components/AuthFormShell.tsx",
  "features/auth/components/ForgotPasswordForm.tsx",
  "features/auth/components/LoginForm.tsx",
  "features/auth/components/ResetPasswordForm.tsx",
])

const CANONICAL_TOKEN_OWNERS = new Set(["app/globals.css", "app/layout.tsx"])

const BUCKET_CONTRACTS: Record<GuardrailBucket, string> = {
  "badge-status": "shared/ui/status-badge.tsx or shared/ui/badge.tsx",
  "card-surface": "shared/ui/surface.tsx, shared/ui/card-shell.tsx, shared/ui/page-shell.tsx, or shared/ui/section.tsx",
  "toolbar-filter": "shared/ui/toolbar.tsx, shared/ui/filter-bar.tsx, or shared/ui/search-control.tsx",
  "table-cell-density": "shared/ui/table-density.tsx, shared/ui/data-table.tsx, or shared/ui/cells/*",
  "overlay-layout": "shared/ui/dialog.tsx, shared/ui/sheet.tsx, or shared/ui/popover.tsx semantic layout props",
  "form-layout": "shared/ui/form-layout.tsx and shared form/control primitives",
  "state-surface": "shared empty/loading/error/no-results contracts when present; otherwise keep state recipes out of runtime call sites",
  "action-surface": "shared/ui/action-menu.tsx and shared action/icon/confirm contracts",
}

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
const PALETTE_COLOR_PATTERN = new RegExp(
  `\\b(?:${COLOR_PREFIXES})-(?:${TAILWIND_PALETTE_NAMES})-(?:50|100|200|300|400|500|600|700|800|900|950)(?:\\/\\d+)?\\b`,
  "u"
)
const HEX_COLOR_PATTERN = new RegExp(`\\b(?:${COLOR_PREFIXES})-\\[#(?:[0-9a-fA-F]{3,8})\\](?:\\/\\d+)?`, "u")
const PADDING_PATTERN = /\b(?:p|px|py|pt|pr|pb|pl)-(?:0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|\[[^\]]+\])\b/u
const GAP_PATTERN = /\b(?:gap|gap-x|gap-y|space-x|space-y)-(?:0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|\[[^\]]+\])\b/u
const DENSITY_TEXT_PATTERN = /\b(?:text-xs|text-\[(?:9|10|11|12|13)px\]|leading-\[[^\]]+\]|tracking-\[[^\]]+\])\b/u
const HEIGHT_PATTERN = /\b(?:h|min-h|max-h|size)-(?:6|7|8|9|10|11|12|\[[^\]]+\])\b/u

function parseArgs(argv: string[]): Options {
  const options: Options = {}
  for (const arg of argv) {
    if (arg.startsWith("--base=")) options.baseRef = arg.slice("--base=".length)
    if (arg.startsWith("--head=")) options.headRef = arg.slice("--head=".length)
  }
  return options
}

function toPosix(filePath: string): string {
  return filePath.split(path.sep).join("/")
}

function git(args: string[]): string | null {
  try {
    return execFileSync("git", args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trimEnd()
  } catch {
    return null
  }
}

function gitRefExists(ref: string): boolean {
  return git(["rev-parse", "--verify", ref]) !== null
}

function resolveBaseRef(options: Options): string | undefined {
  const githubBaseRef = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : undefined
  const candidates = [options.baseRef, process.env.UI_CHANGED_VISUAL_BASE_REF, githubBaseRef, "origin/main", "main"].filter(
    (candidate): candidate is string => Boolean(candidate)
  )
  return candidates.find(gitRefExists)
}

function getChangedFiles(options: Options): ChangedFilesResult {
  const headRef = options.headRef ?? process.env.UI_CHANGED_VISUAL_HEAD_REF ?? "HEAD"
  if (git(["rev-parse", "--is-inside-work-tree"]) !== "true") {
    return { headRef, files: [], skippedReason: "Not running inside a git work tree." }
  }

  const baseRef = resolveBaseRef(options)
  if (!baseRef) {
    return { headRef, files: [], skippedReason: "Could not resolve a base ref. Set UI_CHANGED_VISUAL_BASE_REF or pass --base=<ref>." }
  }

  for (const range of [`${baseRef}...${headRef}`, `${baseRef}..${headRef}`]) {
    const output = git(["diff", "--name-only", "--diff-filter=ACMR", range])
    if (output !== null) {
      return {
        baseRef,
        headRef,
        range,
        files: output.split(/\r?\n/u).map((filePath) => filePath.trim()).filter(Boolean),
      }
    }
  }

  return {
    baseRef,
    headRef,
    files: [],
    skippedReason: `Could not diff ${baseRef} against ${headRef}. Ensure checkout fetch-depth includes the base branch.`,
  }
}

function isExcludedPath(relativePath: string): boolean {
  return relativePath.split("/").some((segment) => EXCLUDED_SEGMENTS.has(segment)) || TEST_FILE_PATTERN.test(relativePath)
}

function isScannableChangedFile(filePath: string): boolean {
  const relativePath = toPosix(filePath)
  const root = relativePath.split("/")[0]
  return SCAN_ROOTS.includes(root) && EXTENSIONS.has(path.extname(relativePath)) && !isExcludedPath(relativePath)
}

function classifyOwnership(relativePath: string): Ownership {
  if (ACCEPTED_SHARED_CONTRACT_OWNERS.has(relativePath)) return "accepted-shared-contract"
  if (ACCEPTED_MARKETING_AUTH_EXCEPTIONS.has(relativePath)) return "accepted-marketing-auth-exception"
  if (CANONICAL_TOKEN_OWNERS.has(relativePath) || relativePath.startsWith("styles/tokens/")) return "canonical-token"
  if (
    relativePath.startsWith("app/") ||
    relativePath.startsWith("features/") ||
    relativePath.startsWith("entities/") ||
    (relativePath.startsWith("components/") && !relativePath.startsWith("components/ui/"))
  ) {
    return "business-runtime"
  }
  return "out-of-scope"
}

function shouldScanForBlockingFindings(relativePath: string): boolean {
  return classifyOwnership(relativePath) === "business-runtime"
}

function hasTailwindColor(line: string): boolean {
  return PALETTE_COLOR_PATTERN.test(line) || HEX_COLOR_PATTERN.test(line)
}

function hasPadding(line: string): boolean {
  return PADDING_PATTERN.test(line)
}

function hasGap(line: string): boolean {
  return GAP_PATTERN.test(line)
}

function hasClassRecipe(line: string): boolean {
  return /\bclassName=|\bcn\(|\bclsx\(|\bcva\(/u.test(line)
}

function addedLinesFromPatch(changed: ChangedFilesResult, scannedFiles: string[]): AddedLine[] {
  if (!changed.range || scannedFiles.length === 0) return []

  const patch = git(["diff", "--unified=0", "--diff-filter=ACMR", changed.range, "--", ...scannedFiles])
  if (patch === null || patch.length === 0) return []

  const addedLines: AddedLine[] = []
  let currentFile: string | undefined
  let nextLine = 0

  for (const patchLine of patch.split(/\r?\n/u)) {
    const fileMatch = /^\+\+\+ b\/(.+)$/u.exec(patchLine)
    if (fileMatch) {
      currentFile = toPosix(fileMatch[1])
      continue
    }

    const hunkMatch = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/u.exec(patchLine)
    if (hunkMatch) {
      nextLine = Number(hunkMatch[1])
      continue
    }

    if (!currentFile || nextLine <= 0) continue

    if (patchLine.startsWith("+") && !patchLine.startsWith("+++")) {
      addedLines.push({ filePath: currentFile, line: nextLine, text: patchLine.slice(1) })
      nextLine += 1
      continue
    }

    if (patchLine.startsWith(" ")) nextLine += 1
  }

  return addedLines
}

function addViolation(
  findings: GuardrailViolation[],
  seen: Set<string>,
  filePath: string,
  line: number,
  bucket: GuardrailBucket,
  token: string,
  reason: string
): void {
  const key = `${filePath}:${line}:${bucket}:${token}`
  if (seen.has(key)) return
  seen.add(key)
  findings.push({
    filePath,
    line,
    bucket,
    severity: "fail",
    token,
    ownership: classifyOwnership(filePath),
    reason,
    recommendedContract: BUCKET_CONTRACTS[bucket],
  })
}

const APPROVED_CONTRACT_COMPONENTS: Partial<Record<GuardrailBucket, RegExp>> = {
  "card-surface": /\b(?:Surface|CardShell|PageShell|Section)\b/u,
  "badge-status": /\b(?:Badge|StatusBadge|StatusPill)\b/u,
  "toolbar-filter": /\b(?:Toolbar|FilterBar|SearchControl)\b/u,
  "table-cell-density": /\b(?:DataTable|TableDensity|CompactTable|DenseTable)\b/u,
  "overlay-layout": /\b(?:DialogContent|SheetContent|PopoverContent)\b/u,
  "form-layout": /\b(?:FormLayout|FormSection|FormField)\b/u,
  "state-surface": /\b(?:LoadingState|EmptyState|ErrorState|ForbiddenState|NoResultsState)\b/u,
  "action-surface": /\b(?:ActionMenu|ActionIcon|ConfirmDialog)\b/u,
}

function usesApprovedContract(text: string, bucket: GuardrailBucket): boolean {
  const pattern = APPROVED_CONTRACT_COMPONENTS[bucket]
  return pattern ? pattern.test(text) : false
}

function scanAddedLine(addedLine: AddedLine, findings: GuardrailViolation[], seen: Set<string>): void {
  const { filePath, line, text } = addedLine
  if (!shouldScanForBlockingFindings(filePath)) return

  const context = `${filePath} ${text}`
  const token = text.trim().slice(0, 240)
  if (!token) return

  if (
    /\b(?:Badge|StatusBadge|StatusPill|statusBadge|statusPill|badge|pill|chip|status)\b/iu.test(context) &&
    (/\b(?:rounded-full|inline-flex|whitespace-nowrap)\b/u.test(text) || /\bborder\b/u.test(text)) &&
    (hasTailwindColor(text) || hasPadding(text))
  ) {
    addViolation(findings, seen, filePath, line, "badge-status", token, "New runtime code appears to own badge/status pill shape, spacing, or color. Use semantic status/badge shared contracts instead.")
  }

  if (
    /\b(?:Card|card|surface|panel|metric|kpi|summary)\b/iu.test(context) &&
    /\b(?:rounded-xl|rounded-2xl|rounded-3xl|bg-card|shadow|border)\b/u.test(text) &&
    (hasPadding(text) || /\bshadow(?:-sm|-md|-lg|-xl|-2xl)?\b/u.test(text)) &&
    !usesApprovedContract(text, "card-surface")
  ) {
    addViolation(findings, seen, filePath, line, "card-surface", token, "New runtime code appears to own a card/surface recipe. Use Surface, CardShell, PageShell, or Section.")
  }

  if (
    /\b(?:Toolbar|toolbar|Filter|filter|Search|search)\b/iu.test(context) &&
    /\b(?:flex|grid|items-center|justify-between|justify-end|flex-wrap)\b/u.test(text) &&
    (hasGap(text) || hasPadding(text) || HEIGHT_PATTERN.test(text))
  ) {
    addViolation(findings, seen, filePath, line, "toolbar-filter", token, "New runtime code appears to own toolbar/filter/search-row spacing or wrapping. Use Toolbar, FilterBar, or SearchControl.")
  }

  if (
    /\b(?:Table|DataTable|columns|cell|Cell|td|th|row|Row)\b/iu.test(context) &&
    (hasPadding(text) || HEIGHT_PATTERN.test(text)) &&
    (DENSITY_TEXT_PATTERN.test(text) || /\b(?:tabular-nums|text-right|text-center|align-middle)\b/u.test(text))
  ) {
    addViolation(findings, seen, filePath, line, "table-cell-density", token, "New runtime code appears to own dense table/cell typography, alignment, or spacing. Use table-density/data-table/cell contracts.")
  }

  if (
    /\b(?:DialogContent|SheetContent|PopoverContent|DialogHeader|DialogFooter|SheetHeader|SheetFooter)\b/u.test(context) &&
    hasClassRecipe(text) &&
    (/\b(?:max-w-|sm:max-w-|w-\[|p-|px-|py-|gap-|space-y-|overflow-y-)\b/u.test(text) || hasGap(text) || hasPadding(text))
  ) {
    addViolation(findings, seen, filePath, line, "overlay-layout", token, "New runtime code appears to own dialog/sheet/popover width, padding, or scroll layout. Use semantic shared overlay props/contracts.")
  }

  if (
    /\b(?:Form|form|Field|field|Label|label|Input|Textarea|Select)\b/iu.test(context) &&
    hasClassRecipe(text) &&
    (hasGap(text) || hasPadding(text) || /\b(?:space-y-|grid-cols-|text-sm|text-xs)\b/u.test(text))
  ) {
    addViolation(findings, seen, filePath, line, "form-layout", token, "New runtime code appears to own form/field spacing, label/helper typography, or control layout. Use shared form-layout contracts.")
  }

  if (
    /\b(?:Empty|empty|Loading|loading|Skeleton|skeleton|ErrorState|No data|no results|not found)\b/u.test(context) &&
    hasClassRecipe(text) &&
    (hasPadding(text) || hasGap(text) || hasTailwindColor(text) || /\b(?:text-sm|text-xs|border|rounded-|size-|h-|w-)\b/u.test(text))
  ) {
    addViolation(findings, seen, filePath, line, "state-surface", token, "New runtime code appears to own empty/loading/error/no-results state visuals. Move repeated state recipes to shared state contracts.")
  }

  if (
    /\b(?:ActionMenu|DropdownMenuItem|IconButton|MoreHorizontal|Trash|Edit|Delete|destructive|confirm)\b/iu.test(context) &&
    hasClassRecipe(text) &&
    (HEIGHT_PATTERN.test(text) || hasPadding(text) || hasTailwindColor(text) || /\b(?:text-xs|text-sm|h-\d|w-\d|size-\d)\b/u.test(text))
  ) {
    addViolation(findings, seen, filePath, line, "action-surface", token, "New runtime code appears to own action/menu/icon/destructive visual recipes. Use shared action/menu/icon contracts.")
  }
}

function countBy<T extends string>(items: GuardrailViolation[], selector: (item: GuardrailViolation) => T): Record<T, number> {
  return items.reduce<Record<T, number>>((acc, item) => {
    const key = selector(item)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {} as Record<T, number>)
}

function formatCode(value: string): string {
  return value.replace(/`/g, "'").replace(/\|/g, "\\|")
}

function formatMarkdown(findings: GuardrailViolation[], changed: ChangedFilesResult, scannedFiles: string[], addedLines: AddedLine[]): string {
  const status = changed.skippedReason ? "skipped" : findings.length > 0 ? "failed" : "passed"
  const findingRows = findings
    .map((finding) => `| ${finding.bucket} | \`${finding.filePath}:${finding.line}\` | \`${formatCode(finding.token)}\` | ${finding.recommendedContract} |`)
    .join("\n")

  return `# UI Changed-File Visual Ownership Guardrail

- Status: ${status}
- Base ref: ${changed.baseRef ?? "not resolved"}
- Head ref: ${changed.headRef}
- Diff range: ${changed.range ?? "not resolved"}
- Changed files: ${changed.files.length}
- Scanned changed files: ${scannedFiles.length}
- Scanned added lines: ${addedLines.length}
- Violations: ${findings.length}
${changed.skippedReason ? `- Skipped reason: ${changed.skippedReason}\n` : ""}

## Behavior

This guardrail scans added lines in changed files only. It does not make the historical repository baseline release-blocking. Repository-wide debt remains visible in \`reports/ui-visual-audit.*\`, \`reports/ui-visual-ownership.*\`, and \`reports/ui-coverage-audit.*\`.

## Blocking buckets

${Object.entries(BUCKET_CONTRACTS).map(([bucket, contract]) => `- ${bucket}: ${contract}`).join("\n")}

## Violations

| Bucket | Location | Evidence | Expected shared contract |
| --- | --- | --- | --- |
${findingRows || "| - | - | - | - |"}

## Exact accepted shared contract owners

${Array.from(ACCEPTED_SHARED_CONTRACT_OWNERS).sort().map((filePath) => `- \`${filePath}\``).join("\n")}

## Exact accepted marketing/auth exceptions

${Array.from(ACCEPTED_MARKETING_AUTH_EXCEPTIONS).sort().map((filePath) => `- \`${filePath}\``).join("\n")}
`
}

function writeReports(findings: GuardrailViolation[], changed: ChangedFilesResult, scannedFiles: string[], addedLines: AddedLine[]): void {
  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  const report = {
    generatedAt: new Date().toISOString(),
    mode: "changed-added-lines-enforcing",
    skipped: Boolean(changed.skippedReason),
    skippedReason: changed.skippedReason,
    baseRef: changed.baseRef,
    headRef: changed.headRef,
    range: changed.range,
    changedFiles: changed.files,
    scannedChangedFiles: scannedFiles,
    scannedAddedLineCount: addedLines.length,
    violationCount: findings.length,
    bucketCounts: countBy(findings, (finding) => finding.bucket),
    acceptedSharedContractOwners: Array.from(ACCEPTED_SHARED_CONTRACT_OWNERS).sort(),
    acceptedMarketingAuthExceptions: Array.from(ACCEPTED_MARKETING_AUTH_EXCEPTIONS).sort(),
    guardrailContracts: BUCKET_CONTRACTS,
    violations: findings,
  }

  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(report, null, 2))
  fs.writeFileSync(REPORT_MD_PATH, formatMarkdown(findings, changed, scannedFiles, addedLines))
}

function main(): void {
  const options = parseArgs(process.argv.slice(2))
  const changed = getChangedFiles(options)
  const scannedFiles = changed.files.map(toPosix).filter(isScannableChangedFile)
  const addedLines = addedLinesFromPatch(changed, scannedFiles)
  const findings: GuardrailViolation[] = []
  const seen = new Set<string>()

  for (const addedLine of addedLines) scanAddedLine(addedLine, findings, seen)

  const blockingFindings = findings.filter(f => f.ownership !== "accepted-shared-contract")

  writeReports(findings, changed, scannedFiles, addedLines)

  if (changed.skippedReason) {
    console.log(`UI changed-file visual ownership guardrail skipped: ${changed.skippedReason}`)
    console.log(`Report: ${path.relative(ROOT, REPORT_MD_PATH)}`)
    return
  }

  if (blockingFindings.length > 0) {
    console.error(`UI changed-file visual ownership guardrail failed with ${blockingFindings.length} blocking violation(s) (${findings.length - blockingFindings.length} accepted-shared-contract excluded).`)
    console.error(`Report: ${path.relative(ROOT, REPORT_MD_PATH)}`)
    process.exitCode = 1
    return
  }

  console.log(`UI changed-file visual ownership guardrail passed. Scanned ${addedLines.length} added line(s) across ${scannedFiles.length} changed file(s).`)
  console.log(`Report: ${path.relative(ROOT, REPORT_MD_PATH)}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
