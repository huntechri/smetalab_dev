# UI Component Overlap Inventory

**Generated:** 2026-05-05T06:26:13.526Z
**Total categories:** 16
**Total components audited:** 154
**Total canonical components:** 46
**Total deprecated candidates:** 50
**Has overlapping duplicates:** ⚠️ **Да**

---

## Индекс

| # | Категория | Компонентов | Overlap |
|---|-----------|------------:|---------|
| 1 | Badge / Token / Pill | 13 | ⚠️ 9 deprecated |
| 2 | Button | 6 | ⚠️ 3 deprecated |
| 3 | Input | 8 | ⚠️ 5 deprecated |
| 4 | Card / Surface | 14 | ⚠️ 7 deprecated |
| 5 | Panel / Layout | 15 | ⚠️ 4 deprecated |
| 6 | Table | 14 | ⚠️ 7 deprecated |
| 7 | Form | 11 | ⚠️ 2 deprecated |
| 8 | Typography / Text | 5 | ⚠️ 1 deprecated |
| 9 | Navigation / Tabs | 9 | ⚠️ 2 deprecated |
| 10 | Overlay | 9 | ✅ OK |
| 11 | State / Loading | 12 | ⚠️ 5 deprecated |
| 12 | Inline Editors (Input Cells) | 2 | ⚠️ 1 deprecated |
| 13 | Layout Constants (.ts files with Tailwind strings) | 14 | ⚠️ 3 deprecated |
| 14 | Data Display | 4 | ✅ OK |
| 15 | Marketing | 11 | ⚠️ 1 deprecated |
| 16 | Containers / Helpers | 7 | ✅ OK |

---

## Категория 1: Badge / Token / Pill

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| Badge | `badge.tsx` | unknown | 6 мест | Нет | Нет |
| StatusBadge | `status-badge.tsx` | unknown | 9 мест | Нет | Да → @/shared/ui/badge |
| StatusIndicator | `status-badge.tsx` | unknown | 3 мест | Нет | Да → @/shared/ui/badge |
| CatalogToken | `catalog-token.tsx` | code, default | 2 мест | Да ⚠️ | Нет |
| CatalogIndexToken | `catalog-token.tsx` | code, default | 1 мест | Да ⚠️ | Нет |
| DenseListToken | `dense-list/tokens.tsx` | unknown | 6 мест | Нет | Да → @/shared/ui/badge |
| DenseListMetricPill | `dense-list/metrics.tsx` | neutral, work, default | 1 мест | Да ⚠️ | Нет |
| DenseListInlineMetric | `dense-list/metrics.tsx` | neutral, work, default | 1 мест | Да ⚠️ | Нет |
| DenseListStat | `dense-list/metrics.tsx` | neutral, work, default | 1 мест | Да ⚠️ | Нет |
| EstimateTabToken | `estimate-tab.tsx` | execution, neutral, plan | 2 мест | Да ⚠️ | Да → @/shared/ui/badge |
| EstimateTabSourceToken | `estimate-tab.tsx` | execution, neutral, plan | 2 мест | Да ⚠️ | Да → @/shared/ui/badge |
| EstimateTabMetric | `estimate-tab.tsx` | execution, neutral, plan | 2 мест | Да ⚠️ | Да → @/shared/ui/badge |
| EstimateTabInlineMetric | `estimate-tab.tsx` | execution, neutral, plan | 1 мест | Да ⚠️ | Да → @/shared/ui/badge |

### Overlap

В категории "Badge / Token / Pill" обнаружено 13 компонентов. 7 из них — обёртки над другими UI-компонентами. 9 компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. Badge, StatusBadge, CatalogToken, DenseListToken и EstimateTabToken — все делают одно и то же: цветная пилюля с текстом. StatusBadge — обёртка над Badge, DenseListToken — обёртка над Badge с size=xs. Остальные — raw-реализации.

### Рекомендация

**Канон:** badge.tsx#Badge. 
**Deprecated:**
- dense-list/tokens.tsx#DenseListToken → Badge size=xs
- dense-list/metrics.tsx#DenseListMetricPill → Badge variant=pill
- dense-list/metrics.tsx#DenseListInlineMetric → Badge variant=inline-metric
- dense-list/metrics.tsx#DenseListStat → Badge variant=stat
- estimate-tab.tsx#EstimateTabToken → Badge size=xs
- estimate-tab.tsx#EstimateTabSourceToken → Badge variant=source
- estimate-tab.tsx#EstimateTabMetric → Badge variant=metric-pill
- estimate-tab.tsx#EstimateTabInlineMetric → Badge variant=metric-inline
- catalog-token.tsx#CatalogToken → Badge variant=catalog | catalog-compact


