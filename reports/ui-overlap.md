# UI Component Overlap Audit

**Generated:** 2026-05-05T07:33:29.832Z
**Total categories:** 16
**Components found:** 395
**Deprecated candidates:** 61

---

## Index

| # | Category | Components | Overlap |
|---|----------|----------:|---------|
| 1 | Badge / Token / Pill | 7 | ⚠️ 1 deprecated |
| 2 | Button | 8 | ⚠️ 6 deprecated |
| 3 | Input | 22 | ⚠️ 7 deprecated |
| 4 | Card / Surface | 36 | ⚠️ 1 deprecated |
| 5 | Panel / Layout | 24 | ⚠️ 1 deprecated |
| 6 | Table | 26 | ⚠️ 13 deprecated |
| 7 | Form | 26 | ⚠️ 10 deprecated |
| 8 | Navigation / Tabs | 44 | ⚠️ 7 deprecated |
| 9 | Overlay | 96 | ⚠️ 4 deprecated |
| 10 | State / Loading | 16 | ⚠️ 3 deprecated |
| 11 | Marketing | 15 | ✅ OK |
| 12 | Data Display | 25 | ⚠️ 1 deprecated |
| 13 | Containers / Helpers | 34 | ⚠️ 7 deprecated |
| 14 | Layout Constants (.ts files) | 14 | ✅ OK |
| 15 | Inline Editors | 1 | ✅ OK |
| 16 | Shells / Wrappers | 1 | ✅ OK |

---

## Категория 1: Badge / Token / Pill

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| Badge | badge.tsx | ✅ да | 28 | канон |
| StatusIndicator | status-badge.tsx | ✅ да | 3 | — |
| CatalogIndexToken | catalog-token.tsx | ✅ да | 1 | — |
| CatalogAiModeIndicator | catalog-token.tsx | ✅ да | 0 | 0 usage |
| DenseListColorIndicator | dense-list/tokens.tsx | ✅ да | 2 | — |
| DenseListStat | dense-list/metrics.tsx | ✅ да | 1 | — |
| DenseListSummaryRail | dense-list/metrics.tsx | ✅ да | 1 | — |

### Overlap

В категории "Badge / Token / Pill" обнаружено 7 компонентов. 1 из них — обёртки. 1 кандидатов на удаление. 

### Рекомендация

**Канон:** badge.tsx#Badge.
**Deprecated кандидаты:**
- catalog-token.tsx#CatalogAiModeIndicator → 0 usage


### Файлы для миграции
(empty)

---

## Категория 2: Button

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| Button | button.tsx | ✅ да | 62 | канон |
| ToolbarButton | toolbar-button.tsx | ✅ да | 7 | — |
| Toggle | toggle.tsx | ✅ да | 0 | 0 usage |
| ToggleGroup | toggle-group.tsx | ✅ да | 0 | 0 usage |
| ToggleGroupItem | toggle-group.tsx | ✅ да | 0 | 0 usage |
| ButtonGroup | button-group.tsx | ✅ да | 0 | 0 usage |
| ButtonGroupText | button-group.tsx | ✅ да | 0 | 0 usage |
| ButtonGroupSeparator | button-group.tsx | ✅ да | 0 | 0 usage |

### Overlap

В категории "Button" обнаружено 8 компонентов. 1 из них — обёртки. 6 кандидатов на удаление. 

### Рекомендация

**Канон:** button.tsx#Button.
**Deprecated кандидаты:**
- toggle.tsx#Toggle → 0 usage
- toggle-group.tsx#ToggleGroup → 0 usage
- toggle-group.tsx#ToggleGroupItem → 0 usage
- button-group.tsx#ButtonGroup → 0 usage
- button-group.tsx#ButtonGroupText → 0 usage
- button-group.tsx#ButtonGroupSeparator → 0 usage


### Файлы для миграции
(empty)

---

## Категория 3: Input

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| Input | input.tsx | ✅ да | 18 | канон |
| SearchInput | search-input.tsx | ✅ да | 2 | обёртка |
| SearchControl | search-control.tsx | ✅ да | 2 | — |
| InputGroup | input-group.tsx | ✅ да | 0 | обёртка |
| InputGroupAddon | input-group.tsx | ✅ да | 0 | обёртка |
| InputGroupButton | input-group.tsx | ✅ да | 0 | обёртка |
| InputGroupText | input-group.tsx | ✅ да | 0 | обёртка |
| InputGroupInput | input-group.tsx | ✅ да | 0 | обёртка |
| InputGroupTextarea | input-group.tsx | ✅ да | 0 | обёртка |
| HiddenInput | hidden-input.tsx | ✅ да | 3 | — |
| FileInput | file-input.tsx | ✅ да | 2 | — |
| Textarea | textarea.tsx | ✅ да | 1 | канон |
| Select | select.tsx | ✅ да | 2 | канон |
| SelectGroup | select.tsx | ✅ да | 0 | Radix |
| SelectValue | select.tsx | ✅ да | 2 | ✅ Radix |
| SelectTrigger | select.tsx | ✅ да | 2 | ✅ Radix |
| SelectContent | select.tsx | ✅ да | 2 | ✅ Radix |
| SelectLabel | select.tsx | ✅ да | 0 | Radix |
| SelectItem | select.tsx | ✅ да | 2 | ✅ Radix |
| SelectSeparator | select.tsx | ✅ да | 0 | Radix |
| SelectScrollUpButton | select.tsx | ✅ да | 0 | Radix |
| SelectScrollDownButton | select.tsx | ✅ да | 0 | Radix |

### Overlap

В категории "Input" обнаружено 22 компонентов. 8 из них — обёртки. 7 кандидатов на удаление. 

