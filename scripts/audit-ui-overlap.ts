#!/usr/bin/env tsx
/**
 * UI Component Overlap Audit — Dynamic Edition
 *
 * Dynamically scans shared/ui/ for exported components, categorizes them,
 * finds usages in features/ and app/, and detects overlapping implementations.
 *
 * Usage: tsx scripts/audit-ui-overlap.ts
 */

import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
const SHARED_UI = path.join(ROOT, "shared/ui")
const REPORT_JSON = path.join(ROOT, "reports", "ui-overlap.json")
const REPORT_MD = path.join(ROOT, "reports", "ui-overlap.md")

// ─── Category Configuration ───────────────────────────────────────────────

interface CategoryDef {
  name: string
  filePatterns: string[]
  canonicalFiles: string[]
}

const categories: Record<string, CategoryDef> = {
  "1": {
    name: "Badge / Token / Pill",
    filePatterns: [
      "badge.tsx",
      "status-badge.tsx",
      "catalog-token.tsx",
      "dense-list/tokens.tsx",
      "dense-list/metrics.tsx",
    ],
    canonicalFiles: ["badge.tsx"],
  },
  "2": {
    name: "Button",
    filePatterns: [
      "button.tsx",
      "toolbar-button.tsx",
      "toggle.tsx",
      "toggle-group.tsx",
      "button-group.tsx",
    ],
    canonicalFiles: ["button.tsx"],
  },
  "3": {
    name: "Input",
    filePatterns: [
      "input.tsx",
      "search-input.tsx",
      "search-control.tsx",
      "input-group.tsx",
      "hidden-input.tsx",
      "file-input.tsx",
      "textarea.tsx",
      "select.tsx",
    ],
    canonicalFiles: ["input.tsx", "select.tsx", "textarea.tsx"],
  },
  "4": {
    name: "Card / Surface",
    filePatterns: [
      "card.tsx",
      "card-shell.tsx",
      "surface.tsx",
      "dense-card.tsx",
      "dense-list/cards.tsx",
      "kpi-card.tsx",
      "editable-data-surface.tsx",
    ],
    canonicalFiles: ["card.tsx", "surface.tsx"],
  },
  "5": {
    name: "Panel / Layout",
    filePatterns: [
      "page-shell.tsx",
      "section.tsx",
      "dense-list/layout.tsx",
      "dashboard-layout.tsx",
      "content-container.tsx",
      "app-header.tsx",
    ],
    canonicalFiles: ["page-shell.tsx", "section.tsx"],
  },
  "6": {
    name: "Table",
    filePatterns: [
      "table.tsx",
      "data-table.tsx",
      "table-density.tsx",
      "table-actions.tsx",
      "data-table/data-table-row.tsx",
      "data-table/data-table-skeleton.tsx",
      "data-table/data-table-toolbar.tsx",
    ],
    canonicalFiles: ["table.tsx"],
  },
  "7": {
    name: "Form",
    filePatterns: [
      "form.tsx",
      "form-layout.tsx",
      "field.tsx",
      "label.tsx",
    ],
    canonicalFiles: ["form-layout.tsx", "form.tsx"],
  },
  "8": {
    name: "Navigation / Tabs",
    filePatterns: [
      "tabs.tsx",
      "workspace-tabs.tsx",
      "sidebar.tsx",
      "breadcrumbs.tsx",
      "navigation-menu.tsx",
      "sidebar-nav-item.tsx",
    ],
    canonicalFiles: ["tabs.tsx", "sidebar.tsx", "breadcrumbs.tsx"],
  },
  "9": {
    name: "Overlay",
    filePatterns: [
      "dialog.tsx",
      "drawer.tsx",
      "sheet.tsx",
      "popover.tsx",
      "hover-card.tsx",
      "alert-dialog.tsx",
      "tooltip.tsx",
      "context-menu.tsx",
      "command.tsx",
      "menubar.tsx",
    ],
    canonicalFiles: ["dialog.tsx", "sheet.tsx", "popover.tsx", "tooltip.tsx"],
  },
  "10": {
    name: "State / Loading",
    filePatterns: [
      "states/*",
      "spinner.tsx",
      "skeleton.tsx",
      "loading-indicator.tsx",
      "table-empty-state.tsx",
      "empty.tsx",
    ],
    canonicalFiles: ["skeleton.tsx"],
  },
  "11": {
    name: "Marketing",
    filePatterns: [
      "marketing-shell.tsx",
      "auth-shell.tsx",
    ],
    canonicalFiles: ["marketing-shell.tsx", "auth-shell.tsx"],
  },
  "12": {
    name: "Data Display",
    filePatterns: [
      "cells/*",
    ],
    canonicalFiles: [],
  },
  "13": {
    name: "Containers / Helpers",
    filePatterns: [
      "separator.tsx",
      "scroll-area.tsx",
      "accordion.tsx",
      "carousel.tsx",
      "resizable.tsx",
      "collapsible.tsx",
      "progress.tsx",
      "slider.tsx",
      "switch.tsx",
      "checkbox.tsx",
      "radio-group.tsx",
      "calendar.tsx",
      "date-picker.tsx",
      "avatar.tsx",
    ],
    canonicalFiles: ["separator.tsx", "scroll-area.tsx", "accordion.tsx"],
  },
  "14": {
    name: "Layout Constants (.ts files)",
    filePatterns: [
      "primitive-surface.ts",
      "primitive-spacing.ts",
      "primitive-density.ts",
      "primitive-controls.ts",
      "primitive-navigation.ts",
      "primitive-table.ts",
      "primitive-badge.ts",
      "primitive-form.ts",
      "primitive-overlay.ts",
      "primitive-chart.ts",
      "primitive-marketing.ts",
      "dense-list/toolbar.ts",
      "dense-list/table.ts",
      "dense-list/pickers.tsx",
    ],
    canonicalFiles: [
      "primitive-surface.ts", "primitive-spacing.ts", "primitive-density.ts",
      "primitive-controls.ts", "primitive-navigation.ts", "primitive-table.ts",
      "primitive-badge.ts", "primitive-form.ts", "primitive-overlay.ts",
      "primitive-chart.ts", "primitive-marketing.ts",
    ],
  },
  "15": {
    name: "Inline Editors",
    filePatterns: [
      "dense-list/inline-edit.ts",
    ],
    canonicalFiles: ["dense-list/inline-edit.ts"],
  },
  "16": {
    name: "Shells / Wrappers",
    filePatterns: [
      "shells/*",
    ],
    canonicalFiles: [],
  },
}