### Файлы, требующие миграции (первые 30)

- `features/global-purchases/components/GlobalPurchasesSummary.tsx`
- `features/global-purchases/components/global-purchases-columns.tsx`
- `features/projects/dashboard/components/ProjectEstimatesCards.tsx`
- `features/projects/estimates/components/table/cards/EstimateMaterialCard.tsx`
- `features/projects/estimates/components/table/cards/EstimateSectionCard.tsx`
- `features/projects/estimates/components/table/cards/EstimateWorkCard.tsx`
- `features/projects/estimates/components/table/cards/EstimateMetricPill.tsx`
- `features/global-purchases/components/cards/GlobalPurchaseCard.tsx`
- `features/projects/estimates/components/tabs/EstimateExecution.tsx`
- `features/projects/estimates/components/tabs/EstimateProcurement.tsx`
- `features/catalog/components/MaterialCatalogPicker.client.tsx`
- `features/catalog/components/WorkCatalogPicker.client.tsx`

---

## Категория 2: Button

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| Button | `button.tsx` | default, hover, primary, destructive, visible, dark, outline, secondary, ghost, link, brand, active | 63 мест | Нет | Нет |
| Button | `button.tsx` | default, hover, primary, destructive, visible, dark, outline, secondary, ghost, link, brand, active | 63 мест | Нет | Нет |
| ToolbarButton | `toolbar-button.tsx` | unknown | 7 мест | Нет | Да → @/shared/ui/button |
| Toggle | `toggle.tsx` | default, outline, hover | 0 мест | Нет | Нет |
| ToggleGroup | `toggle-group.tsx` | unknown | 0 мест | Нет | Нет |
| ButtonGroup | `button-group.tsx` | unknown | 0 мест | Нет | Да → @/shared/ui/separator |

### Overlap

В категории "Button" обнаружено 6 компонентов. 2 из них — обёртки над другими UI-компонентами. 

### Рекомендация

**Канон:** button.tsx#Button. 
**Deprecated:**
- toolbar-button.tsx#ToolbarButton → Button variant=outline size=xs + shadow-sm
- toggle.tsx#Toggle → separate primitive (not button)
- toggle-group.tsx#ToggleGroup → separate primitive (not button)


### Файлы, требующие миграции (первые 30)

- `features/_shared/guide-catalog/components/CatalogToolbar.tsx`
- `features/global-purchases/components/GlobalPurchasesEmptyStateActions.tsx`
- `features/global-purchases/components/GlobalPurchasesImportExportActions.tsx`
- `features/global-purchases/components/GlobalPurchasesToolbar.tsx`
- `features/projects/estimates/components/table/EstimateTableToolbar.tsx`
- `features/projects/estimates/components/tabs/EstimateParams.tsx`
- `features/projects/estimates/components/tabs/execution/EstimateExecutionTableActions.tsx`

---

## Категория 3: Input

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| Input | `input.tsx` | unknown | 18 мест | Нет | Да → @/shared/ui/input |
| SearchInput | `search-input.tsx` | unknown | 2 мест | Да ⚠️ | Да → @/shared/ui/input |
| SearchControl | `search-control.tsx` | compact, default, inline | 2 мест | Да ⚠️ | Да → @/shared/ui/button |
| InputGroup | `input-group.tsx` | unknown | 0 мест | Нет | Да → @/shared/ui/button, input, textarea |
| HiddenInput | `hidden-input.tsx` | unknown | 3 мест | Нет | Да → @/shared/ui/input |
| FileInput | `file-input.tsx` | unknown | 2 мест | Нет | Да → @/shared/ui/input |
| Textarea | `textarea.tsx` | unknown | 1 мест | Нет | Да → @/shared/ui/textarea |
| Select | `select.tsx` | unknown | 2 мест | Нет | Нет |

### Overlap

В категории "Input" обнаружено 8 компонентов. 7 из них — обёртки над другими UI-компонентами. 2 компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. 

### Рекомендация

