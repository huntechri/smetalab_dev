import fs from "node:fs"
import path from "node:path"
import ts from "typescript"
import { pathToFileURL } from "node:url"

type FieldKind =
  | "html-input"
  | "html-textarea"
  | "html-select"
  | "html-hidden-input"
  | "component-input"
  | "component-textarea"
  | "component-select"
  | "component-select-trigger"
  | "component-command-input"

interface FieldRecord {
  filePath: string
  componentName: string
  kind: FieldKind
  propsUsed: string[]
  className?: string
  tailwindUtilities: string[]
  type?: string
  hasInlineStyle: boolean
  isHiddenInput: boolean
  normalizedClassName?: string
}

interface Transform {
  start: number
  end: number
  text: string
}

interface MigrationOptions {
  write: boolean
  report: boolean
}

const ROOT = process.cwd()
const SCAN_DIRS = ["app", "components", "features", "shared", "widgets"]
const EXTS = new Set([".tsx", ".jsx"])
const INPUT_REPORT_PATH = path.join(ROOT, "reports", "input-audit.json")
const SPEC_REPORT_PATH = path.join(ROOT, "reports", "input-canonical-spec.md")
const DOC_REPORT_PATH = path.join(ROOT, "docs", "inputs_audit_updated.md")

const DROP_STYLE_UTILITY_PATTERNS: RegExp[] = [
  /^h-\d+$/,
  /^h-\[[^\]]+\]$/,
  /^border(?:-.+)?$/,
  /^border-none$/,
  /^bg-.+$/,
  /^font-.+$/,
  /^text-(?:xs|sm|base|lg|xl|\[[^\]]+\]|left|center|right)$/,
  /^placeholder:.+$/,
  /^shadow(?:-.+)?$/,
  /^shadow-none$/,
  /^rounded(?:-.+)?$/,
  /^px-\d+$/,
  /^py-\d+$/,
  /^p-\d+$/,
]

export function parseArgs(argv: string[]): MigrationOptions {
  const args = new Set(argv)
  return {
    write: args.has("--write"),
    report: args.has("--report") || args.has("--write"),
  }
}

function walk(dir: string, files: string[] = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".next") || entry.name === "node_modules") continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(fullPath, files)
    else if (EXTS.has(path.extname(entry.name))) files.push(fullPath)
  }
  return files
}

function getJsxAttribute(node: ts.JsxAttributes, name: string): ts.JsxAttribute | undefined {
  return node.properties.find(
    (p): p is ts.JsxAttribute => ts.isJsxAttribute(p) && p.name.getText() === name
  )
}

function getStringLikeAttribute(attr?: ts.JsxAttribute): string | undefined {
  if (!attr?.initializer) return undefined
  if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text
  if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
    const expr = attr.initializer.expression
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text
  }
  return undefined
}

function getTailwindUtilities(className?: string): string[] {
  if (!className) return []
  return className.split(/\s+/).filter(Boolean)
}

function normalizeInputClassName(className?: string): string | undefined {
  if (!className) return className
  const kept = className
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !DROP_STYLE_UTILITY_PATTERNS.some((pattern) => pattern.test(token)))

  if (kept.length === 0) return undefined
  return kept.join(" ")
}

function attrsToProps(node: ts.JsxAttributes): string[] {
  return node.properties
    .map((prop) => {
      if (ts.isJsxSpreadAttribute(prop)) return `...${prop.expression.getText()}`
      return prop.name.getText()
    })
    .filter(Boolean)
}

function getKind(tagName: string): FieldKind | null {
  if (tagName === "input") return "html-input"
  if (tagName === "textarea") return "html-textarea"
  if (tagName === "select") return "html-select"
  if (tagName === "Input") return "component-input"
  if (tagName === "Textarea") return "component-textarea"
  if (tagName === "Select") return "component-select"
  if (tagName === "SelectTrigger") return "component-select-trigger"
  if (tagName === "CommandInput") return "component-command-input"
  return null
}

function pushRecord(records: FieldRecord[], filePath: string, kind: FieldKind, attrs: ts.JsxAttributes) {
  const className = getStringLikeAttribute(getJsxAttribute(attrs, "className"))
  const type = getStringLikeAttribute(getJsxAttribute(attrs, "type"))
  const normalizedKind = kind === "html-input" && type === "hidden" ? "html-hidden-input" : kind
  records.push({
    filePath: path.relative(ROOT, filePath),
    componentName: path.basename(filePath),
    kind: normalizedKind,
    propsUsed: attrsToProps(attrs),
    className,
    tailwindUtilities: getTailwindUtilities(className),
    type,
    hasInlineStyle: Boolean(getJsxAttribute(attrs, "style")),
    isHiddenInput: normalizedKind === "html-hidden-input",
    normalizedClassName: kind === "component-input" || kind === "component-textarea" ? normalizeInputClassName(className) : className,
  })
}