const EXCLUDED_FILES = new Set([
  "cells/index.ts",
  "data-table/index.ts",
  "shells/index.ts",
  "states/index.ts",
])

const FILE_EXTENSIONS = new Set([".ts", ".tsx"])

// ─── Types ─────────────────────────────────────────────────────────────────

interface ComponentInfo {
  file: string
  componentName: string
  hasFile: boolean
  exported: boolean
  isComponent: boolean
  usageCount: number
  usageFiles: string[]
  sameCategoryImports: string[]   // imports from the same category
  crossCategoryImports: string[]  // imports from other categories
  containsRawClasses: boolean
  category: string
}

interface CategoryReport {
  name: string
  components: ComponentInfo[]
  overlap: string
  recommendation: string
  canonical: string[]
  deprecated: ComponentInfo[]
  /** Files that exist in the category but have no component exports */
  nonComponentFiles: string[]
}

interface OverlapReport {
  generatedAt: string
  summary: {
    totalCategories: number
    totalComponents: number
    totalDeprecated: number
    hasDuplicates: boolean
  }
  categories: Record<string, CategoryReport>
}

// ─── Utility ───────────────────────────────────────────────────────────────

function toPosix(p: string): string {
  return p.split(path.sep).join("/")
}

function isExcluded(rel: string): boolean {
  if (
    rel.startsWith("node_modules/") ||
    rel.startsWith(".next/") ||
    rel.startsWith(".vercel/") ||
    rel.startsWith("coverage/") ||
    rel.startsWith("reports/") ||
    rel.startsWith("docs/") ||
    rel.startsWith(".agents/") ||
    rel.startsWith(".git/") ||
    rel.startsWith("dist/") ||
    rel.startsWith("build/")
  ) return true
  if (/\.(test|spec|stories?)\.(ts|tsx)$/.test(rel)) return true
  return false
}

function walk(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    const rel = toPosix(path.relative(ROOT, full))
    if (isExcluded(rel)) continue
    if (entry.isDirectory()) walk(full, files)
    else if (FILE_EXTENSIONS.has(path.extname(entry.name))) files.push(full)
  }
  return files
}

