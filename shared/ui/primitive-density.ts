/**
 * @deprecated Import tokens from their specific domain file instead:
 *
 *   Controls (Button, Input, Select, Toggle, KBD, InputGroup, Textarea, icons):
 *     import { ... } from './primitive-controls'
 *
 *   Spacing (Surface density, Empty state, Calendar, Accordion, Field):
 *     import { ... } from './primitive-spacing'
 *
 *   Surface (Card, CardShell, Visual surface, Typography):
 *     import { ... } from './primitive-surface'
 *
 *   Table (DataTable, Table, TableDensity):
 *     import { ... } from './primitive-table'
 *
 *   Overlay (Drawer, Dialog, Sheet, Popover):
 *     import { ... } from './primitive-overlay'
 *
 *   Form (FormLayout, FormLabel, FormHelper, FieldStack):
 *     import { ... } from './primitive-form'
 *
 *   Navigation (Tabs, PageShell, Sidebar, Breadcrumb):
 *     import { ... } from './primitive-navigation'
 *
 *   Chart (Chart, KpiCard, DashboardLayout):
 *     import { ... } from './primitive-chart'
 *
 *   Badge (Badge, StatusBadge, CatalogToken):
 *     import { ... } from './primitive-badge'
 *
 * This barrel file is maintained for backward compatibility only.
 * New imports should use the specific domain file.
 */

export * from './primitive-controls'
export * from './primitive-spacing'
export * from './primitive-surface'
export * from './primitive-table'
export * from './primitive-overlay'
export * from './primitive-form'
export * from './primitive-navigation'
export * from './primitive-chart'
export * from './primitive-badge'
