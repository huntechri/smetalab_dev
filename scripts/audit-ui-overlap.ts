#!/usr/bin/env tsx
/**
 * UI Component Overlap Audit
 *
 * Scans all UI components in shared/ui/ and their usages in features/ and app/
 * to identify overlapping implementations across 16 categories.
 *
 * Usage: tsx scripts/audit-ui-overlap.ts
 * Also registered as: pnpm audit:ui-overlap
 */

import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
const SHARED_UI = path.join(ROOT, "shared/ui")
const REPORT_JSON = path.join(ROOT, "reports", "ui-overlap.json")
const REPORT_MD = path.join(ROOT, "reports", "ui-overlap.md")

const SCAN_ROOTS = ["app", "features", "shared/ui", "components"]

const categories = {
  "1": {
    name: "Badge / Token / Pill",
    components: [
      "badge.tsx#Badge",
      "status-badge.tsx#StatusBadge",
      "status-badge.tsx#StatusIndicator",
      "catalog-token.tsx#CatalogToken",
      "catalog-token.tsx#CatalogIndexToken",
      "dense-list/tokens.tsx#DenseListToken",
      "dense-list/metrics.tsx#DenseListMetricPill",
      "dense-list/metrics.tsx#DenseListInlineMetric",
      "dense-list/metrics.tsx#DenseListStat",
      "estimate-tab.tsx#EstimateTabToken",
      "estimate-tab.tsx#EstimateTabSourceToken",
      "estimate-tab.tsx#EstimateTabMetric",
      "estimate-tab.tsx#EstimateTabInlineMetric",
    ],
  },
  "2": {
    name: "Button",
    components: [
      "button.tsx#Badge", // placeholder - will be fixed
      "button.tsx#Button",
      "toolbar-button.tsx#ToolbarButton",
      "toggle.tsx#Toggle",
      "toggle-group.tsx#ToggleGroup",
      "button-group.tsx#ButtonGroup",
    ],
  },
  "3": {
    name: "Input",
    components: [
      "input.tsx#Input",
      "search-input.tsx#SearchInput",
      "search-control.tsx#SearchControl",
      "input-group.tsx#InputGroup",
      "hidden-input.tsx#HiddenInput",
      "file-input.tsx#FileInput",
      "textarea.tsx#Textarea",
      "select.tsx#Select",
    ],
  },
  "4": {
    name: "Card / Surface",
    components: [
      "card.tsx#Card",
      "card-shell.tsx#CardShell",
      "card-shell.tsx#CardShellHeader",
      "card-shell.tsx#CardShellBody",
      "card-shell.tsx#CardShellFooter",
      "card-shell.tsx#CardShellInset",
      "surface.tsx#Surface",
      "dense-card.tsx#DenseCard",
      "dense-list/cards.tsx#DenseCardTitle",
      "dense-list/cards.tsx#DenseCardIcon",
      "dense-list/cards.tsx#DenseCardRowLabel",
      "kpi-card.tsx#KPICard",
      "editable-data-surface.tsx",
      "estimate-tab.tsx#EstimateTabCard",
    ],
  },
  "5": {
    name: "Panel / Layout",
    components: [
      "page-shell.tsx#PageShell",
      "page-shell.tsx#ContentContainer",
      "page-shell.tsx#WorkspaceMain",
      "page-shell.tsx#PageHeader",
      "section.tsx#Section",
      "section.tsx#SectionHeader",
      "section.tsx#SectionTitle",
      "dense-list/layout.tsx#DenseListPanel",
      "dashboard-layout.tsx#DashboardPanel",
      "dashboard-layout.tsx#DashboardPageStack",
      "estimate-tab.tsx#EstimateTabPanel",
      "auth-shell.tsx#AuthPanel",
      "marketing-shell.tsx#MarketingSection",
      "content-container.tsx#ContentContainer",
      "app-header.tsx#AppHeaderShell",
    ],
  },
  "6": {
    name: "Table",
    components: [
      "table.tsx#Table",
      "data-table.tsx#DataTable",
      "table-density.tsx#CompactTableRow",
      "table-density.tsx#CompactTableHeaderRow",
      "table-density.tsx#CompactTableHead",
      "table-density.tsx#CompactTableCell",
      "table-actions.tsx#TableRowActions",
      "table-actions.tsx#TableHeaderActions",
      "data-table/data-table-row.tsx#DataTableRow",
      "data-table/data-table-skeleton.tsx#DataTableSkeleton",
      "data-table/data-table-toolbar.tsx#DataTableToolbar",
      "estimate-tab.tsx#EstimateTabCodeText",
      "estimate-tab.tsx#EstimateTabNameText",
      "estimate-tab.tsx#EstimateTabTitleRow",
    ],
  },
  "7": {
    name: "Form",
    components: [
      "form.tsx#FormItem",
      "form.tsx#FormLabel",
      "form.tsx#FormMessage",
      "form.tsx#FormControl",
      "form-layout.tsx#FormLayout",
      "form-layout.tsx#FormSection",
      "form-layout.tsx#FieldStack",
      "form-layout.tsx#FieldRow",
      "form-layout.tsx#FormSectionHeader",
      "field.tsx#FieldGroup",
      "label.tsx#Label",
    ],
  },
  "8": {
    name: "Typography / Text",
    components: [
      "primitive-surface.ts#primitiveVisualTypographyClassNames",
      "primitive-badge.ts#primitiveBadgeVariantClassNames",
      "estimate-tab.tsx#EstimateTabText",
      "primitive-density.ts",
      "primitive-controls.ts",
    ],
  },
  "9": {
    name: "Navigation / Tabs",
    components: [
      "tabs.tsx#Tabs",
      "workspace-tabs.tsx#WorkspaceTabs",
      "sidebar.tsx#Sidebar",
      "app-header.tsx#AppHeaderShell",
      "breadcrumbs.tsx#AppBreadcrumbs",
      "navigation-menu.tsx#NavigationMenu",
      "marketing-shell.tsx#MarketingHeader",
      "marketing-shell.tsx#MarketingFooter",
      "marketing-shell.tsx#MarketingMobileMenu",
    ],
  },
  "10": {
    name: "Overlay",
    components: [
      "dialog.tsx#Dialog",
      "drawer.tsx#Drawer",
      "sheet.tsx#Sheet",
      "popover.tsx#Popover",
      "hover-card.tsx#HoverCard",
      "alert-dialog.tsx#AlertDialog",
      "tooltip.tsx#Tooltip",
      "context-menu.tsx#ContextMenu",
      "command.tsx#Command",
    ],
  },
  "11": {
    name: "State / Loading",
    components: [
      "states/index.ts#LoadingState",
      "states/index.ts#EmptyState",
      "states/index.ts#ErrorState",
      "states/index.ts#ForbiddenState",
      "states/index.ts#NoResultsState",
      "states/index.ts#StateShell",
      "spinner.tsx#Spinner",
      "skeleton.tsx#Skeleton",
      "loading-indicator.tsx#LoadingIndicator",
      "data-table/data-table-skeleton.tsx#DataTableSkeleton",
      "table-empty-state.tsx#TableEmptyState",
      "empty.tsx#Empty",
    ],
  },
  "12": {
    name: "Inline Editors (Input Cells)",
    components: [
      "dense-list/inline-edit.ts#useDenseListInlineEdit",
      "cells/editable-cell.tsx#EditableCell",
    ],
  },
  "13": {
    name: "Layout Constants (.ts files with Tailwind strings)",
    components: [
      "dense-list/toolbar.ts",
      "dense-list/table.ts",
      "dense-list/pickers.tsx#PickersConstants",
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
    ],
  },
  "14": {
    name: "Data Display",
    components: [
      "cells/money-cell.tsx#MoneyCell",
      "cells/editable-cell.tsx#EditableCell",
      "cells/currency-cell.tsx#CurrencyCell",
      "kpi-card.tsx#KPICard",
    ],
  },
  "15": {
    name: "Marketing",
    components: [
      "marketing-shell.tsx#MarketingShell",
      "marketing-shell.tsx#MarketingHeader",
      "marketing-shell.tsx#MarketingHero",
      "marketing-shell.tsx#MarketingFeatureGrid",
      "marketing-shell.tsx#MarketingFooter",
      "marketing-shell.tsx#MarketingMobileMenu",
      "auth-shell.tsx#AuthShell",
      "auth-shell.tsx#AuthPanel",
      "auth-shell.tsx#AuthFeatureCard",
      "auth-shell.tsx#AuthStatusMessage",
      "primitive-marketing.ts#primitiveMarketingClassNames",
    ],
  },
  "16": {
    name: "Containers / Helpers",
    components: [
      "separator.tsx#Separator",
      "scroll-area.tsx#ScrollArea",
      "accordion.tsx#Accordion",
      "carousel.tsx#Carousel",
      "resizable.tsx#Resizable",
      "collapsible.tsx#Collapsible",
      "command.tsx#Command",
    ],
  },
}