**Канон:** input.tsx#Input, select.tsx#Select, textarea.tsx#Textarea. 
**Deprecated:**
- search-input.tsx#SearchInput → Input type=search
- search-control.tsx#SearchControl → Input type=search + decoration
- hidden-input.tsx#HiddenInput → raw <input type=hidden>
- file-input.tsx#FileInput → Input type=file
- input-group.tsx#InputGroup → FormLayout FieldRow


### Файлы, требующие миграции (первые 30)

- `features/projects/list/components/projects-search-input.tsx`
- `features/team/components/TeamMembersCard.tsx`
- `features/catalog/components/MaterialCatalogPicker.client.tsx`
- `features/catalog/components/WorkCatalogFilters.client.tsx`
- `features/admin/components/impersonate-button.tsx`
- `features/auth/components/LoginForm.tsx`
- `features/auth/components/ResetPasswordForm.tsx`
- `features/_shared/guide-catalog/components/CatalogScreenShell.tsx`
- `features/global-purchases/components/GlobalPurchasesImportExportActions.tsx`

---

## Категория 4: Card / Surface

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| Card | `card.tsx` | unknown | 9 мест | Нет | Нет |
| CardShell | `card-shell.tsx` | plain | 10 мест | Нет | Да → @/shared/ui/surface, primitive-surface |
| CardShellHeader | `card-shell.tsx` | plain | 4 мест | Нет | Да → @/shared/ui/surface, primitive-surface |
| CardShellBody | `card-shell.tsx` | plain | 6 мест | Нет | Да → @/shared/ui/surface, primitive-surface |
| CardShellFooter | `card-shell.tsx` | plain | 1 мест | Нет | Да → @/shared/ui/surface, primitive-surface |
| CardShellInset | `card-shell.tsx` | plain | 3 мест | Нет | Да → @/shared/ui/surface, primitive-surface |
| Surface | `surface.tsx` | card | 8 мест | Нет | Нет |
| DenseCard | `dense-card.tsx` | unknown | 1 мест | Нет | Нет |
| DenseCardTitle | `dense-list/cards.tsx` | unknown | 0 мест | Нет | Нет |
| DenseCardIcon | `dense-list/cards.tsx` | unknown | 0 мест | Нет | Нет |
| DenseCardRowLabel | `dense-list/cards.tsx` | unknown | 0 мест | Нет | Нет |
| KPICard | `kpi-card.tsx` | default | 3 мест | Да ⚠️ | Да → @/shared/ui/skeleton |
| editable-data-surface | `editable-data-surface.tsx` | estimate | 0 мест | Нет | Нет |
| EstimateTabCard | `estimate-tab.tsx` | execution, neutral, plan | 2 мест | Да ⚠️ | Да → @/shared/ui/badge |

### Overlap

В категории "Card / Surface" обнаружено 14 компонентов. 7 из них — обёртки над другими UI-компонентами. 2 компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. Card (shadcn), CardShell, Surface, DenseCard, KPICard, EditableDataSurface — 6 способов сделать карточку. CardShell — обёртка над Surface. DenseCard — raw Tailwind. Остальные — обёртки с разными variant/density пропсами.

### Рекомендация

**Канон:** card.tsx#Card, surface.tsx#Surface, card-shell.tsx#CardShell. 
**Deprecated:**
- dense-card.tsx#DenseCard → CardShell variant=card density=compact
- dense-list/cards.tsx#DenseCardTitle → CardShell + CardTitle
- dense-list/cards.tsx#DenseCardIcon → CardShell + icon slot
- dense-list/cards.tsx#DenseCardRowLabel → CardShell + label slot
- kpi-card.tsx#KPICard → CardShell variant=card + data display cells
- editable-data-surface.tsx → CardShell variant=card + inline edit
- estimate-tab.tsx#EstimateTabCard → CardShell variant=card density=compact


### Файлы, требующие миграции (первые 30)

- `features/global-purchases/components/cards/GlobalPurchaseCard.tsx`
- `features/dashboard/components/HomeKpiCards.tsx`
- `features/projects/dashboard/components/DashboardKpiCards.tsx`
- `features/projects/list/components/projects-kpi-placeholders.tsx`
- `features/projects/estimates/components/tabs/EstimateExecution.tsx`
- `features/projects/estimates/components/tabs/EstimateProcurement.tsx`

---