function buildUpdatedClassAttributeText(originalAttrText: string, normalized?: string) {
  if (!normalized) return ""

  if (/^className\s*=\s*"/.test(originalAttrText) || /^className\s*=\s*'/.test(originalAttrText)) {
    return `className="${normalized}"`
  }

  return `className={"${normalized}"}`
}

export function migrateCode(code: string, filePath = "file.tsx") {
  const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const transforms: Transform[] = []

  function maybeNormalizeClass(attrs: ts.JsxAttributes, tagName: string, source: ts.SourceFile) {
    if (tagName !== "Input" && tagName !== "Textarea" && tagName !== "SelectTrigger" && tagName !== "CommandInput") return
    const classAttr = getJsxAttribute(attrs, "className")
    if (!classAttr) return

    const classValue = getStringLikeAttribute(classAttr)
    if (!classValue) return

    const normalized = normalizeInputClassName(classValue)
    if (normalized === classValue) return

    const originalAttrText = classAttr.getText(source)
    const replacement = buildUpdatedClassAttributeText(originalAttrText, normalized)
    let start = classAttr.getStart(source)
    if (!normalized && start > 0 && source.text[start - 1] === " ") {
      start -= 1
    }
    transforms.push({
      start,
      end: classAttr.getEnd(),
      text: replacement,
    })
  }

  function visit(node: ts.Node) {
    if (ts.isJsxElement(node)) {
      const tagName = node.openingElement.tagName.getText(sourceFile)
      maybeNormalizeClass(node.openingElement.attributes, tagName, sourceFile)
    }

    if (ts.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName.getText(sourceFile)
      maybeNormalizeClass(node.attributes, tagName, sourceFile)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  if (transforms.length === 0) return { changed: false, code }
  const sorted = transforms.sort((a, b) => b.start - a.start)
  let next = code
  for (const transform of sorted) next = next.slice(0, transform.start) + transform.text + next.slice(transform.end)

  return { changed: next !== code, code: next }
}

function writeReports(records: FieldRecord[], changedCount: number) {
  fs.mkdirSync(path.dirname(INPUT_REPORT_PATH), { recursive: true })
  fs.writeFileSync(
    INPUT_REPORT_PATH,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), total: records.length, changedFiles: changedCount, records },
      null,
      2
    )
  )

  const canonicalInput = fs.readFileSync(path.join(ROOT, "shared/ui/input.tsx"), "utf8")
  const canonicalTextarea = fs.readFileSync(path.join(ROOT, "shared/ui/textarea.tsx"), "utf8")
  fs.writeFileSync(
    SPEC_REPORT_PATH,
    `# Canonical Input Spec\n\nSources: shared/ui/input.tsx, shared/ui/textarea.tsx\n\n\`\`\`tsx\n${canonicalInput}\n\`\`\`\n\n\`\`\`tsx\n${canonicalTextarea}\n\`\`\`\n`
  )

  const byKind = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.kind] = (acc[record.kind] ?? 0) + 1
    return acc
  }, {})
  const kindLines = Object.entries(byKind)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([kind, total]) => `- ${kind}: ${total}`)
    .join("\n")
  const details = records
    .map(
      (record) =>
        `File: ${record.filePath}\nKind: ${record.kind}\nType: ${record.type ?? "default"}\nClasses: ${record.className ?? ""}\nInline style: ${record.hasInlineStyle ? "yes" : "no"}\n-------------------`
    )
    .join("\n\n")
  fs.writeFileSync(
    DOC_REPORT_PATH,
    `# Updated Input Fields Audit\n\nTotal fields found: ${records.length}\n\n## Breakdown by kind\n${kindLines}\n\n## Details\n\n${details}\n`
  )
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  const allFiles = SCAN_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))
  const records: FieldRecord[] = []
  let changedCount = 0

  for (const filePath of allFiles) {
    const code = fs.readFileSync(filePath, "utf8")
    const source = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

    const visit = (node: ts.Node) => {
      if (ts.isJsxElement(node)) {
        const tagName = node.openingElement.tagName.getText(source)
        const kind = getKind(tagName)
        if (kind) pushRecord(records, filePath, kind, node.openingElement.attributes)
      }

      if (ts.isJsxSelfClosingElement(node)) {
        const tagName = node.tagName.getText(source)
        const kind = getKind(tagName)
        if (kind) pushRecord(records, filePath, kind, node.attributes)
      }

      ts.forEachChild(node, visit)
    }
    visit(source)

    const migrated = migrateCode(code, filePath)
    if (options.write && migrated.changed) {
      fs.writeFileSync(filePath, migrated.code)
      changedCount += 1
    }
  }

  if (options.report) {
    writeReports(records, changedCount)
    console.log(`Report: ${path.relative(ROOT, INPUT_REPORT_PATH)}`)
    console.log(`Canonical spec: ${path.relative(ROOT, SPEC_REPORT_PATH)}`)
    console.log(`Docs report: ${path.relative(ROOT, DOC_REPORT_PATH)}`)
  }

  console.log(`Input audit complete. Found ${records.length} field-like instances.`)
  if (options.write) console.log(`Normalized ${changedCount} file(s).`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}

export { normalizeInputClassName }