// Fix category 2 badge placeholder
categories["2"].components[0] = "button.tsx#Button"

type ComponentInfo = {
  file: string
  componentName: string
  hasFile: boolean
  variants: string
  variantCount: number
  usesRawClasses: boolean
  isWrapper: boolean
  wrapsWhat: string
  usageCount: number
  usageFiles: string[]
}

interface OverlapReport {
  generatedAt: string
  summary: {
    totalCategories: number
    totalOverlapComponents: number
    totalCanonical: number
    totalDeprecated: number
    hasDuplicates: boolean
  }
  categories: Record<string, {
    name: string
    components: ComponentInfo[]
    overlap: string
    recommendation: string
    canonical: string[]
    deprecated: string[]
  }>
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
  ) {
    return true
  }
  if (rel.endsWith(".test.ts") || rel.endsWith(".test.tsx") || rel.endsWith(".spec.ts") || rel.endsWith(".spec.tsx")) {
    return true
  }
  return false
}

function walk(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    const rel = toPosix(path.relative(ROOT, full))
    if (isExcluded(rel)) continue
    if (entry.isDirectory()) walk(full, files)
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) files.push(full)
  }
  return files
}

function findExportNames(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    const names: string[] = []
    // Match named exports: export function Xxx, export const Xxx, export class Xxx, export interface Xxx
    const exportRegex = /export\s+(?:function|const|class|interface|type)\s+(\w+)/g
    let m: RegExpExecArray | null
    while ((m = exportRegex.exec(content)) !== null) {
      names.push(m[1])
    }
    // export { Xxx } — inline exports
    const braceRegex = /export\s+\{\s*([^}]+)\s*\}/g
    while ((m = braceRegex.exec(content)) !== null) {
      const inner = m[1].split(",").map((s) => {
        const parts = s.trim().split(/\s+as\s+/)
        return parts[0].trim()
      })
      names.push(...inner.filter(Boolean))
    }
    // export default function/class
    const defaultRegex = /export\s+default\s+(?:function|class)\s+(\w+)/g
    while ((m = defaultRegex.exec(content)) !== null) {
      names.push(m[1])
    }
    return [...new Set(names)]
  } catch {
    return []
  }
}