## Категория 5: Panel / Layout

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| PageShell | `page-shell.tsx` | compact | 5 мест | Да ⚠️ | Нет |
| ContentContainer | `page-shell.tsx` | compact | 1 мест | Да ⚠️ | Нет |
| WorkspaceMain | `page-shell.tsx` | compact | 3 мест | Да ⚠️ | Нет |
| PageHeader | `page-shell.tsx` | compact | 0 мест | Да ⚠️ | Нет |
| Section | `section.tsx` | compact | 3 мест | Нет | Нет |
| SectionHeader | `section.tsx` | compact | 1 мест | Нет | Нет |
| SectionTitle | `section.tsx` | compact | 2 мест | Нет | Нет |
| DenseListPanel | `dense-list/layout.tsx` | default | 1 мест | Нет | Нет |
| DashboardPanel | `dashboard-layout.tsx` | unknown | 1 мест | Да ⚠️ | Да → @/shared/ui/skeleton |
| DashboardPageStack | `dashboard-layout.tsx` | unknown | 2 мест | Да ⚠️ | Да → @/shared/ui/skeleton |
| EstimateTabPanel | `estimate-tab.tsx` | execution, neutral, plan | 2 мест | Да ⚠️ | Да → @/shared/ui/badge |
| AuthPanel | `auth-shell.tsx` | unknown | 1 мест | Да ⚠️ | Нет |
| MarketingSection | `marketing-shell.tsx` | unknown | 1 мест | Да ⚠️ | Нет |
| ContentContainer | `content-container.tsx` | unknown | 1 мест | Нет | Нет |
| AppHeaderShell | `app-header.tsx` | unknown | 1 мест | Нет | Нет |

### Overlap

В категории "Panel / Layout" обнаружено 15 компонентов. 3 из них — обёртки над другими UI-компонентами. 8 компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. 

### Рекомендация

**Канон:** page-shell.tsx#PageShell, section.tsx#Section. 
**Deprecated:**
- dense-list/layout.tsx#DenseListPanel → Section variant=compact
- dashboard-layout.tsx#DashboardPanel → Section variant=card
- dashboard-layout.tsx#DashboardPageStack → PageShell variant=dashboard
- estimate-tab.tsx#EstimateTabPanel → Section variant=estimates


### Файлы, требующие миграции (первые 30)

- `features/global-purchases/components/GlobalPurchasesView.client.tsx`
- `features/projects/dashboard/screens/ProjectDashboard.tsx`
- `features/dashboard/screens/AppHomeScreen.tsx`
- `features/projects/estimates/components/tabs/EstimateExecution.tsx`
- `features/projects/estimates/components/tabs/EstimateProcurement.tsx`

---

## Категория 6: Table

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| Table | `table.tsx` | unknown | 3 мест | Да ⚠️ | Да → @/shared/ui/primitive-table |
| DataTable | `data-table.tsx` | unknown | 1 мест | Да ⚠️ | Да → @/shared/ui/button, table |
| CompactTableRow | `table-density.tsx` | compact, default, xs | 1 мест | Нет | Нет |
| CompactTableHeaderRow | `table-density.tsx` | compact, default, xs | 1 мест | Нет | Нет |
| CompactTableHead | `table-density.tsx` | compact, default, xs | 1 мест | Нет | Нет |
| CompactTableCell | `table-density.tsx` | compact, default, xs | 1 мест | Нет | Нет |
| TableRowActions | `table-actions.tsx` | icon-xs | 2 мест | Да ⚠️ | Да → @/shared/ui/button |
| TableHeaderActions | `table-actions.tsx` | icon-xs | 2 мест | Да ⚠️ | Да → @/shared/ui/button |
| DataTableRow | `data-table/data-table-row.tsx` | unknown | 0 мест | Нет | Нет |
| DataTableSkeleton | `data-table/data-table-skeleton.tsx` | unknown | 0 мест | Да ⚠️ | Да → @/shared/ui/skeleton |
| DataTableToolbar | `data-table/data-table-toolbar.tsx` | unknown | 2 мест | Нет | Нет |
| EstimateTabCodeText | `estimate-tab.tsx` | execution, neutral, plan | 1 мест | Да ⚠️ | Да → @/shared/ui/badge |
| EstimateTabNameText | `estimate-tab.tsx` | execution, neutral, plan | 2 мест | Да ⚠️ | Да → @/shared/ui/badge |
| EstimateTabTitleRow | `estimate-tab.tsx` | execution, neutral, plan | 2 мест | Да ⚠️ | Да → @/shared/ui/badge |

### Overlap

