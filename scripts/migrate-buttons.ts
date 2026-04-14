import fs from "node:fs"
import path from "node:path"
import ts from "typescript"
import { pathToFileURL } from "node:url"

type ButtonLikeKind =
  | "html-button"
  | "component-button"
  | "anchor-button-like"
  | "link-button-like"
  | "role-button"
  | "clickable-div-span"

interface ButtonLikeRecord {
  filePath: string
  componentName: string
  kind: ButtonLikeKind
  propsUsed: string[]
  className?: string
  tailwindUtilities: string[]
  eventHandlers: string[]
  variantHints: string[]
  hasInlineStyle: boolean
  hasIcon: boolean
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
const BUTTON_REPORT_PATH = path.join(ROOT, "reports", "button-audit.json")
const SPEC_REPORT_PATH = path.join(ROOT, "reports", "button-canonical-spec.md")

const CLASS_VARIANT_MAP: Array<[RegExp, string]> = [
  [/\bbg-primary\b/, "primary"],
  [/\bborder\b/, "outline"],
  [/\btext-destructive\b|\bbg-destructive\b/, "destructive"],
  [/\bhover:bg-accent\b|\btext-muted-foreground\b/, "ghost"],
  [/\bbg-secondary\b/, "secondary"],
  [/\bunderline\b/, "link"],
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

function getClassValue(attr?: ts.JsxAttribute): string | undefined {
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

function getVariantHint(className?: string): string[] {
  if (!className) return []
  const hints = new Set<string>()
  for (const [pattern, variant] of CLASS_VARIANT_MAP) {
    if (pattern.test(className)) hints.add(variant)
  }
  return [...hints]
}

function collectEventHandlers(node: ts.JsxAttributes): string[] {
  return node.properties
    .filter((p): p is ts.JsxAttribute => ts.isJsxAttribute(p))
    .map((p) => p.name.getText())
    .filter((name) => /^on[A-Z]/.test(name))
}

function attrsToProps(node: ts.JsxAttributes): string[] {
  return node.properties
    .map((prop) => {
      if (ts.isJsxSpreadAttribute(prop)) return `...${prop.expression.getText()}`
      return prop.name.getText()
    })
    .filter(Boolean)
}

function isButtonLikeClass(className?: string) {
  if (!className) return false
  return /(inline-flex|rounded|\bpx-|\bpy-|\bh-|\bbg-|\bborder|cursor-pointer|\bsize-)/.test(className)
}

function isLikelyButtonLink(attrs: ts.JsxAttributes): boolean {
  const className = getClassValue(getJsxAttribute(attrs, "className"))
  return isButtonLikeClass(className)
}

function pushRecord(records: ButtonLikeRecord[], filePath: string, kind: ButtonLikeKind, attrs: ts.JsxAttributes, childrenText = "") {
  const className = getClassValue(getJsxAttribute(attrs, "className"))
  records.push({
    filePath: path.relative(ROOT, filePath),
    componentName: path.basename(filePath),
    kind,
    propsUsed: attrsToProps(attrs),
    className,
    tailwindUtilities: getTailwindUtilities(className),
    eventHandlers: collectEventHandlers(attrs),
    variantHints: getVariantHint(className),
    hasInlineStyle: Boolean(getJsxAttribute(attrs, "style")),
    hasIcon: /Icon|svg|Loader2|Chevron|Plus|Trash/.test(childrenText),
  })
}

export function ensureButtonImport(code: string): string {
  let nextCode = code
  if (code.includes('from "@/components/ui/button"') || code.includes("from '@/components/ui/button'")) {
    nextCode = code
      .replace('from "@/components/ui/button"', 'from "@/shared/ui/button"')
      .replace("from '@/components/ui/button'", "from '@/shared/ui/button'")
  }

  const sharedImportRegex = /import\s+\{([^}]+)\}\s+from\s+["']@\/shared\/ui\/button["'];?/
  const match = nextCode.match(sharedImportRegex)
  if (match) {
    const names = match[1].split(",").map((n) => n.trim()).filter(Boolean)
    if (!names.includes("Button")) {
      const merged = [...new Set([...names, "Button"])].join(", ")
      return nextCode.replace(sharedImportRegex, `import { ${merged} } from "@/shared/ui/button"`)
    }
    return nextCode
  }

  const importMatch = nextCode.match(/import[\s\S]*?from\s+["'][^"']+["'];?\n/g)
  const importLine = 'import { Button } from "@/shared/ui/button"\n'
  if (!importMatch || importMatch.length === 0) return importLine + nextCode
  const last = importMatch[importMatch.length - 1]
  const idx = nextCode.indexOf(last) + last.length
  return nextCode.slice(0, idx) + importLine + nextCode.slice(idx)
}

export function migrateCode(code: string, filePath = "file.tsx") {
  const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const transforms: Transform[] = []

  function visit(node: ts.Node) {
    if (ts.isJsxElement(node)) {
      const tagName = node.openingElement.tagName.getText(sourceFile)
      if (tagName === "button") {
        transforms.push({
          start: node.openingElement.tagName.getStart(sourceFile),
          end: node.openingElement.tagName.getEnd(),
          text: "Button",
        })
        transforms.push({
          start: node.closingElement.tagName.getStart(sourceFile),
          end: node.closingElement.tagName.getEnd(),
          text: "Button",
        })
      }

      if ((tagName === "a" || tagName === "Link") && isLikelyButtonLink(node.openingElement.attributes)) {
        const original = node.getText(sourceFile)
        transforms.push({
          start: node.getStart(sourceFile),
          end: node.getEnd(),
          text: `<Button asChild>${original}</Button>`,
        })
      }
    }

    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(sourceFile) === "button") {
      transforms.push({
        start: node.tagName.getStart(sourceFile),
        end: node.tagName.getEnd(),
        text: "Button",
      })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  if (transforms.length === 0) return { changed: false, code }

  const sorted = transforms.sort((a, b) => b.start - a.start)
  let next = code
  for (const t of sorted) next = next.slice(0, t.start) + t.text + next.slice(t.end)
  next = ensureButtonImport(next)
  return { changed: next !== code, code: next }
}

function writeReports(records: ButtonLikeRecord[], changedCount: number) {
  fs.mkdirSync(path.dirname(BUTTON_REPORT_PATH), { recursive: true })
  fs.writeFileSync(
    BUTTON_REPORT_PATH,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), total: records.length, changedFiles: changedCount, records },
      null,
      2
    )
  )

  const canonical = fs.readFileSync(path.join(ROOT, "shared/ui/button.tsx"), "utf8")
  fs.writeFileSync(
    SPEC_REPORT_PATH,
    `# Canonical Button Spec\n\nSource: shared/ui/button.tsx\n\n\`\`\`tsx\n${canonical}\n\`\`\`\n`
  )
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  const allFiles = SCAN_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))
  const records: ButtonLikeRecord[] = []
  let changedCount = 0

  for (const filePath of allFiles) {
    const code = fs.readFileSync(filePath, "utf8")
    const source = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

    const visit = (node: ts.Node) => {
      if (ts.isJsxElement(node)) {
        const tagName = node.openingElement.tagName.getText(source)
        const attrs = node.openingElement.attributes
        const text = node.getText(source)

        if (tagName === "button") pushRecord(records, filePath, "html-button", attrs, text)
        if (tagName === "Button") pushRecord(records, filePath, "component-button", attrs, text)
        if (tagName === "a" && isLikelyButtonLink(attrs)) pushRecord(records, filePath, "anchor-button-like", attrs, text)
        if (tagName === "Link" && isLikelyButtonLink(attrs)) pushRecord(records, filePath, "link-button-like", attrs, text)
        if (getJsxAttribute(attrs, "role")?.getText(source).includes("button")) pushRecord(records, filePath, "role-button", attrs, text)
        if ((tagName === "div" || tagName === "span") && getJsxAttribute(attrs, "onClick")) pushRecord(records, filePath, "clickable-div-span", attrs, text)
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
    console.log(`Report: ${path.relative(ROOT, BUTTON_REPORT_PATH)}`)
    console.log(`Canonical spec: ${path.relative(ROOT, SPEC_REPORT_PATH)}`)
  }

  console.log(`Button audit complete. Found ${records.length} button-like instances.`)
  if (options.write) console.log(`Migrated ${changedCount} file(s).`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