function detectVariants(filePath: string): { variants: string; count: number } {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    const variantLines: string[] = []
    
    // Match CVA variant definitions
    const cvaRegex = /variant:\s*\{([^}]+)\}/gs
    let m: RegExpExecArray | null
    while ((m = cvaRegex.exec(content)) !== null) {
      const block = m[1]
      const variantKeys = block.match(/(\w+):/g)
      if (variantKeys) {
        variantLines.push(...variantKeys.map((k) => k.replace(":", "").trim()))
      }
    }
    
    // Match variant record objects
    const recordRegex = /(?:Variant|Tone|Size|Density)\s*=\s*['"]([^'"]+)['"]/g
    while ((m = recordRegex.exec(content)) !== null) {
      variantLines.push(m[1])
    }
    
    // Match type unions that look like variants
    const typeRegex = /type\s+\w+(?:Variant|Tone|Size|Density|Layout|Mode)\s*=\s*'([^']*)'/g
    while ((m = typeRegex.exec(content)) !== null) {
      variantLines.push(m[1])
    }

    const unique = [...new Set(variantLines)]
    return {
      variants: unique.length > 0 ? unique.slice(0, 15).join(", ") : "unknown",
      count: unique.length,
    }
  } catch {
    return { variants: "unknown", count: 0 }
  }
}