В категории "Table" обнаружено 14 компонентов. 8 из них — обёртки над другими UI-компонентами. 7 компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. Две параллельные табличные системы: shadcn Table (table.tsx) для простых случаев и DataTable (@tanstack/react-table + react-virtuoso) для сложных. TableDensity (table-density.tsx) — обёртка над shadcn Table с type-safe пропсами. DataTable частично дублирует table-density.

### Рекомендация

**Канон:** table.tsx#Table, table-density.tsx#CompactTableCell, table-density.tsx#CompactTableHead. 
**Deprecated:**
- data-table.tsx#DataTable → uses table-density (fine as is)
- data-table/data-table-row.tsx#DataTableRow → merge into table-density
- data-table/data-table-skeleton.tsx#DataTableSkeleton → merge into table-density
- data-table/data-table-toolbar.tsx#DataTableToolbar → merge into table-density
- estimate-tab.tsx#EstimateTabCodeText → CompactTableCell variant=code
- estimate-tab.tsx#EstimateTabNameText → CompactTableCell variant=name
- estimate-tab.tsx#EstimateTabTitleRow → CompactTableRow variant=title


### Файлы, требующие миграции (первые 30)

- `features/projects/estimates/components/registry/EstimatesListTable.tsx`
- `features/global-purchases/components/GlobalPurchasesView.client.tsx`
- `features/projects/estimates/components/table/EstimateTable.client.tsx`
- `features/projects/estimates/components/tabs/EstimateExecution.tsx`
- `features/projects/estimates/components/tabs/EstimateProcurement.tsx`

---

## Категория 7: Form

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| FormItem | `form.tsx` | unknown | 4 мест | Нет | Да → @/shared/ui/label |
| FormLabel | `form.tsx` | unknown | 4 мест | Нет | Да → @/shared/ui/label |
| FormMessage | `form.tsx` | unknown | 4 мест | Нет | Да → @/shared/ui/label |
| FormControl | `form.tsx` | unknown | 4 мест | Нет | Да → @/shared/ui/label |
| FormLayout | `form-layout.tsx` | unknown | 15 мест | Да ⚠️ | Да → @/shared/ui/form, label |
| FormSection | `form-layout.tsx` | unknown | 4 мест | Да ⚠️ | Да → @/shared/ui/form, label |
| FieldStack | `form-layout.tsx` | unknown | 2 мест | Да ⚠️ | Да → @/shared/ui/form, label |
| FieldRow | `form-layout.tsx` | unknown | 1 мест | Да ⚠️ | Да → @/shared/ui/form, label |
| FormSectionHeader | `form-layout.tsx` | unknown | 1 мест | Да ⚠️ | Да → @/shared/ui/form, label |
| FieldGroup | `field.tsx` | unknown | 0 мест | Да ⚠️ | Да → @/shared/ui/label, separator |
| Label | `label.tsx` | unknown | 10 мест | Нет | Нет |

### Overlap

В категории "Form" обнаружено 11 компонентов. 10 из них — обёртки над другими UI-компонентами. 5 компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. 

### Рекомендация

**Канон:** form.tsx#FormItem, form-layout.tsx#FormLayout, form-layout.tsx#FieldStack. 
**Deprecated:**
- field.tsx#FieldGroup → FormLayout FieldStack
- label.tsx#Label → standalone, fine as separate


### Файлы, требующие миграции (первые 30)

- `features/auth/components/ForgotPasswordForm.tsx`
- `features/auth/components/LoginForm.tsx`
- `features/auth/components/ResetPasswordForm.tsx`
- `features/projects/dashboard/components/ProjectReceiptsSection.tsx`
- `features/projects/estimates/components/table/EstimateTableDialogs.tsx`
- `features/settings/components/user-settings-page.tsx`
- `features/settings/screens/AdminGeneralSettingsScreen.tsx`
- `features/settings/screens/AdminSecuritySettingsScreen.tsx`
- `features/team/components/InviteTeamMemberCard.tsx`
- `features/team/components/TeamMembersCard.tsx`

---

## Категория 8: Typography / Text

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| primitiveVisualTypographyClassNames | `primitive-surface.ts` | default, compact | 23 мест | Нет | Нет |
| primitiveBadgeVariantClassNames | `primitive-badge.ts` | unknown | 0 мест | Нет | Нет |
| EstimateTabText | `estimate-tab.tsx` | execution, neutral, plan | 0 мест | Да ⚠️ | Да → @/shared/ui/badge |
| primitive-density | `primitive-density.ts` | unknown | 0 мест | Нет | Нет |
| primitive-controls | `primitive-controls.ts` | unknown | 0 мест | Нет | Нет |