function isComponentName(name: string): boolean {
  if (!/^[A-Z]/.test(name)) return false
  // Skip type-like names
  if (/(Props|Variants|VariantsProps|Variant|Tone|Size|Density|Layout|Mode|Border|Elevation)$/.test(name)) return false
  // Skip CSS class name constants
  if (/(ClassName|ClassNames|Padding|Gap|ColorPicker)$/.test(name)) return false
  // Skip utility strings
  if (/(BaseSize|BasePadding|IndicatorClassName)$/.test(name)) return false
  return true
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// ─── File Scanning ────────────────────────────────────────────────────────

/**
 * Map file -> list of component exports
 */
function scanFilesForComponents(): Map<string, string[]> {
  const db = new Map<string, string[]>()

  // Walk shared/ui/ recursively
  const allFiles = walk(SHARED_UI)
  for (const f of allFiles) {
    const rel = toPosix(path.relative(SHARED_UI, f))
    if (EXCLUDED_FILES.has(rel)) continue
    const names = extractComponentExports(f)
    if (names.length > 0) {
      db.set(rel, names)
    }
  }

  return db
}

/**
 * Extract React component exports from a file.
 * Handles patterns:
 *   - function Xxx / export function Xxx
 *   - const Xxx = ... (arrow functions)
 *   - export { Xxx } (single and multi-line)
 *   - export default function Xxx
 */
function extractComponentExports(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    const names: string[] = []

    // 1. Function declarations (with or without export)
    const funcPattern = /(?:export\s+)?function\s+([A-Z]\w+)/g
    let m: RegExpExecArray | null
    while ((m = funcPattern.exec(content)) !== null) {
      if (isComponentName(m[1])) names.push(m[1])
    }

    // 2. const/let components (arrow functions, forwardRef, etc.)
    //    Matches: const Xxx = (..., const Xxx = React.forwardRef(..., const Xxx = React.memo(...
    const constPattern = /(?:export\s+)?(?:const|let|var)\s+([A-Z]\w+)\s*=\s*(?:\(|[A-Z]\w+\.(?:forwardRef|memo|createRef|createElement|isValidElement))/g
    while ((m = constPattern.exec(content)) !== null) {
      if (isComponentName(m[1])) names.push(m[1])
    }

    // 3. export default function/class
    const defaultPattern = /export\s+default\s+(?:function|class)\s+([A-Z]\w+)/g
    while ((m = defaultPattern.exec(content)) !== null) {
      if (isComponentName(m[1])) names.push(m[1])
    }

    // 4. export { Xxx } — single-line
    const singleLineBrace = /^export\s+\{([^}]+)\}/gm
    while ((m = singleLineBrace.exec(content)) !== null) {
      const after = content.slice(m.index + m[0].length)
      if (/^\s*from\b/.test(after)) continue  // skip re-exports
      const items = m[1].split(",").map(s => {
        const parts = s.trim().split(/\s+as\s+/)
        return parts.length > 1 ? parts[1].trim() : parts[0].trim()
      })
      for (const name of items) {
        if (isComponentName(name)) names.push(name)
      }
    }

    // 5. export { Xxx, ... } — multi-line
    const multiLineBrace = /^export\s*\{[\s\S]*?\}/gm
    while ((m = multiLineBrace.exec(content)) !== null) {
      const after = content.slice(m.index + m[0].length)
      if (/^\s*from\b/.test(after)) continue  // skip re-exports
      const block = m[0]
      // Extract capitalized names from the block
      const nameMatches = [...block.matchAll(/([A-Z]\w+)/g)]
      for (const nm of nameMatches) {
        if (isComponentName(nm[1])) names.push(nm[1])
      }
    }

    return [...new Set(names)]
  } catch {
    return []
  }
}

/**
 * Get ALL function definitions (with or without export) to compare against
 * the export list. This helps detect if a component is actually exported.
 */
function getAllFunctionDefs(filePath: string): Set<string> {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    const funcs = new Set<string>()

    const funcPattern = /(?:export\s+)?function\s+([A-Z]\w+)/g
    let m: RegExpExecArray | null
    while ((m = funcPattern.exec(content)) !== null) {
      funcs.add(m[1])
    }

    const constPattern = /(?:export\s+)?(?:const|let|var)\s+([A-Z]\w+)\s*=\s*(?:\(|\(\))/g
    while ((m = constPattern.exec(content)) !== null) {
      funcs.add(m[1])
    }

    return funcs
  } catch {
    return new Set()
  }
}