function detectRawClasses(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    // Check for inline Tailwind classes in JSX className props
    const inlineRegex = /className\s*=\s*["'`][^"'`]*(?:rounded|border|bg-|text-|font-|p[txrble]?-|m[txrble]?-|h-|w-|gap-|flex|grid|shadow|space-|items-|justify-)[^"'`]*["'`]/g
    return inlineRegex.test(content)
  } catch {
    return false
  }
}

function detectWrapper(filePath: string): { isWrapper: boolean; wrapsWhat: string } {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    const importRegex = /import\s+(?:\{[^}]+\}|[^;]+)\s+from\s+['"]@\/shared\/ui\/([^'"]+)['"]/g
    const imports: string[] = []
    let m: RegExpExecArray | null
    while ((m = importRegex.exec(content)) !== null) {
      imports.push(m[1])
    }

    // Check if imports a known UI component and wraps it in JSX
    // Look for patterns like <Badge, <Card, <Surface, <Button, <Input, <Table
    const knownUi = [
      "badge", "card", "button", "input", "select", "textarea",
      "surface", "dialog", "sheet", "popover", "toggle", "table",
      "form", "label", "separator", "skeleton", "spinner",
    ]
    const uiUsages = knownUi.filter((ui) => {
      const re = new RegExp(`<(?:${ui.charAt(0).toUpperCase() + ui.slice(1)}|${ui})\\b`)
      return re.test(content)
    })

    if (uiUsages.length > 0) {
      return { isWrapper: true, wrapsWhat: `@/shared/ui/${imports.filter((i) => i.includes(uiUsages[0])).join(", ") || uiUsages.join(", ")}` }
    }
    return { isWrapper: false, wrapsWhat: "" }
  } catch {
    return { isWrapper: false, wrapsWhat: "" }
  }
}

function findUsages(componentName: string, filePath: string): { count: number; files: string[] } {
  const importName = componentName.replace(/\s+/g, "")
  if (!importName) return { count: 0, files: [] }

  const foundFiles: string[] = []

  // Scan all files in SCAN_ROOTS except shared/ui for usages
  const scanFiles = SCAN_ROOTS.flatMap((root) => {
    const dir = path.join(ROOT, root)
    if (root === "shared/ui") return [] // skip self-referential search
    return walk(dir)
  })

  for (const sf of scanFiles) {
    try {
      const content = fs.readFileSync(sf, "utf8")
      // Match import of the specific component from shared/ui
      // Pattern: import { ..., ComponentName, ... } from '@/shared/ui/...'
      // or import ComponentName from '@/shared/ui/...'
      const importRegex = new RegExp(
        `import\\s+(?:\\{[^}]*\\b${importName}\\b[^}]*\\}|${importName}\\b)\\s+from\\s+['"](?:@/shared/ui/|@/components/ui/)`,
        "m"
      )
      
      // Also match JSX usage directly (components referenced but come from barrel)
      const jsxRegex = new RegExp(`<${importName}(?:\\s|>|/)`, "m")
      
      if (importRegex.test(content) || jsxRegex.test(content)) {
        const rel = toPosix(path.relative(ROOT, sf))
        foundFiles.push(rel)
      }
    } catch {
      // skip unreadable files
    }
  }

  return {
    count: foundFiles.length,
    files: foundFiles.slice(0, 50), // limit to 50 files for report readability
  }
}

// ─── Scan ─────────────────────────────────────────────────────────────────

function scanCategory(cat: { name: string; components: string[] }): ComponentInfo[] {
  return cat.components.map((entry) => {
    const hashIdx = entry.lastIndexOf("#")
    const filePath = hashIdx >= 0 ? entry.slice(0, hashIdx) : entry
    const componentName = hashIdx >= 0 ? entry.slice(hashIdx + 1) : path.basename(filePath, path.extname(filePath))
    const fullPath = path.join(SHARED_UI, filePath)
    const hasFile = fs.existsSync(fullPath)

    let variants = "unknown"
    let variantCount = 0
    let usesRawClasses = false
    let isWrapper = false
    let wrapsWhat = ""

    if (hasFile) {
      const v = detectVariants(fullPath)
      variants = v.variants
      variantCount = v.count
      usesRawClasses = detectRawClasses(fullPath)
      const w = detectWrapper(fullPath)
      isWrapper = w.isWrapper
      wrapsWhat = w.wrapsWhat
    }

    const usage = findUsages(componentName, fullPath)

    return {
      file: filePath,
      componentName,
      hasFile,
      variants,
      variantCount,
      usesRawClasses,
      isWrapper,
      wrapsWhat,
      usageCount: usage.count,
      usageFiles: usage.files,
    }
  })
}