### Overlap

В категории "Typography / Text" обнаружено 5 компонентов. 1 из них — обёртки над другими UI-компонентами. 

### Рекомендация

**Канон:** primitive-surface.ts#primitiveVisualTypographyClassNames. 
**Deprecated:**
- Raw text classes in features/ → use consistent typography tokens from primitives

---

## Категория 9: Navigation / Tabs

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| Tabs | `tabs.tsx` | unknown | 4 мест | Нет | Нет |
| WorkspaceTabs | `workspace-tabs.tsx` | panel | 1 мест | Нет | Да → @/shared/ui/skeleton |
| Sidebar | `sidebar.tsx` | default, hover, outline | 2 мест | Да ⚠️ | Да → @/shared/ui/button, input, sheet, separator, skeleton |
| AppHeaderShell | `app-header.tsx` | unknown | 1 мест | Нет | Нет |
| AppBreadcrumbs | `breadcrumbs.tsx` | unknown | 1 мест | Да ⚠️ | Нет |
| NavigationMenu | `navigation-menu.tsx` | unknown | 0 мест | Да ⚠️ | Нет |
| MarketingHeader | `marketing-shell.tsx` | unknown | 1 мест | Да ⚠️ | Нет |
| MarketingFooter | `marketing-shell.tsx` | unknown | 1 мест | Да ⚠️ | Нет |
| MarketingMobileMenu | `marketing-shell.tsx` | unknown | 1 мест | Да ⚠️ | Нет |

### Overlap

В категории "Navigation / Tabs" обнаружено 9 компонентов. 2 из них — обёртки над другими UI-компонентами. 5 компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. 

### Рекомендация

**Канон:** tabs.tsx#Tabs, sidebar.tsx#Sidebar, breadcrumbs.tsx#AppBreadcrumbs. 
**Deprecated:**
- workspace-tabs.tsx#WorkspaceTabs → Tabs variant=workspace
- navigation-menu.tsx#NavigationMenu → Sidebar or standalone (fine as is, different purpose)


### Файлы, требующие миграции (первые 30)

- `features/projects/estimates/screens/EstimateDetailsShell.client.tsx`

---

## Категория 10: Overlay

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| Dialog | `dialog.tsx` | sm | 8 мест | Да ⚠️ | Да → @/shared/ui/button |
| Drawer | `drawer.tsx` | unknown | 0 мест | Да ⚠️ | Нет |
| Sheet | `sheet.tsx` | sm | 4 мест | Да ⚠️ | Нет |
| Popover | `popover.tsx` | sm | 8 мест | Нет | Нет |
| HoverCard | `hover-card.tsx` | unknown | 0 мест | Нет | Нет |
| AlertDialog | `alert-dialog.tsx` | unknown | 8 мест | Нет | Да → @/shared/ui/button |
| Tooltip | `tooltip.tsx` | unknown | 8 мест | Да ⚠️ | Нет |
| ContextMenu | `context-menu.tsx` | unknown | 0 мест | Да ⚠️ | Нет |
| Command | `command.tsx` | unknown | 7 мест | Да ⚠️ | Да → @/shared/ui/dialog |

### Overlap

В категории "Overlay" обнаружено 9 компонентов. 3 из них — обёртки над другими UI-компонентами. 4 компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. 

### Рекомендация

**Канон:** dialog.tsx#Dialog, sheet.tsx#Sheet, drawer.tsx#Drawer, popover.tsx#Popover. Все компоненты имеют разное назначение, дублирования не обнаружено.

---

## Категория 11: State / Loading

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| LoadingState | `states/index.ts` | unknown | 9 мест | Нет | Нет |
| EmptyState | `states/index.ts` | unknown | 2 мест | Нет | Нет |
| ErrorState | `states/index.ts` | unknown | 4 мест | Нет | Нет |
| ForbiddenState | `states/index.ts` | unknown | 2 мест | Нет | Нет |
| NoResultsState | `states/index.ts` | unknown | 2 мест | Нет | Нет |
| StateShell | `states/index.ts` | unknown | 0 мест | Нет | Нет |
| Spinner | `spinner.tsx` | unknown | 0 мест | Нет | Нет |
| Skeleton | `skeleton.tsx` | unknown | 2 мест | Нет | Нет |
| LoadingIndicator | `loading-indicator.tsx` | unknown | 1 мест | Да ⚠️ | Нет |
| DataTableSkeleton | `data-table/data-table-skeleton.tsx` | unknown | 0 мест | Да ⚠️ | Да → @/shared/ui/skeleton |
| TableEmptyState | `table-empty-state.tsx` | default | 5 мест | Да ⚠️ | Нет |
| Empty | `empty.tsx` | default, icon, _svg | 1 мест | Нет | Нет |