### Рекомендация

**Канон:** input.tsx#Input, select.tsx#Select, textarea.tsx#Textarea.
**Deprecated кандидаты:**
- search-input.tsx#SearchInput → обёртка над Input
- input-group.tsx#InputGroup → обёртка над Input, Textarea
- input-group.tsx#InputGroupAddon → обёртка над Input, Textarea
- input-group.tsx#InputGroupButton → обёртка над Input, Textarea
- input-group.tsx#InputGroupText → обёртка над Input, Textarea
- input-group.tsx#InputGroupInput → обёртка над Input, Textarea
- input-group.tsx#InputGroupTextarea → обёртка над Input, Textarea


### Файлы для миграции

- `features/projects/list/components/projects-search-input.tsx`
- `features/team/components/TeamMembersCard.tsx`

---

## Категория 4: Card / Surface

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| Card | card.tsx | ✅ да | 9 | канон |
| CardHeader | card.tsx | ✅ да | 8 | — |
| CardTitle | card.tsx | ✅ да | 8 | — |
| CardDescription | card.tsx | ✅ да | 5 | — |
| CardAction | card.tsx | ✅ да | 0 | — |
| CardContent | card.tsx | ✅ да | 8 | — |
| CardFooter | card.tsx | ✅ да | 0 | — |
| CardShell | card-shell.tsx | ✅ да | 10 | — |
| CardShellInset | card-shell.tsx | ✅ да | 3 | — |
| CardShellHeader | card-shell.tsx | ✅ да | 4 | — |
| CardShellBody | card-shell.tsx | ✅ да | 6 | — |
| CardShellFooter | card-shell.tsx | ✅ да | 1 | — |
| Surface | surface.tsx | ✅ да | 8 | канон |
| DenseCard | dense-card.tsx | ✅ да | 1 | — |
| DenseListItem | dense-list/cards.tsx | ✅ да | 1 | — |
| DenseListRow | dense-list/cards.tsx | ✅ да | 1 | — |
| DenseListRecordGrid | dense-list/cards.tsx | ✅ да | 1 | — |
| DenseListMetaField | dense-list/cards.tsx | ✅ да | 1 | — |
| DenseListPrimaryCell | dense-list/cards.tsx | ✅ да | 1 | — |
| DenseListInlineStart | dense-list/cards.tsx | ✅ да | 1 | — |
| DenseListWrap | dense-list/cards.tsx | ✅ да | 1 | — |
| DenseListMetricGroup | dense-list/cards.tsx | ✅ да | 1 | — |
| DenseListTrailingActions | dense-list/cards.tsx | ✅ да | 1 | — |
| DenseListInlineContent | dense-list/cards.tsx | ✅ да | 1 | — |
| DenseListBodyRow | dense-list/cards.tsx | ✅ да | 2 | — |
| DenseListNestedPanel | dense-list/cards.tsx | ✅ да | 1 | — |
| DenseListActionsGrid | dense-list/cards.tsx | ✅ да | 1 | — |
| DenseListTrailingAction | dense-list/cards.tsx | ✅ да | 1 | — |
| KPICard | kpi-card.tsx | ✅ да | 3 | — |
| KPICardGrid | kpi-card.tsx | ✅ да | 3 | — |
| KPICardGridSkeleton | kpi-card.tsx | ✅ да | 1 | обёртка |
| EditableDataSurface | editable-data-surface.tsx | ✅ да | 1 | — |
| EditableDataSurfaceToolbar | editable-data-surface.tsx | ✅ да | 1 | — |
| EditableDataSurfaceViewport | editable-data-surface.tsx | ✅ да | 1 | — |
| EditableDataSurfaceEmptyInset | editable-data-surface.tsx | ✅ да | 1 | — |
| EditableDataSurfaceActions | editable-data-surface.tsx | ✅ да | 1 | — |

### Overlap

В категории "Card / Surface" обнаружено 36 компонентов. 8 из них — обёртки. 1 кандидатов на удаление. 

### Рекомендация

**Канон:** card.tsx#Card, surface.tsx#Surface.
**Deprecated кандидаты:**
- kpi-card.tsx#KPICardGridSkeleton → обёртка над CardShell, CardShellBody


### Файлы для миграции

- `features/projects/dashboard/screens/ProjectDashboard.tsx`

---

## Категория 5: Panel / Layout

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| ContentContainer | page-shell.tsx | ✅ да | 1 | канон |
| PageHeader | page-shell.tsx | ✅ да | 0 | — |
| PageShell | page-shell.tsx | ✅ да | 5 | — |
| WorkspaceMain | page-shell.tsx | ✅ да | 3 | — |
| Section | section.tsx | ✅ да | 3 | канон |
| SectionHeader | section.tsx | ✅ да | 1 | — |
| SectionTitle | section.tsx | ✅ да | 2 | — |
| DenseListSurface | dense-list/layout.tsx | ✅ да | 1 | — |
| DenseListPanel | dense-list/layout.tsx | ✅ да | 1 | — |
| DenseListToolbarInset | dense-list/layout.tsx | ✅ да | 1 | — |
| DenseListContentInset | dense-list/layout.tsx | ✅ да | 1 | — |
| DenseListHeader | dense-list/layout.tsx | ✅ да | 1 | — |
| DenseListViewport | dense-list/layout.tsx | ✅ да | 2 | — |
| DenseListStack | dense-list/layout.tsx | ✅ да | 1 | — |
| DenseListEmptyBlock | dense-list/layout.tsx | ✅ да | 1 | — |
| DenseListEmptyInset | dense-list/layout.tsx | ✅ да | 1 | — |
| DashboardPageStack | dashboard-layout.tsx | ✅ да | 2 | — |
| DashboardSectionStack | dashboard-layout.tsx | ✅ да | 1 | — |
| DashboardMainContainer | dashboard-layout.tsx | ✅ да | 2 | — |
| DashboardResponsiveColumns | dashboard-layout.tsx | ✅ да | 1 | — |
| DashboardSingleColumn | dashboard-layout.tsx | ✅ да | 1 | — |
| DashboardPanel | dashboard-layout.tsx | ✅ да | 1 | — |
| DashboardChartSkeleton | dashboard-layout.tsx | ✅ да | 1 | — |
| AppHeaderShell | app-header.tsx | ✅ да | 0 | 0 usage |