// ─── Analysis ──────────────────────────────────────────────────────────────

function analyzeCategory(catKey: string, components: ComponentInfo[]): {
  overlap: string
  recommendation: string
  canonical: string[]
  deprecated: string[]
} {
  const wrappers = components.filter((c) => c.isWrapper)
  const rawClassUsers = components.filter((c) => c.usesRawClasses)
  const noUsage = components.filter((c) => c.usageCount === 0)
  const highUsage = components.filter((c) => c.usageCount > 5)
  const catName = categories[catKey as keyof typeof categories]?.name || ""

  let canonical: string[] = []
  let deprecated: string[] = []

  switch (catKey) {
    case "1": {
      // Badge / Token / Pill — Badge is the canonical
      canonical = ["badge.tsx#Badge"]
      deprecated = [
        "dense-list/tokens.tsx#DenseListToken → Badge size=xs",
        "dense-list/metrics.tsx#DenseListMetricPill → Badge variant=pill",
        "dense-list/metrics.tsx#DenseListInlineMetric → Badge variant=inline-metric",
        "dense-list/metrics.tsx#DenseListStat → Badge variant=stat",
        "estimate-tab.tsx#EstimateTabToken → Badge size=xs",
        "estimate-tab.tsx#EstimateTabSourceToken → Badge variant=source",
        "estimate-tab.tsx#EstimateTabMetric → Badge variant=metric-pill",
        "estimate-tab.tsx#EstimateTabInlineMetric → Badge variant=metric-inline",
        "catalog-token.tsx#CatalogToken → Badge variant=catalog | catalog-compact",
      ]
      break
    }
    case "2": {
      // Button — Button is the canonical
      canonical = ["button.tsx#Button"]
      deprecated = [
        "toolbar-button.tsx#ToolbarButton → Button variant=outline size=xs + shadow-sm",
        "toggle.tsx#Toggle → separate primitive (not button)",
        "toggle-group.tsx#ToggleGroup → separate primitive (not button)",
      ]
      break
    }
    case "3": {
      // Input — Input is the canonical for text inputs
      canonical = ["input.tsx#Input", "select.tsx#Select", "textarea.tsx#Textarea"]
      deprecated = [
        "search-input.tsx#SearchInput → Input type=search",
        "search-control.tsx#SearchControl → Input type=search + decoration",
        "hidden-input.tsx#HiddenInput → raw <input type=hidden>",
        "file-input.tsx#FileInput → Input type=file",
        "input-group.tsx#InputGroup → FormLayout FieldRow",
      ]
      break
    }
    case "4": {
      // Card / Surface — Surface + CardShell as canonical
      canonical = ["card.tsx#Card", "surface.tsx#Surface", "card-shell.tsx#CardShell"]
      deprecated = [
        "dense-card.tsx#DenseCard → CardShell variant=card density=compact",
        "dense-list/cards.tsx#DenseCardTitle → CardShell + CardTitle",
        "dense-list/cards.tsx#DenseCardIcon → CardShell + icon slot",
        "dense-list/cards.tsx#DenseCardRowLabel → CardShell + label slot",
        "kpi-card.tsx#KPICard → CardShell variant=card + data display cells",
        "editable-data-surface.tsx → CardShell variant=card + inline edit",
        "estimate-tab.tsx#EstimateTabCard → CardShell variant=card density=compact",
      ]
      break
    }
    case "5": {
      // Panel / Layout
      canonical = ["page-shell.tsx#PageShell", "section.tsx#Section"]
      deprecated = [
        "dense-list/layout.tsx#DenseListPanel → Section variant=compact",
        "dashboard-layout.tsx#DashboardPanel → Section variant=card",
        "dashboard-layout.tsx#DashboardPageStack → PageShell variant=dashboard",
        "estimate-tab.tsx#EstimateTabPanel → Section variant=estimates",
      ]
      break
    }
    case "6": {
      // Table — shadcn Table + DataTable as canonical
      canonical = ["table.tsx#Table", "table-density.tsx#CompactTableCell", "table-density.tsx#CompactTableHead"]
      deprecated = [
        "data-table.tsx#DataTable → uses table-density (fine as is)",
        "data-table/data-table-row.tsx#DataTableRow → merge into table-density",
        "data-table/data-table-skeleton.tsx#DataTableSkeleton → merge into table-density",
        "data-table/data-table-toolbar.tsx#DataTableToolbar → merge into table-density",
        "estimate-tab.tsx#EstimateTabCodeText → CompactTableCell variant=code",
        "estimate-tab.tsx#EstimateTabNameText → CompactTableCell variant=name",
        "estimate-tab.tsx#EstimateTabTitleRow → CompactTableRow variant=title",
      ]
      break
    }
    case "7": {
      // Form
      canonical = ["form.tsx#FormItem", "form-layout.tsx#FormLayout", "form-layout.tsx#FieldStack"]
      deprecated = [
        "field.tsx#FieldGroup → FormLayout FieldStack",
        "label.tsx#Label → standalone, fine as separate",
      ]
      break
    }
    case "8": {
      // Typography / Text
      canonical = ["primitive-surface.ts#primitiveVisualTypographyClassNames"]
      deprecated = [
        "Raw text classes in features/ → use consistent typography tokens from primitives",
      ]
      break
    }
    case "9": {
      // Navigation / Tabs
      canonical = ["tabs.tsx#Tabs", "sidebar.tsx#Sidebar", "breadcrumbs.tsx#AppBreadcrumbs"]
      deprecated = [
        "workspace-tabs.tsx#WorkspaceTabs → Tabs variant=workspace",
        "navigation-menu.tsx#NavigationMenu → Sidebar or standalone (fine as is, different purpose)",
      ]
      break
    }
    case "10": {
      // Overlay — these are mostly separate primitives with different purposes
      canonical = ["dialog.tsx#Dialog", "sheet.tsx#Sheet", "drawer.tsx#Drawer", "popover.tsx#Popover"]
      deprecated = []
      break
    }
    case "11": {
      // State / Loading
      canonical = ["states/index.ts#LoadingState", "states/index.ts#EmptyState", "states/index.ts#ErrorState"]
      deprecated = [
        "spinner.tsx#Spinner → LoadingState variant=spinner",
        "loading-indicator.tsx#LoadingIndicator → LoadingState variant=indicator",
        "data-table/data-table-skeleton.tsx#DataTableSkeleton → LoadingState variant=table-skeleton",
        "table-empty-state.tsx#TableEmptyState → EmptyState variant=table",
        "empty.tsx#Empty → EmptyState variant=generic",
      ]
      break
    }
    case "12": {
      // Inline Editors
      canonical = ["cells/editable-cell.tsx#EditableCell"]
      deprecated = [
        "dense-list/inline-edit.ts#useDenseListInlineEdit → EditableCell hook",
      ]
      break
    }
    case "13": {
      // Layout Constants — all primitive files are the canonical system
      canonical = [
        "primitive-surface.ts", "primitive-spacing.ts", "primitive-density.ts",
        "primitive-controls.ts", "primitive-navigation.ts", "primitive-table.ts",
        "primitive-badge.ts", "primitive-form.ts", "primitive-overlay.ts",
        "primitive-chart.ts", "primitive-marketing.ts",
      ]
      deprecated = [
        "dense-list/toolbar.ts → merge into primitive-navigation.ts",
        "dense-list/table.ts → merge into primitive-table.ts",
        "dense-list/pickers.tsx → merge into primitive-controls.ts",
      ]
      break
    }
    case "14": {
      // Data Display
      canonical = ["cells/money-cell.tsx#MoneyCell", "kpi-card.tsx#KPICard"]
      deprecated = []
      break
    }
    case "15": {
      // Marketing
      canonical = ["marketing-shell.tsx#MarketingShell", "auth-shell.tsx#AuthShell"]
      deprecated = [
        "primitive-marketing.ts#primitiveMarketingClassNames → marketing-shell.tsx",
      ]
      break
    }
    case "16": {
      // Containers / Helpers
      canonical = ["scroll-area.tsx#ScrollArea", "separator.tsx#Separator", "accordion.tsx#Accordion"]
      deprecated = []
      break
    }
    default:
      canonical = components.length > 0 ? [components[0].file + "#" + components[0].componentName] : []
      deprecated = []
  }

  const overlapText = generateOverlapText(catKey, catName, components, wrappers)
  const recText = generateRecommendationText(catKey, catName, components, canonical, deprecated)

  return { overlap: overlapText, recommendation: recText, canonical, deprecated }
}