/**
 * Check if a component is actually exported (not just defined).
 */
function isComponentExported(filePath: string, componentName: string): boolean {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    // Check if component is defined
    const defined = new RegExp(`(?:^|\\n|;)\\s*(?:export\\s+)?function\\s+${escapeRegex(componentName)}`).test(content)
      || new RegExp(`(?:^|\\n|;)\\s*(?:export\\s+)?(?:const|let|var)\\s+${escapeRegex(componentName)}\\s*=`).test(content)
    if (!defined) return false

    // Check if it's exported — either inline or in an export block
    const inlineExport = new RegExp(`export\\s+function\\s+${escapeRegex(componentName)}`).test(content)
      || new RegExp(`export\\s+(?:const|let|var)\\s+${escapeRegex(componentName)}`).test(content)

    const exportBlock = new RegExp(`export\\s*\\{[^}]*\\b${escapeRegex(componentName)}\\b`).test(content)

    // For multi-line:
    const multiBlock = new RegExp(`export\\s*\\{[\\s\\S]*?\\b${escapeRegex(componentName)}\\b[\\s\\S]*?\\}`, "m").test(content)

    return inlineExport || exportBlock || multiBlock
  } catch {
    return true
  }
}

/**
 * Find imports from @/shared/ui/ grouped by whether they're from
 * the same category or different category.
 */
function detectCategoryImports(
  filePath: string,
  sameCategoryFiles: string[],
): { same: string[]; cross: string[] } {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    const same: string[] = []
    const cross: string[] = []

    const importPattern = /import\s+\{([^}]+)\}\s+from\s+['"]@\/shared\/ui\/([^'"]+)['"]/g
    let m: RegExpExecArray | null
    while ((m = importPattern.exec(content)) !== null) {
      const names = m[1].split(",").map(n => n.trim()).filter(Boolean)
      const importPath = m[2]

      const componentNames = names.filter(n => /^[A-Z]/.test(n))
      if (componentNames.length === 0) continue

      // Check if the import path matches any same-category file
      const isSameCategory = sameCategoryFiles.some(cf =>
        importPath === cf.replace(/\.tsx?$/, "") ||
        importPath.startsWith(cf.replace(/\.tsx?$/, "") + "/")
      )

      if (isSameCategory) {
        same.push(...componentNames)
      } else {
        cross.push(...componentNames)
      }
    }

    return { same: [...new Set(same)], cross: [...new Set(cross)] }
  } catch {
    return { same: [], cross: [] }
  }
}

function detectRawClasses(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    const pattern = /className\s*=\s*["'`][^"'`]*(?:rounded|border|bg-|text-|font-|p[txrble]?-|m[txrble]?-|h-|w-|gap-|flex|grid|shadow|space-|items-|justify-|self-|truncate)[^"'`]*["'`]/g
    return pattern.test(content)
  } catch { return false }
}

function findUsages(componentName: string): { count: number; files: string[] } {
  if (!componentName) return { count: 0, files: [] }

  const dirs = [
    path.join(ROOT, "features"),
    path.join(ROOT, "app"),
  ]
  const found: string[] = []

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue
    const files = walk(dir)
    for (const f of files) {
      try {
        const content = fs.readFileSync(f, "utf8")
        const importPat = new RegExp(
          `import\\s+(?:\\{[^}]*\\b${escapeRegex(componentName)}\\b[^}]*\\}|${escapeRegex(componentName)}\\b)\\s+from\\s+['"](?:@/shared/ui/)`,
          "m"
        )
        const jsxPat = new RegExp(`<${escapeRegex(componentName)}(?:\\s|>|/)`, "m")
        if (importPat.test(content) || jsxPat.test(content)) {
          found.push(toPosix(path.relative(ROOT, f)))
        }
      } catch { /* skip */ }
    }
  }

  return { count: found.length, files: found.slice(0, 50) }
}

function fileMatchesCategory(fileRel: string, cat: CategoryDef): boolean {
  return cat.filePatterns.some(pattern => {
    if (pattern.endsWith("/*")) {
      return fileRel.startsWith(pattern.slice(0, -1))
    }
    return fileRel === pattern
  })
}