### Overlap

В категории "Panel / Layout" обнаружено 24 компонентов. 1 кандидатов на удаление. (1 файлов содержат только константы/типы.)

### Рекомендация

**Канон:** page-shell.tsx#ContentContainer, section.tsx#Section.
**Deprecated кандидаты:**
- app-header.tsx#AppHeaderShell → 0 usage


### Файлы для миграции
(empty)

---

## Категория 6: Table

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| Table | table.tsx | ✅ да | 3 | канон |
| TableHeader | table.tsx | ✅ да | 2 | — |
| StickyTableHeader | table.tsx | ✅ да | 1 | — |
| TableBody | table.tsx | ✅ да | 3 | — |
| TableFooter | table.tsx | ✅ да | 0 | — |
| TableRow | table.tsx | ✅ да | 2 | — |
| TableHead | table.tsx | ✅ да | 2 | — |
| TableCell | table.tsx | ✅ да | 2 | — |
| TableCaption | table.tsx | ✅ да | 0 | — |
| SortableHeaderTrigger | data-table.tsx | ❌ нет | 0 | 0 usage |
| HeaderCellContent | data-table.tsx | ❌ нет | 0 | 0 usage |
| DataTableHeaderCell | data-table.tsx | ❌ нет | 0 | 0 usage |
| DataTableHeaderContent | data-table.tsx | ❌ нет | 0 | 0 usage |
| DataTable | data-table.tsx | ✅ да | 1 | — |
| TableHeaderLabel | table-density.tsx | ✅ да | 0 | обёртка |
| TableCellText | table-density.tsx | ✅ да | 0 | обёртка |
| CompactTableHeaderRow | table-density.tsx | ✅ да | 1 | обёртка |
| CompactTableRow | table-density.tsx | ✅ да | 1 | обёртка |
| CompactTableHead | table-density.tsx | ✅ да | 1 | обёртка |
| CompactTableCell | table-density.tsx | ✅ да | 1 | обёртка |
| TablePlaceholderRowActions | table-actions.tsx | ✅ да | 0 | 0 usage |
| TableRowActions | table-actions.tsx | ✅ да | 2 | — |
| TableHeaderActions | table-actions.tsx | ✅ да | 2 | — |
| DataTableRow | data-table/data-table-row.tsx | ✅ да | 0 | 0 usage |
| DataTableSkeleton | data-table/data-table-skeleton.tsx | ✅ да | 0 | 0 usage |
| DataTableToolbar | data-table/data-table-toolbar.tsx | ✅ да | 2 | — |

### Overlap

В категории "Table" обнаружено 26 компонентов. 6 из них — обёртки. 13 кандидатов на удаление. 

### Рекомендация

**Канон:** table.tsx#Table.
**Deprecated кандидаты:**
- data-table.tsx#SortableHeaderTrigger → 0 usage
- data-table.tsx#HeaderCellContent → 0 usage
- data-table.tsx#DataTableHeaderCell → 0 usage
- data-table.tsx#DataTableHeaderContent → 0 usage
- table-density.tsx#TableHeaderLabel → обёртка над TableCell, TableHead, TableRow
- table-density.tsx#TableCellText → обёртка над TableCell, TableHead, TableRow
- table-density.tsx#CompactTableHeaderRow → обёртка над TableCell, TableHead, TableRow
- table-density.tsx#CompactTableRow → обёртка над TableCell, TableHead, TableRow
- table-density.tsx#CompactTableHead → обёртка над TableCell, TableHead, TableRow
- table-density.tsx#CompactTableCell → обёртка над TableCell, TableHead, TableRow
- table-actions.tsx#TablePlaceholderRowActions → 0 usage
- data-table/data-table-row.tsx#DataTableRow → 0 usage
- data-table/data-table-skeleton.tsx#DataTableSkeleton → 0 usage


### Файлы для миграции

- `features/projects/dashboard/components/ProjectReceiptsSection.tsx`

---

## Категория 7: Form

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| FormItem | form.tsx | ✅ да | 4 | канон |
| FormLabel | form.tsx | ✅ да | 4 | — |
| FormControl | form.tsx | ✅ да | 4 | — |
| FormDescription | form.tsx | ✅ да | 0 | — |
| FormMessage | form.tsx | ✅ да | 4 | — |
| Form | form.tsx | ✅ да | 4 | — |
| FormField | form.tsx | ✅ да | 4 | — |
| FormSectionHeader | form-layout.tsx | ✅ да | 1 | канон |
| RadioGroupRow | form-layout.tsx | ✅ да | 1 | — |
| FormSection | form-layout.tsx | ✅ да | 4 | — |
| FieldStack | form-layout.tsx | ✅ да | 2 | — |
| FieldRow | form-layout.tsx | ✅ да | 1 | — |
| FormHelperText | form-layout.tsx | ✅ да | 1 | — |
| FormErrorText | form-layout.tsx | ✅ да | 0 | — |
| FormStatusMessage | form-layout.tsx | ✅ да | 4 | — |
| FieldSet | field.tsx | ✅ да | 0 | обёртка |
| FieldLegend | field.tsx | ✅ да | 0 | обёртка |
| FieldGroup | field.tsx | ✅ да | 0 | обёртка |
| Field | field.tsx | ✅ да | 0 | обёртка |
| FieldContent | field.tsx | ✅ да | 0 | обёртка |
| FieldLabel | field.tsx | ✅ да | 0 | обёртка |
| FieldTitle | field.tsx | ✅ да | 0 | обёртка |
| FieldDescription | field.tsx | ✅ да | 0 | обёртка |
| FieldSeparator | field.tsx | ✅ да | 0 | обёртка |
| FieldError | field.tsx | ✅ да | 0 | обёртка |
| Label | label.tsx | ✅ да | 10 | — |