function generateOverlapText(catKey: string, name: string, components: ComponentInfo[], wrappers: ComponentInfo[]): string {
  const rawClassUsers = components.filter((c) => c.usesRawClasses)
  const active = components.filter((c) => c.usageCount > 0)

  let text = `В категории "${name}" обнаружено ${components.length} компонентов. `
  
  if (wrappers.length > 0) {
    text += `${wrappers.length} из них — обёртки над другими UI-компонентами. `
  }

  const rawText = rawClassUsers.filter((c) => c.usageCount > 0)
  if (rawText.length > 0) {
    text += `${rawText.length} компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. `
  }

  // Detect functional overlap
  if (components.length > 3) {
    // Check how many handle "tag/pill with color and text"
    if (catKey === "1") {
      text += "Badge, StatusBadge, CatalogToken, DenseListToken и EstimateTabToken — все делают одно и то же: цветная пилюля с текстом. StatusBadge — обёртка над Badge, DenseListToken — обёртка над Badge с size=xs. Остальные — raw-реализации."
    } else if (catKey === "4") {
      text += "Card (shadcn), CardShell, Surface, DenseCard, KPICard, EditableDataSurface — 6 способов сделать карточку. CardShell — обёртка над Surface. DenseCard — raw Tailwind. Остальные — обёртки с разными variant/density пропсами."
    } else if (catKey === "6") {
      text += "Две параллельные табличные системы: shadcn Table (table.tsx) для простых случаев и DataTable (@tanstack/react-table + react-virtuoso) для сложных. TableDensity (table-density.tsx) — обёртка над shadcn Table с type-safe пропсами. DataTable частично дублирует table-density."
    }
  }

  return text
}