function isTsConstantsFile(fileRel: string): boolean {
  return /primitive-\w+\.ts$/.test(fileRel) ||
         /dense-list\/(toolbar|table)\.ts$/.test(fileRel) ||
         /dense-list\/inline-edit\.ts$/.test(fileRel)
}

// ─── Collection ───────────────────────────────────────────────────────────

function collectCategoryComponents(
  catKey: string,
  cat: CategoryDef,
  allComponents: Map<string, string[]>,
): { components: ComponentInfo[]; nonComponentFiles: string[] } {
  const results: ComponentInfo[] = []
  const nonComponentFiles: string[] = []
  const seen = new Set<string>() // file+component dedup

  // Collect all same-category files for cross-import detection
  const sameCategoryFiles: string[] = []
  for (const pattern of cat.filePatterns) {
    if (pattern.endsWith("/*")) {
      const dir = path.join(SHARED_UI, pattern.slice(0, -1))
      if (fs.existsSync(dir)) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          if (entry.isFile() && FILE_EXTENSIONS.has(path.extname(entry.name))) {
            sameCategoryFiles.push(pattern.slice(0, -1) + entry.name)
          }
        }
      }
    } else {
      sameCategoryFiles.push(pattern)
    }
  }

  for (const pattern of cat.filePatterns) {
    if (pattern.endsWith("/*")) {
      const dirRel = pattern.slice(0, -1)
      const dirPath = path.join(SHARED_UI, dirRel)
      if (!fs.existsSync(dirPath)) continue
      for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
        if (!entry.isFile() || !FILE_EXTENSIONS.has(path.extname(entry.name))) continue
        const fileRel = dirRel + entry.name
        processFile(catKey, cat, fileRel, sameCategoryFiles, allComponents, results, nonComponentFiles, seen)
      }
    } else {
      processFile(catKey, cat, pattern, sameCategoryFiles, allComponents, results, nonComponentFiles, seen)
    }
  }

  return { components: results, nonComponentFiles }
}

function processFile(
  catKey: string,
  _cat: CategoryDef,
  fileRel: string,
  sameCategoryFiles: string[],
  allComponents: Map<string, string[]>,
  results: ComponentInfo[],
  nonComponentFiles: string[],
  seen: Set<string>,
): void {
  const relKey = toPosix(fileRel)
  if (EXCLUDED_FILES.has(relKey)) return

  const fullPath = path.join(SHARED_UI, fileRel)
  if (!fs.existsSync(fullPath)) return

  const isConstants = isTsConstantsFile(fileRel)

  // For constants files (.ts with primitive*), create a single file-level entry
  if (isConstants) {
    const key = `${fileRel}::__file__`
    if (seen.has(key)) return
    seen.add(key)

    const usage = findUsages(fileRel.replace(/\.tsx?$/, ""))
    const rawClasses = detectRawClasses(fullPath)
    const funcDefs = getAllFunctionDefs(fullPath)

    results.push({
      file: fileRel,
      componentName: `__file:${fileRel}__`,
      hasFile: true,
      exported: true,
      isComponent: false,
      usageCount: usage.count,
      usageFiles: usage.files,
      sameCategoryImports: [],
      crossCategoryImports: [],
      containsRawClasses: rawClasses,
      category: catKey,
    })

    // Also check if no component names found (mark as non-component)
    if (funcDefs.size === 0) {
      nonComponentFiles.push(fileRel)
    }
    return
  }

  // Regular .tsx component file
  const exports = allComponents.get(fileRel)
  if (!exports || exports.length === 0) {
    // File exists but exports nothing matching our criteria
    nonComponentFiles.push(fileRel)
    return
  }

  const rawClasses = detectRawClasses(fullPath)
  const catImports = detectCategoryImports(fullPath, sameCategoryFiles)

  // Also find all defined functions (component or not) to detect
  // components that are defined but no longer exported
  const allDefined = getAllFunctionDefs(fullPath)
  const allExportNames = new Set(exports)

  // Add entries for defined-but-not-exported components
  for (const defName of allDefined) {
    if (allExportNames.has(defName)) continue
    if (!isComponentName(defName)) continue

    const key = `${fileRel}::${defName}`
    if (seen.has(key)) continue
    seen.add(key)

    const usage = findUsages(defName)

    results.push({
      file: fileRel,
      componentName: defName,
      hasFile: true,
      exported: false,         // defined but NOT exported
      isComponent: true,
      usageCount: usage.count,
      usageFiles: usage.files,
      sameCategoryImports: catImports.same,
      crossCategoryImports: catImports.cross,
      containsRawClasses: rawClasses,
      category: catKey,
    })
  }

  for (const exportName of exports) {
    const key = `${fileRel}::${exportName}`
    if (seen.has(key)) continue
    seen.add(key)

    const exported = isComponentExported(fullPath, exportName)
    const usage = findUsages(exportName)

    results.push({
      file: fileRel,
      componentName: exportName,
      hasFile: true,
      exported,
      isComponent: true,
      usageCount: usage.count,
      usageFiles: usage.files,
      sameCategoryImports: catImports.same,
      crossCategoryImports: catImports.cross,
      containsRawClasses: rawClasses,
      category: catKey,
    })
  }
}