### Overlap

В категории "Form" обнаружено 26 компонентов. 25 из них — обёртки. 10 кандидатов на удаление. 

### Рекомендация

**Канон:** form-layout.tsx#FormSectionHeader, form.tsx#FormItem.
**Deprecated кандидаты:**
- field.tsx#FieldSet → обёртка над Label
- field.tsx#FieldLegend → обёртка над Label
- field.tsx#FieldGroup → обёртка над Label
- field.tsx#Field → обёртка над Label
- field.tsx#FieldContent → обёртка над Label
- field.tsx#FieldLabel → обёртка над Label
- field.tsx#FieldTitle → обёртка над Label
- field.tsx#FieldDescription → обёртка над Label
- field.tsx#FieldSeparator → обёртка над Label
- field.tsx#FieldError → обёртка над Label


### Файлы для миграции
(empty)

---

## Категория 8: Navigation / Tabs

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| Tabs | tabs.tsx | ✅ да | 4 | канон |
| TabsList | tabs.tsx | ✅ да | 3 | ✅ Radix |
| TabsTrigger | tabs.tsx | ✅ да | 3 | ✅ Radix |
| TabsContent | tabs.tsx | ✅ да | 4 | ✅ Radix |
| WorkspaceTabs | workspace-tabs.tsx | ✅ да | 1 | обёртка |
| WorkspaceTabsList | workspace-tabs.tsx | ✅ да | 1 | обёртка |
| WorkspaceTabsTrigger | workspace-tabs.tsx | ✅ да | 1 | обёртка |
| WorkspaceTabsContent | workspace-tabs.tsx | ✅ да | 1 | обёртка |
| WorkspaceTabsFallback | workspace-tabs.tsx | ✅ да | 1 | обёртка |
| SidebarProvider | sidebar.tsx | ✅ да | 2 | канон |
| Sidebar | sidebar.tsx | ✅ да | 1 | — |
| SidebarTrigger | sidebar.tsx | ✅ да | 1 | — |
| SidebarRail | sidebar.tsx | ✅ да | 0 | — |
| SidebarInset | sidebar.tsx | ✅ да | 2 | — |
| SidebarInput | sidebar.tsx | ✅ да | 0 | — |
| SidebarHeader | sidebar.tsx | ✅ да | 1 | — |
| SidebarFooter | sidebar.tsx | ✅ да | 1 | — |
| SidebarSeparator | sidebar.tsx | ✅ да | 0 | — |
| SidebarContent | sidebar.tsx | ✅ да | 1 | — |
| SidebarGroup | sidebar.tsx | ✅ да | 0 | — |
| SidebarGroupLabel | sidebar.tsx | ✅ да | 0 | — |
| SidebarGroupAction | sidebar.tsx | ✅ да | 0 | — |
| SidebarGroupContent | sidebar.tsx | ✅ да | 0 | — |
| SidebarMenu | sidebar.tsx | ✅ да | 1 | — |
| SidebarMenuItem | sidebar.tsx | ✅ да | 1 | — |
| SidebarMenuButton | sidebar.tsx | ✅ да | 1 | — |
| SidebarMenuAction | sidebar.tsx | ✅ да | 0 | — |
| SidebarMenuBadge | sidebar.tsx | ✅ да | 0 | — |
| SidebarMenuSkeleton | sidebar.tsx | ✅ да | 0 | — |
| SidebarMenuSub | sidebar.tsx | ✅ да | 0 | — |
| SidebarMenuSubItem | sidebar.tsx | ✅ да | 0 | — |
| SidebarMenuSubButton | sidebar.tsx | ✅ да | 0 | — |
| AppBreadcrumbs | breadcrumbs.tsx | ✅ да | 0 | канон |
| Breadcrumb07 | breadcrumbs.tsx | ❌ нет | 0 | — |
| NavigationMenu | navigation-menu.tsx | ✅ да | 0 | 0 usage |
| NavigationMenuList | navigation-menu.tsx | ✅ да | 0 | — |
| NavigationMenuItem | navigation-menu.tsx | ✅ да | 0 | — |
| NavigationMenuTrigger | navigation-menu.tsx | ✅ да | 0 | — |
| NavigationMenuContent | navigation-menu.tsx | ✅ да | 0 | — |
| NavigationMenuViewport | navigation-menu.tsx | ✅ да | 0 | — |
| NavigationMenuLink | navigation-menu.tsx | ✅ да | 0 | — |
| NavigationMenuIndicator | navigation-menu.tsx | ✅ да | 0 | — |
| MenuTriggerStyle | navigation-menu.tsx | ❌ нет | 0 | — |
| SidebarNavItem | sidebar-nav-item.tsx | ✅ да | 0 | обёртка |

### Overlap

В категории "Navigation / Tabs" обнаружено 44 компонентов. 6 из них — обёртки. 7 кандидатов на удаление. 

### Рекомендация