### Overlap

В категории "State / Loading" обнаружено 12 компонентов. 1 из них — обёртки над другими UI-компонентами. 2 компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. 

### Рекомендация

**Канон:** states/index.ts#LoadingState, states/index.ts#EmptyState, states/index.ts#ErrorState. 
**Deprecated:**
- spinner.tsx#Spinner → LoadingState variant=spinner
- loading-indicator.tsx#LoadingIndicator → LoadingState variant=indicator
- data-table/data-table-skeleton.tsx#DataTableSkeleton → LoadingState variant=table-skeleton
- table-empty-state.tsx#TableEmptyState → EmptyState variant=table
- empty.tsx#Empty → EmptyState variant=generic


### Файлы, требующие миграции (первые 30)

- `features/notifications/components/notifications-list.tsx`
- `features/_shared/directories/components/directory-list-screen.tsx`
- `features/_shared/guide-catalog/components/CatalogTableWrapper.tsx`
- `features/global-purchases/components/GlobalPurchasesView.client.tsx`
- `features/projects/dashboard/components/ProjectEstimatesCards.tsx`
- `features/projects/estimates/components/table/EstimateTable.client.tsx`
- `features/projects/list/components/projects-list.tsx`

---

## Категория 12: Inline Editors (Input Cells)

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| useDenseListInlineEdit | `dense-list/inline-edit.ts` | unknown | 0 мест | Нет | Нет |
| EditableCell | `cells/editable-cell.tsx` | unknown | 3 мест | Да ⚠️ | Да → @/shared/ui/button, input |

### Overlap

В категории "Inline Editors (Input Cells)" обнаружено 2 компонентов. 1 из них — обёртки над другими UI-компонентами. 1 компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. 

### Рекомендация

**Канон:** cells/editable-cell.tsx#EditableCell. 
**Deprecated:**
- dense-list/inline-edit.ts#useDenseListInlineEdit → EditableCell hook

---

## Категория 13: Layout Constants (.ts files with Tailwind strings)

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| toolbar | `dense-list/toolbar.ts` | unknown | 0 мест | Нет | Нет |
| table | `dense-list/table.ts` | unknown | 0 мест | Нет | Нет |
| PickersConstants | `dense-list/pickers.tsx` | unknown | 0 мест | Нет | Да → @/shared/ui/button |
| primitive-surface | `primitive-surface.ts` | default, compact | 0 мест | Нет | Нет |
| primitive-spacing | `primitive-spacing.ts` | none | 0 мест | Нет | Нет |
| primitive-density | `primitive-density.ts` | unknown | 0 мест | Нет | Нет |
| primitive-controls | `primitive-controls.ts` | unknown | 0 мест | Нет | Нет |
| primitive-navigation | `primitive-navigation.ts` | unknown | 0 мест | Нет | Нет |
| primitive-table | `primitive-table.ts` | unknown | 0 мест | Нет | Нет |
| primitive-badge | `primitive-badge.ts` | unknown | 0 мест | Нет | Нет |
| primitive-form | `primitive-form.ts` | unknown | 0 мест | Нет | Нет |
| primitive-overlay | `primitive-overlay.ts` | unknown | 0 мест | Нет | Нет |
| primitive-chart | `primitive-chart.ts` | unknown | 0 мест | Нет | Нет |
| primitive-marketing | `primitive-marketing.ts` | unknown | 0 мест | Нет | Нет |

### Overlap

В категории "Layout Constants (.ts files with Tailwind strings)" обнаружено 14 компонентов. 1 из них — обёртки над другими UI-компонентами. 

### Рекомендация