// ─── Analysis ──────────────────────────────────────────────────────────────

/**
 * For multi-export Radix-like files (dialog.tsx, tooltip.tsx, etc.),
 * we treat all sub-components as belonging to the same "main" component.
 * Deprecation applies at the file/group level, not to individual sub-exports.
 */
function isRadixPattern(fileRel: string): boolean {
  const radixFiles = [
    "dialog.tsx", "drawer.tsx", "sheet.tsx", "popover.tsx",
    "hover-card.tsx", "alert-dialog.tsx", "tooltip.tsx",
    "context-menu.tsx", "command.tsx", "menubar.tsx",
    "tabs.tsx", "accordion.tsx", "collapsible.tsx", "carousel.tsx",
    "resizable.tsx", "separator.tsx", "scroll-area.tsx",
    "avatar.tsx", "switch.tsx", "checkbox.tsx", "radio-group.tsx",
    "select.tsx", "slider.tsx", "progress.tsx",
    "calendar.tsx", "date-picker.tsx",
  ]
  return radixFiles.includes(fileRel)
}

function analyzeCategory(
  catKey: string,
  cat: CategoryDef,
  components: ComponentInfo[],
  nonComponentFiles: string[],
): { overlap: string; recommendation: string; canonical: string[]; deprecated: ComponentInfo[] } {
  const canonical: string[] = []
  const deprecated: ComponentInfo[] = []

  // Build canonical list
  for (const cf of cat.canonicalFiles) {
    const fullPath = path.join(SHARED_UI, cf)
    if (fs.existsSync(fullPath)) {
      const names = extractComponentExports(fullPath)
      if (names.length > 0) canonical.push(`${cf}#${names[0]}`)
      else canonical.push(`${cf}#?`)
    } else {
      canonical.push(`${cf}#<missing>`)
    }
  }

  if (components.length === 0) {
    return {
      overlap: `Категория "${cat.name}" не содержит компонентов.`,
      recommendation: "",
      canonical, deprecated,
    }
  }

  // Deduplicate: if a component appears from same file multiple times
  // (e.g. through multiple category matches), only keep the first occurrence
  const uniqueComps: ComponentInfo[] = []
  const seen = new Set<string>()
  for (const c of components) {
    const key = `${c.file}::${c.componentName}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueComps.push(c)
    }
  }

  // Group by file
  const fileGroups = new Map<string, ComponentInfo[]>()
  for (const comp of uniqueComps) {
    if (!fileGroups.has(comp.file)) fileGroups.set(comp.file, [])
    fileGroups.get(comp.file)!.push(comp)
  }

  // Detect which files are Radix-style multi-export groups
  const RADIX_LIKE_FILES = new Set([
    "dialog.tsx", "drawer.tsx", "sheet.tsx", "popover.tsx",
    "hover-card.tsx", "alert-dialog.tsx", "tooltip.tsx",
    "context-menu.tsx", "command.tsx", "menubar.tsx",
    "tabs.tsx", "accordion.tsx", "collapsible.tsx", "carousel.tsx",
    "resizable.tsx", "slider.tsx", "progress.tsx",
    "select.tsx", "switch.tsx", "checkbox.tsx", "radio-group.tsx",
    "calendar.tsx", "date-picker.tsx", "avatar.tsx",
    "breadcrumbs.tsx",
    "card-shell.tsx", "form-layout.tsx", "form.tsx",
    "navigation-menu.tsx", "sidebar.tsx",
  ])

  // For Radix files with many sub-exports, only deprecate the ENTIRE file
  // (all members) if the main component has 0 usage.
  // The "main" component is the one without a sub-component suffix.
  for (const [file, comps] of fileGroups) {
    const isRadixLike = RADIX_LIKE_FILES.has(file)
    const isCanon = cat.canonicalFiles.includes(file)

    if (isRadixLike && comps.length > 2) {
      // It's a multi-export file. Find the main component.
      // Main = shortest name or first export
      const mainComp = comps.reduce((a, b) =>
        a.componentName.length <= b.componentName.length ? a : b
      )
      
      if (!isCanon) {
        // Check if the whole file group is unused (main component has 0 usage)
        const hasAnyUsage = comps.some(c => c.usageCount > 0)
        if (!hasAnyUsage) {
          // Mark the file header as deprecated, skip sub-components
          for (const comp of comps) {
            if (comp === mainComp && comp.usageCount === 0) {
              deprecated.push(comp)
            }
          }
        }
      }
      continue
    }

    // Regular single-component or small-group files
    const canonicalFileSet = new Set(cat.canonicalFiles)

    for (const comp of comps) {
      const isCanonFile = canonicalFileSet.has(comp.file)

      if (isCanonFile) continue // never deprecate canonical files

      // Check: is this component a wrapper that wraps a same-category canonical?
      const wrapsCanonical = comp.sameCategoryImports.some(imp => {
        // Does the imported name match a canonical component?
        return canonical.some(c => c.includes(imp))
      })

      // Deprecate if:
      // 1. Wraps a canonical component AND has low usage (<= 2)
      if (wrapsCanonical && comp.usageCount <= 2) {
        deprecated.push(comp)
        continue
      }
      // 2. Zero usage (completely unused)
      if (comp.usageCount === 0 && comp.isComponent) {
        deprecated.push(comp)
        continue
      }
      // 3. Wraps any same-category component AND low usage (<= 1)
      if (comp.sameCategoryImports.length > 0 && comp.usageCount <= 1 && comp.isComponent) {
        deprecated.push(comp)
        continue
      }
    }
  }

  // Build overlap text
  const realComps = components.filter(c => c.isComponent)
  let overlap = `В категории "${cat.name}" обнаружено ${realComps.length} компонентов. `
  const wrappers = components.filter(c => c.sameCategoryImports.length > 0)
  if (wrappers.length > 0) overlap += `${wrappers.length} из них — обёртки. `
  if (deprecated.length > 0) overlap += `${deprecated.length} кандидатов на удаление. `
  if (nonComponentFiles.length > 0) overlap += `(${nonComponentFiles.length} файлов содержат только константы/типы.)`

  // Recommendation
  let recommendation = `**Канон:** ${canonical.length > 0 ? canonical.join(", ") : "(не указан)"}.`
  if (deprecated.length > 0) {
    recommendation += `\n**Deprecated кандидаты:**\n`
    for (const dep of deprecated) {
      const reason = dep.sameCategoryImports.length > 0
        ? `обёртка над ${dep.sameCategoryImports.join(", ")}`
        : dep.usageCount === 0
          ? "0 usage"
          : ""
      recommendation += `- ${dep.file}#${dep.componentName} → ${reason}\n`
    }
  } else {
    recommendation += "\nДублирования не обнаружено."
  }

  return { overlap, recommendation, canonical, deprecated }
}