**Канон:** tabs.tsx#Tabs, sidebar.tsx#SidebarProvider, breadcrumbs.tsx#AppBreadcrumbs.
**Deprecated кандидаты:**
- workspace-tabs.tsx#WorkspaceTabs → обёртка над Tabs, TabsContent, TabsList, TabsTrigger
- workspace-tabs.tsx#WorkspaceTabsList → обёртка над Tabs, TabsContent, TabsList, TabsTrigger
- workspace-tabs.tsx#WorkspaceTabsTrigger → обёртка над Tabs, TabsContent, TabsList, TabsTrigger
- workspace-tabs.tsx#WorkspaceTabsContent → обёртка над Tabs, TabsContent, TabsList, TabsTrigger
- workspace-tabs.tsx#WorkspaceTabsFallback → обёртка над Tabs, TabsContent, TabsList, TabsTrigger
- navigation-menu.tsx#NavigationMenu → 0 usage
- sidebar-nav-item.tsx#SidebarNavItem → обёртка над SidebarMenuItem, SidebarMenuButton


### Файлы для миграции

- `features/projects/estimates/screens/EstimateDetailsShell.client.tsx`

---

## Категория 9: Overlay

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| Dialog | dialog.tsx | ✅ да | 8 | канон |
| DialogTrigger | dialog.tsx | ✅ да | 0 | Radix |
| DialogPortal | dialog.tsx | ✅ да | 0 | Radix |
| DialogClose | dialog.tsx | ✅ да | 0 | Radix |
| DialogOverlay | dialog.tsx | ✅ да | 0 | Radix |
| DialogContent | dialog.tsx | ✅ да | 8 | ✅ Radix |
| DialogHeader | dialog.tsx | ✅ да | 8 | ✅ Radix |
| DialogFooter | dialog.tsx | ✅ да | 7 | ✅ Radix |
| DialogTitle | dialog.tsx | ✅ да | 8 | ✅ Radix |
| DialogDescription | dialog.tsx | ✅ да | 7 | ✅ Radix |
| Drawer | drawer.tsx | ✅ да | 0 | 0 usage |
| DrawerTrigger | drawer.tsx | ✅ да | 0 | Radix |
| DrawerPortal | drawer.tsx | ✅ да | 0 | Radix |
| DrawerClose | drawer.tsx | ✅ да | 0 | Radix |
| DrawerOverlay | drawer.tsx | ✅ да | 0 | Radix |
| DrawerContent | drawer.tsx | ✅ да | 0 | Radix |
| DrawerHeader | drawer.tsx | ✅ да | 0 | Radix |
| DrawerFooter | drawer.tsx | ✅ да | 0 | Radix |
| DrawerTitle | drawer.tsx | ✅ да | 0 | Radix |
| DrawerDescription | drawer.tsx | ✅ да | 0 | Radix |
| Sheet | sheet.tsx | ✅ да | 4 | канон |
| SheetTrigger | sheet.tsx | ✅ да | 2 | ✅ Radix |
| SheetClose | sheet.tsx | ✅ да | 0 | Radix |
| SheetPortal | sheet.tsx | ❌ нет | 0 | Radix |
| SheetOverlay | sheet.tsx | ❌ нет | 0 | Radix |
| SheetContent | sheet.tsx | ✅ да | 4 | ✅ Radix |
| SheetHeader | sheet.tsx | ✅ да | 3 | ✅ Radix |
| SheetFooter | sheet.tsx | ✅ да | 1 | ✅ Radix |
| SheetTitle | sheet.tsx | ✅ да | 4 | ✅ Radix |
| SheetDescription | sheet.tsx | ✅ да | 3 | ✅ Radix |
| Popover | popover.tsx | ✅ да | 8 | канон |
| PopoverTrigger | popover.tsx | ✅ да | 8 | ✅ Radix |
| PopoverContent | popover.tsx | ✅ да | 8 | ✅ Radix |
| PopoverAnchor | popover.tsx | ✅ да | 0 | Radix |
| PopoverHeader | popover.tsx | ✅ да | 0 | Radix |
| PopoverTitle | popover.tsx | ✅ да | 0 | Radix |
| PopoverDescription | popover.tsx | ✅ да | 0 | Radix |
| HoverCard | hover-card.tsx | ✅ да | 0 | 0 usage |
| HoverCardTrigger | hover-card.tsx | ✅ да | 0 | Radix |
| HoverCardContent | hover-card.tsx | ✅ да | 0 | Radix |
| AlertDialog | alert-dialog.tsx | ✅ да | 8 | ✅ Radix |
| AlertDialogTrigger | alert-dialog.tsx | ✅ да | 4 | ✅ Radix |
| AlertDialogPortal | alert-dialog.tsx | ✅ да | 0 | Radix |
| AlertDialogOverlay | alert-dialog.tsx | ✅ да | 0 | Radix |
| AlertDialogContent | alert-dialog.tsx | ✅ да | 8 | ✅ Radix |
| AlertDialogHeader | alert-dialog.tsx | ✅ да | 8 | ✅ Radix |
| AlertDialogFooter | alert-dialog.tsx | ✅ да | 8 | ✅ Radix |
| AlertDialogTitle | alert-dialog.tsx | ✅ да | 8 | ✅ Radix |
| AlertDialogDescription | alert-dialog.tsx | ✅ да | 8 | ✅ Radix |
| AlertDialogMedia | alert-dialog.tsx | ✅ да | 0 | Radix |
| AlertDialogAction | alert-dialog.tsx | ✅ да | 8 | ✅ Radix |
| AlertDialogCancel | alert-dialog.tsx | ✅ да | 8 | ✅ Radix |
| TooltipProvider | tooltip.tsx | ✅ да | 2 | канон |
| Tooltip | tooltip.tsx | ✅ да | 7 | ✅ Radix |
| TooltipTrigger | tooltip.tsx | ✅ да | 7 | ✅ Radix |
| TooltipContent | tooltip.tsx | ✅ да | 7 | ✅ Radix |
| ContextMenu | context-menu.tsx | ✅ да | 0 | 0 usage |
| ContextMenuTrigger | context-menu.tsx | ✅ да | 0 | Radix |
| ContextMenuGroup | context-menu.tsx | ✅ да | 0 | Radix |
| ContextMenuPortal | context-menu.tsx | ✅ да | 0 | Radix |
| ContextMenuSub | context-menu.tsx | ✅ да | 0 | Radix |
| ContextMenuRadioGroup | context-menu.tsx | ✅ да | 0 | Radix |
| ContextMenuSubTrigger | context-menu.tsx | ✅ да | 0 | Radix |
| ContextMenuSubContent | context-menu.tsx | ✅ да | 0 | Radix |
| ContextMenuContent | context-menu.tsx | ✅ да | 0 | Radix |
| ContextMenuItem | context-menu.tsx | ✅ да | 0 | Radix |
| ContextMenuCheckboxItem | context-menu.tsx | ✅ да | 0 | Radix |
| ContextMenuRadioItem | context-menu.tsx | ✅ да | 0 | Radix |
| ContextMenuLabel | context-menu.tsx | ✅ да | 0 | Radix |
| ContextMenuSeparator | context-menu.tsx | ✅ да | 0 | Radix |
| ContextMenuShortcut | context-menu.tsx | ✅ да | 0 | Radix |
| Command | command.tsx | ✅ да | 7 | ✅ Radix |
| CommandDialog | command.tsx | ✅ да | 0 | Radix |
| CommandInput | command.tsx | ✅ да | 7 | ✅ Radix |
| CommandList | command.tsx | ✅ да | 7 | ✅ Radix |
| CommandEmpty | command.tsx | ✅ да | 7 | ✅ Radix |
| CommandGroup | command.tsx | ✅ да | 7 | ✅ Radix |
| CommandSeparator | command.tsx | ✅ да | 0 | Radix |
| CommandItem | command.tsx | ✅ да | 7 | ✅ Radix |
| CommandShortcut | command.tsx | ✅ да | 0 | Radix |
| Menubar | menubar.tsx | ✅ да | 0 | 0 usage |
| MenubarMenu | menubar.tsx | ✅ да | 0 | Radix |
| MenubarGroup | menubar.tsx | ✅ да | 0 | Radix |
| MenubarPortal | menubar.tsx | ✅ да | 0 | Radix |
| MenubarRadioGroup | menubar.tsx | ✅ да | 0 | Radix |
| MenubarTrigger | menubar.tsx | ✅ да | 0 | Radix |
| MenubarContent | menubar.tsx | ✅ да | 0 | Radix |
| MenubarItem | menubar.tsx | ✅ да | 0 | Radix |
| MenubarCheckboxItem | menubar.tsx | ✅ да | 0 | Radix |
| MenubarRadioItem | menubar.tsx | ✅ да | 0 | Radix |
| MenubarLabel | menubar.tsx | ✅ да | 0 | Radix |
| MenubarSeparator | menubar.tsx | ✅ да | 0 | Radix |
| MenubarShortcut | menubar.tsx | ✅ да | 0 | Radix |
| MenubarSub | menubar.tsx | ✅ да | 0 | Radix |
| MenubarSubTrigger | menubar.tsx | ✅ да | 0 | Radix |
| MenubarSubContent | menubar.tsx | ✅ да | 0 | Radix |