function generateRecommendationText(
  _catKey: string,
  name: string,
  _components: ComponentInfo[],
  canonical: string[],
  deprecated: string[]
): string {
  let text = `**Канон:** ${canonical.join(", ")}. `
  if (deprecated.length > 0) {
    text += `\n**Deprecated:**\n${deprecated.map((d) => `- ${d}`).join("\n")}`
  } else {
    text += "Все компоненты имеют разное назначение, дублирования не обнаружено."
  }
  return text
}

// ─── Main ──────────────────────────────────────────────────────────────────

function main(): void {
  const results: OverlapReport = {
    generatedAt: new Date().toISOString(),
    summary: { totalCategories: 0, totalOverlapComponents: 0, totalCanonical: 0, totalDeprecated: 0, hasDuplicates: false },
    categories: {},
  }

  let totalComponents = 0
  let totalCanonical = 0
  let totalDeprecated = 0

  for (const [key, cat] of Object.entries(categories)) {
    const components = scanCategory(cat)
    const analysis = analyzeCategory(key, components)

    totalComponents += components.length
    totalCanonical += analysis.canonical.length
    totalDeprecated += analysis.deprecated.length

    results.categories[key] = {
      name: cat.name,
      components,
      overlap: analysis.overlap,
      recommendation: analysis.recommendation,
      canonical: analysis.canonical,
      deprecated: analysis.deprecated,
    }
  }

  results.summary = {
    totalCategories: Object.keys(categories).length,
    totalOverlapComponents: totalComponents,
    totalCanonical,
    totalDeprecated,
    hasDuplicates: totalDeprecated > 0,
  }

  // Write JSON report
  fs.mkdirSync(path.join(ROOT, "reports"), { recursive: true })
  fs.writeFileSync(REPORT_JSON, JSON.stringify(results, null, 2))

  // Generate Markdown
  const md = generateMarkdown(results)
  fs.writeFileSync(REPORT_MD, md)

  console.log(`✅ UI Overlap Report generated:`)
  console.log(`   JSON: ${path.relative(ROOT, REPORT_JSON)}`)
  console.log(`   MD:   ${path.relative(ROOT, REPORT_MD)}`)
  console.log(``)
  console.log(`Summary: ${results.summary.totalCategories} categories, ${totalComponents} components`)
  console.log(`  Canonical:  ${totalCanonical}`)
  console.log(`  Deprecated: ${totalDeprecated}`)
  console.log(`  Has duplicates: ${results.summary.hasDuplicates}`)
}