// ─── Markdown ──────────────────────────────────────────────────────────────

function generateMarkdown(report: OverlapReport): string {
  let md = `# UI Component Overlap Audit

**Generated:** ${report.generatedAt}
**Total categories:** ${report.summary.totalCategories}
**Components found:** ${report.summary.totalComponents}
**Deprecated candidates:** ${report.summary.totalDeprecated}

---

## Index

| # | Category | Components | Overlap |
|---|----------|----------:|---------|
`

  for (const [key, cat] of Object.entries(report.categories)) {
    const depLen = cat.deprecated.length
    const label = depLen > 0 ? `⚠️ ${depLen} deprecated` : "✅ OK"
    md += `| ${key} | ${cat.name} | ${cat.components.length} | ${label} |\n`
  }

  md += `\n---\n\n`

  for (const [key, cat] of Object.entries(report.categories)) {
    md += `## Категория ${key}: ${cat.name}\n\n`

    md += `### Компоненты\n\n`
    md += `| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |\n`
    md += `|---|---|---|---|---|\n`

    for (const comp of cat.components) {
      const exportedStr = comp.exported ? "✅ да" : "❌ нет"
      const isDeprecated = cat.deprecated.includes(comp)
      const isCanonical = cat.canonical.includes(`${comp.file}#${comp.componentName}`)
      const isRadixGroup = isRadixPattern(comp.file)
      const isConstantsFile = isTsConstantsFile(comp.file)

      let overlapLabel = "—"
      if (isCanonical) overlapLabel = "канон"
      else if (isDeprecated && comp.sameCategoryImports.length > 0) overlapLabel = "обёртка"
      else if (isDeprecated && comp.usageCount === 0) overlapLabel = "0 usage"
      else if (isRadixGroup && comp.usageCount > 0) overlapLabel = "✅ Radix"
      else if (isRadixGroup) overlapLabel = "Radix"
      else if (isConstantsFile) overlapLabel = "константы"

      md += `| ${comp.componentName} | ${comp.file} | ${exportedStr} | ${comp.usageCount} | ${overlapLabel} |\n`
    }

    md += `\n### Overlap\n\n${cat.overlap}\n\n`
    md += `### Рекомендация\n\n${cat.recommendation}\n\n`

    if (cat.deprecated.length > 0) {
      const depFiles = new Set<string>()
      for (const dep of cat.deprecated) {
        if (dep.usageFiles.length > 0) dep.usageFiles.forEach(f => depFiles.add(f))
      }
      if (depFiles.size > 0) {
        md += `### Файлы для миграции\n\n`
        const sorted = [...depFiles].slice(0, 30)
        for (const f of sorted) md += `- \`${f}\`\n`
        if (depFiles.size > 30) md += `- ... и ещё ${depFiles.size - 30} файлов\n`
        md += `\n`
      } else {
        md += `### Файлы для миграции\n(empty)\n\n`
      }
    }

    md += `---\n\n`
  }

  md += `## Summary\n\n`
  md += `| Metric | Value |\n`
  md += `|---|---|\n`
  md += `| Categories with deprecated | ${Object.values(report.categories).filter(c => c.deprecated.length > 0).length} |\n`
  md += `| Deprecated candidates | ${report.summary.totalDeprecated} |\n`
  md += `| Total components scanned | ${report.summary.totalComponents} |\n`

  return md
}