### Overlap

В категории "Overlay" обнаружено 96 компонентов. 9 из них — обёртки. 4 кандидатов на удаление. 

### Рекомендация

**Канон:** dialog.tsx#Dialog, sheet.tsx#Sheet, popover.tsx#Popover, tooltip.tsx#TooltipProvider.
**Deprecated кандидаты:**
- drawer.tsx#Drawer → 0 usage
- hover-card.tsx#HoverCard → 0 usage
- context-menu.tsx#ContextMenu → 0 usage
- menubar.tsx#Menubar → 0 usage


### Файлы для миграции
(empty)

---

## Категория 10: State / Loading

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| EmptyState | states/EmptyState.tsx | ✅ да | 2 | — |
| ErrorState | states/ErrorState.tsx | ✅ да | 4 | — |
| ForbiddenState | states/ForbiddenState.tsx | ✅ да | 2 | — |
| LoadingState | states/LoadingState.tsx | ✅ да | 9 | — |
| NoResultsState | states/NoResultsState.tsx | ✅ да | 2 | — |
| StateShell | states/StateShell.tsx | ✅ да | 0 | 0 usage |
| Spinner | spinner.tsx | ✅ да | 0 | 0 usage |
| Skeleton | skeleton.tsx | ✅ да | 2 | канон |
| LoadingIndicator | loading-indicator.tsx | ✅ да | 1 | — |
| TableEmptyState | table-empty-state.tsx | ✅ да | 5 | — |
| Empty | empty.tsx | ✅ да | 1 | — |
| EmptyHeader | empty.tsx | ✅ да | 1 | — |
| EmptyMedia | empty.tsx | ✅ да | 1 | — |
| EmptyTitle | empty.tsx | ✅ да | 1 | — |
| EmptyDescription | empty.tsx | ✅ да | 1 | — |
| EmptyContent | empty.tsx | ✅ да | 0 | 0 usage |

### Overlap

В категории "State / Loading" обнаружено 16 компонентов. 1 из них — обёртки. 3 кандидатов на удаление. 