**Канон:** primitive-surface.ts, primitive-spacing.ts, primitive-density.ts, primitive-controls.ts, primitive-navigation.ts, primitive-table.ts, primitive-badge.ts, primitive-form.ts, primitive-overlay.ts, primitive-chart.ts, primitive-marketing.ts. 
**Deprecated:**
- dense-list/toolbar.ts → merge into primitive-navigation.ts
- dense-list/table.ts → merge into primitive-table.ts
- dense-list/pickers.tsx → merge into primitive-controls.ts

---

## Категория 14: Data Display

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| MoneyCell | `cells/money-cell.tsx` | unknown | 7 мест | Нет | Нет |
| EditableCell | `cells/editable-cell.tsx` | unknown | 3 мест | Да ⚠️ | Да → @/shared/ui/button, input |
| CurrencyCell | ❌ cells/currency-cell.tsx | unknown | 0 мест | Нет | Нет |
| KPICard | `kpi-card.tsx` | default | 3 мест | Да ⚠️ | Да → @/shared/ui/skeleton |

### Overlap

В категории "Data Display" обнаружено 4 компонентов. 2 из них — обёртки над другими UI-компонентами. 2 компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. 

### Рекомендация

**Канон:** cells/money-cell.tsx#MoneyCell, kpi-card.tsx#KPICard. Все компоненты имеют разное назначение, дублирования не обнаружено.

---

## Категория 15: Marketing

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| MarketingShell | `marketing-shell.tsx` | unknown | 0 мест | Да ⚠️ | Нет |
| MarketingHeader | `marketing-shell.tsx` | unknown | 1 мест | Да ⚠️ | Нет |
| MarketingHero | `marketing-shell.tsx` | unknown | 1 мест | Да ⚠️ | Нет |
| MarketingFeatureGrid | `marketing-shell.tsx` | unknown | 0 мест | Да ⚠️ | Нет |
| MarketingFooter | `marketing-shell.tsx` | unknown | 1 мест | Да ⚠️ | Нет |
| MarketingMobileMenu | `marketing-shell.tsx` | unknown | 1 мест | Да ⚠️ | Нет |
| AuthShell | `auth-shell.tsx` | unknown | 2 мест | Да ⚠️ | Нет |
| AuthPanel | `auth-shell.tsx` | unknown | 1 мест | Да ⚠️ | Нет |
| AuthFeatureCard | `auth-shell.tsx` | unknown | 0 мест | Да ⚠️ | Нет |
| AuthStatusMessage | `auth-shell.tsx` | unknown | 5 мест | Да ⚠️ | Нет |
| primitiveMarketingClassNames | `primitive-marketing.ts` | unknown | 0 мест | Нет | Нет |

### Overlap

В категории "Marketing" обнаружено 11 компонентов. 7 компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. 

### Рекомендация

**Канон:** marketing-shell.tsx#MarketingShell, auth-shell.tsx#AuthShell. 
**Deprecated:**
- primitive-marketing.ts#primitiveMarketingClassNames → marketing-shell.tsx

---

## Категория 16: Containers / Helpers

### Компоненты

| Компонент | Файл | Variants | Usage (features/) | Raw Classes? | Wrapper? |
|---|---|---|---|---|---|
| Separator | `separator.tsx` | unknown | 5 мест | Нет | Нет |
| ScrollArea | `scroll-area.tsx` | unknown | 5 мест | Да ⚠️ | Нет |
| Accordion | `accordion.tsx` | unknown | 0 мест | Да ⚠️ | Нет |
| Carousel | `carousel.tsx` | unknown | 0 мест | Да ⚠️ | Да → @/shared/ui/button |
| Resizable | `resizable.tsx` | unknown | 0 мест | Да ⚠️ | Нет |
| Collapsible | `collapsible.tsx` | unknown | 0 мест | Нет | Нет |
| Command | `command.tsx` | unknown | 7 мест | Да ⚠️ | Да → @/shared/ui/dialog |

### Overlap

В категории "Containers / Helpers" обнаружено 7 компонентов. 2 из них — обёртки над другими UI-компонентами. 2 компонент(ов) использует raw Tailwind-классы вместо примитивных токенов. 

### Рекомендация

**Канон:** scroll-area.tsx#ScrollArea, separator.tsx#Separator, accordion.tsx#Accordion. Все компоненты имеют разное назначение, дублирования не обнаружено.

---

## Итого

| Метрика | Значение |
|---|---|
| Категорий с дублями | 13 |
| Всего deprecated-кандидатов | 50 |
| Всего канонических компонентов | 46 |
| Всего просканировано компонентов | 154 |