// ─── Main ──────────────────────────────────────────────────────────────────

function main(): void {
  console.log("🔍 Scanning shared/ui/ for React components...\n")

  const allComponents = scanFilesForComponents()
  console.log(`   Found ${allComponents.size} files with component exports`)

  const report: OverlapReport = {
    generatedAt: new Date().toISOString(),
    summary: { totalCategories: 0, totalComponents: 0, totalDeprecated: 0, hasDuplicates: false },
    categories: {},
  }

  let totalComponents = 0
  let totalDeprecated = 0

  for (const [key, cat] of Object.entries(categories)) {
    const { components, nonComponentFiles } = collectCategoryComponents(key, cat, allComponents)
    const analysis = analyzeCategory(key, cat, components, nonComponentFiles)
    totalComponents += components.length
    totalDeprecated += analysis.deprecated.length

    report.categories[key] = {
      name: cat.name,
      components,
      overlap: analysis.overlap,
      recommendation: analysis.recommendation,
      canonical: analysis.canonical,
      deprecated: analysis.deprecated,
      nonComponentFiles,
    }

    console.log(`   [${key}] ${cat.name}: ${components.length} comps, ${analysis.deprecated.length} deprecated`)
  }

  report.summary = {
    totalCategories: Object.keys(categories).length,
    totalComponents,
    totalDeprecated,
    hasDuplicates: totalDeprecated > 0,
  }

  fs.mkdirSync(path.join(ROOT, "reports"), { recursive: true })
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2))
  fs.writeFileSync(REPORT_MD, generateMarkdown(report))

  console.log(`\n✅ UI Overlap Report generated:`)
  console.log(`   JSON: ${path.relative(ROOT, REPORT_JSON)}`)
  console.log(`   MD:   ${path.relative(ROOT, REPORT_MD)}`)
  console.log(``)
  console.log(`Summary: ${report.summary.totalCategories} categories, ${totalComponents} components`)
  console.log(`  Deprecated: ${totalDeprecated}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