### Рекомендация

**Канон:** skeleton.tsx#Skeleton.
**Deprecated кандидаты:**
- states/StateShell.tsx#StateShell → 0 usage
- spinner.tsx#Spinner → 0 usage
- empty.tsx#EmptyContent → 0 usage


### Файлы для миграции
(empty)

---

## Категория 11: Marketing

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| MarketingSkipLink | marketing-shell.tsx | ✅ да | 1 | канон |
| MarketingBrandLogo | marketing-shell.tsx | ✅ да | 1 | — |
| MarketingGradientOrbs | marketing-shell.tsx | ✅ да | 1 | — |
| MarketingHeader | marketing-shell.tsx | ✅ да | 1 | — |
| MarketingMobileMenu | marketing-shell.tsx | ✅ да | 1 | — |
| MarketingFooter | marketing-shell.tsx | ✅ да | 1 | — |
| MarketingPageShell | marketing-shell.tsx | ✅ да | 1 | — |
| MarketingSection | marketing-shell.tsx | ✅ да | 1 | — |
| MarketingHero | marketing-shell.tsx | ✅ да | 1 | — |
| MarketingCard | marketing-shell.tsx | ✅ да | 1 | — |
| MarketingCTA | marketing-shell.tsx | ✅ да | 1 | — |
| AuthShell | auth-shell.tsx | ✅ да | 2 | канон |
| AuthPanel | auth-shell.tsx | ✅ да | 1 | — |
| AuthFeatureCard | auth-shell.tsx | ✅ да | 0 | — |
| AuthStatusMessage | auth-shell.tsx | ✅ да | 5 | — |

### Overlap

В категории "Marketing" обнаружено 15 компонентов. 

### Рекомендация

**Канон:** marketing-shell.tsx#MarketingSkipLink, auth-shell.tsx#AuthShell.
Дублирования не обнаружено.

---

## Категория 12: Data Display

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| DirectoryIndexCell | cells/directory-table-cells.tsx | ✅ да | 1 | — |
| DirectoryTextCell | cells/directory-table-cells.tsx | ✅ да | 2 | — |
| DirectoryNameCell | cells/directory-table-cells.tsx | ✅ да | 3 | — |
| DirectoryCodeCell | cells/directory-table-cells.tsx | ✅ да | 1 | — |
| DirectoryBadgeCell | cells/directory-table-cells.tsx | ✅ да | 1 | — |
| DirectoryBadgeTrail | cells/directory-table-cells.tsx | ✅ да | 0 | 0 usage |
| DirectoryStackCell | cells/directory-table-cells.tsx | ✅ да | 1 | — |
| DirectoryCategoryCell | cells/directory-table-cells.tsx | ✅ да | 1 | — |
| DirectoryImageCell | cells/directory-table-cells.tsx | ✅ да | 1 | — |
| DirectoryActionsHeader | cells/directory-table-cells.tsx | ✅ да | 2 | — |
| DirectoryRowActionMenu | cells/directory-table-cells.tsx | ✅ да | 2 | — |
| EditableCell | cells/editable-cell.tsx | ✅ да | 3 | — |
| EstimateCodeCell | cells/estimate-table-cells.tsx | ✅ да | 1 | — |
| EstimateNameCellWrapper | cells/estimate-table-cells.tsx | ✅ да | 1 | — |
| EstimateUnitCell | cells/estimate-table-cells.tsx | ✅ да | 1 | — |
| EstimateNumberCell | cells/estimate-table-cells.tsx | ✅ да | 1 | — |
| EstimateSectionSumCell | cells/estimate-table-cells.tsx | ✅ да | 1 | — |
| EstimateSumCell | cells/estimate-table-cells.tsx | ✅ да | 1 | — |
| EstimateExpenseCell | cells/estimate-table-cells.tsx | ✅ да | 1 | — |
| ImageCell | cells/image-cell.tsx | ✅ да | 1 | — |
| MoneyCell | cells/money-cell.tsx | ✅ да | 7 | — |
| PlaceholderTextCell | cells/table-cell-helpers.tsx | ✅ да | 2 | — |
| PlaceholderNumberCell | cells/table-cell-helpers.tsx | ✅ да | 2 | — |
| FormattedCurrencyCell | cells/table-cell-helpers.tsx | ✅ да | 2 | — |
| CenteredUnitCell | cells/table-cell-helpers.tsx | ✅ да | 2 | — |

### Overlap

В категории "Data Display" обнаружено 25 компонентов. 1 кандидатов на удаление. 

### Рекомендация

**Канон:** (не указан).
**Deprecated кандидаты:**
- cells/directory-table-cells.tsx#DirectoryBadgeTrail → 0 usage


### Файлы для миграции
(empty)

---