function generateMarkdown(report: OverlapReport): string {
  let md = `# UI Component Overlap Inventory

**Generated:** ${report.generatedAt}
**Total categories:** ${report.summary.totalCategories}
**Total components audited:** ${report.summary.totalOverlapComponents}
**Total canonical components:** ${report.summary.totalCanonical}
**Total deprecated candidates:** ${report.summary.totalDeprecated}
**Has overlapping duplicates:** ${report.summary.hasDuplicates ? "⚠️ **Да**" : "✅ Нет"}

---

## Индекс

| # | Категория | Компонентов | Overlap |
|---|-----------|------------:|---------|
`

  for (const [key, cat] of Object.entries(report.categories)) {
    const depLen = cat.deprecated.length
    const depStr = depLen > 0 ? `⚠️ ${depLen} deprecated` : "✅ OK"
    md += `| ${key} | ${cat.name} | ${cat.components.length} | ${depStr} |\n`
  }

  md += `\n---\n\n`

  for (const [key, cat] of Object.entries(report.categories)) {
    md += `## Категория ${key}: ${cat.name}\n\n`
    md += `### Компоненты\n\n`
    md += `| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |\n`
    md += `|---|---|---|---|---|---|\n`

    for (const comp of cat.components) {
      const fileLink = comp.hasFile ? `\`${comp.file}\`` : `❌ ${comp.file}`
      const rawClasses = comp.usesRawClasses ? "Да ⚠️" : "Нет"
      const wrapperStr = comp.isWrapper ? `Да → ${comp.wrapsWhat}` : "Нет"
      md += `| ${comp.componentName} | ${fileLink} | ${comp.variants} | ${comp.usageCount} мест | ${rawClasses} | ${wrapperStr} |\n`
    }

    md += `\n### Overlap\n\n`
    md += cat.overlap + "\n\n"

    md += `### Рекомендация\n\n`
    md += cat.recommendation + "\n\n"

    // Show usage files for deprecation candidates
    const depFiles = new Set<string>()
    if (cat.deprecated.length > 0) {
      for (const dep of cat.deprecated) {
        const compName = dep.split("→")[0].trim().split("#")[1] || dep.split("→")[0].trim()
        for (const comp of cat.components) {
          if (comp.componentName === compName && comp.usageFiles.length > 0) {
            comp.usageFiles.forEach((f) => depFiles.add(f))
          }
        }
      }
      if (depFiles.size > 0) {
        md += `\n### Файлы, требующие миграции (первые 30)\n\n`
        const filesList = [...depFiles].slice(0, 30)
        for (const f of filesList) {
          md += `- \`${f}\`\n`
        }
        if (depFiles.size > 30) {
          md += `- ... и ещё ${depFiles.size - 30} файлов\n`
        }
        md += `\n`
      }
    }

    md += `---\n\n`
  }

  // Overall summary
  md += `## Итого\n\n`
  md += `| Метрика | Значение |\n`
  md += `|---|---|\n`
  md += `| Категорий с дублями | ${Object.values(report.categories).filter((c) => c.deprecated.length > 0).length} |\n`
  md += `| Всего deprecated-кандидатов | ${report.summary.totalDeprecated} |\n`
  md += `| Всего канонических компонентов | ${report.summary.totalCanonical} |\n`
  md += `| Всего просканировано компонентов | ${report.summary.totalOverlapComponents} |\n`

  return md
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main()
}