## Категория 13: Containers / Helpers

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| Separator | separator.tsx | ✅ да | 4 | канон |
| ScrollArea | scroll-area.tsx | ✅ да | 5 | канон |
| ScrollBar | scroll-area.tsx | ✅ да | 0 | Radix |
| Accordion | accordion.tsx | ✅ да | 0 | канон |
| AccordionItem | accordion.tsx | ✅ да | 0 | Radix |
| AccordionTrigger | accordion.tsx | ✅ да | 0 | Radix |
| AccordionContent | accordion.tsx | ✅ да | 0 | Radix |
| Carousel | carousel.tsx | ✅ да | 0 | 0 usage |
| CarouselContent | carousel.tsx | ✅ да | 0 | Radix |
| CarouselItem | carousel.tsx | ✅ да | 0 | Radix |
| CarouselPrevious | carousel.tsx | ✅ да | 0 | Radix |
| CarouselNext | carousel.tsx | ✅ да | 0 | Radix |
| CarouselApi | carousel.tsx | ❌ нет | 0 | Radix |
| ResizablePanelGroup | resizable.tsx | ✅ да | 0 | Radix |
| ResizablePanel | resizable.tsx | ✅ да | 0 | 0 usage |
| ResizableHandle | resizable.tsx | ✅ да | 0 | Radix |
| Collapsible | collapsible.tsx | ✅ да | 0 | 0 usage |
| CollapsibleTrigger | collapsible.tsx | ✅ да | 0 | Radix |
| CollapsibleContent | collapsible.tsx | ✅ да | 0 | Radix |
| Progress | progress.tsx | ✅ да | 1 | ✅ Radix |
| Slider | slider.tsx | ✅ да | 0 | 0 usage |
| Switch | switch.tsx | ✅ да | 1 | ✅ Radix |
| Checkbox | checkbox.tsx | ✅ да | 0 | 0 usage |
| RadioGroup | radio-group.tsx | ✅ да | 2 | ✅ Radix |
| RadioGroupItem | radio-group.tsx | ✅ да | 2 | ✅ Radix |
| Calendar | calendar.tsx | ✅ да | 1 | ✅ Radix |
| CalendarDayButton | calendar.tsx | ✅ да | 0 | 0 usage |
| DatePickerCmp | date-picker.tsx | ❌ нет | 0 | обёртка |
| Avatar | avatar.tsx | ✅ да | 3 | ✅ Radix |
| AvatarImage | avatar.tsx | ✅ да | 0 | Radix |
| AvatarFallback | avatar.tsx | ✅ да | 3 | ✅ Radix |
| AvatarBadge | avatar.tsx | ✅ да | 0 | Radix |
| AvatarGroup | avatar.tsx | ✅ да | 0 | Radix |
| AvatarGroupCount | avatar.tsx | ✅ да | 0 | Radix |

### Overlap

В категории "Containers / Helpers" обнаружено 34 компонентов. 1 из них — обёртки. 7 кандидатов на удаление. 

### Рекомендация

**Канон:** separator.tsx#Separator, scroll-area.tsx#ScrollArea, accordion.tsx#Accordion.
**Deprecated кандидаты:**
- carousel.tsx#Carousel → 0 usage
- resizable.tsx#ResizablePanel → 0 usage
- collapsible.tsx#Collapsible → 0 usage
- slider.tsx#Slider → 0 usage
- checkbox.tsx#Checkbox → 0 usage
- calendar.tsx#CalendarDayButton → 0 usage
- date-picker.tsx#DatePickerCmp → обёртка над Calendar


### Файлы для миграции
(empty)

---

## Категория 14: Layout Constants (.ts files)

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| __file:primitive-surface.ts__ | primitive-surface.ts | ✅ да | 0 | константы |
| __file:primitive-spacing.ts__ | primitive-spacing.ts | ✅ да | 0 | константы |
| __file:primitive-density.ts__ | primitive-density.ts | ✅ да | 0 | константы |
| __file:primitive-controls.ts__ | primitive-controls.ts | ✅ да | 0 | константы |
| __file:primitive-navigation.ts__ | primitive-navigation.ts | ✅ да | 0 | константы |
| __file:primitive-table.ts__ | primitive-table.ts | ✅ да | 0 | константы |
| __file:primitive-badge.ts__ | primitive-badge.ts | ✅ да | 0 | константы |
| __file:primitive-form.ts__ | primitive-form.ts | ✅ да | 0 | константы |
| __file:primitive-overlay.ts__ | primitive-overlay.ts | ✅ да | 0 | константы |
| __file:primitive-chart.ts__ | primitive-chart.ts | ✅ да | 0 | константы |
| __file:primitive-marketing.ts__ | primitive-marketing.ts | ✅ да | 0 | константы |
| __file:dense-list/toolbar.ts__ | dense-list/toolbar.ts | ✅ да | 0 | константы |
| __file:dense-list/table.ts__ | dense-list/table.ts | ✅ да | 0 | константы |
| DenseListPickerButton | dense-list/pickers.tsx | ✅ да | 3 | — |

### Overlap

В категории "Layout Constants (.ts files)" обнаружено 1 компонентов. (13 файлов содержат только константы/типы.)

### Рекомендация

**Канон:** primitive-surface.ts#?, primitive-spacing.ts#?, primitive-density.ts#?, primitive-controls.ts#?, primitive-navigation.ts#?, primitive-table.ts#?, primitive-badge.ts#?, primitive-form.ts#?, primitive-overlay.ts#?, primitive-chart.ts#?, primitive-marketing.ts#?.
Дублирования не обнаружено.

---

## Категория 15: Inline Editors

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| __file:dense-list/inline-edit.ts__ | dense-list/inline-edit.ts | ✅ да | 0 | константы |

### Overlap

В категории "Inline Editors" обнаружено 0 компонентов. (1 файлов содержат только константы/типы.)

### Рекомендация

**Канон:** dense-list/inline-edit.ts#?.
Дублирования не обнаружено.

---

## Категория 16: Shells / Wrappers

### Компоненты

| Компонент | Файл | Экспортируется? | Usage (features/) | Overlap |
|---|---|---|---|---|
| DataTableShell | shells/data-table-shell.tsx | ✅ да | 2 | — |

### Overlap

В категории "Shells / Wrappers" обнаружено 1 компонентов. (1 файлов содержат только константы/типы.)

### Рекомендация

**Канон:** (не указан).
Дублирования не обнаружено.

---

## Summary

| Metric | Value |
|---|---|
| Categories with deprecated | 12 |
| Deprecated candidates | 61 |
| Total components scanned | 395 |
