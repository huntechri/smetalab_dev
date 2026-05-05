# UI Local Classes Fix Summary

- Status: fail
- Files to touch: 101
- Findings: 586
- High: 98
- Medium: 351
- Low: 137

## Fix order: files

| File | High | Medium | Low | Total |
| --- | ---: | ---: | ---: | ---: |
| `features/projects/list/components/project-card.tsx` | 7 | 14 | 1 | 22 |
| `features/global-purchases/components/GlobalPurchasesToolbar.tsx` | 7 | 3 | 0 | 10 |
| `features/projects/estimates/components/table/EstimateTableDialogs.tsx` | 6 | 26 | 0 | 32 |
| `features/counterparties/components/CreateCounterpartySheet.tsx` | 5 | 5 | 0 | 10 |
| `features/projects/estimates/components/table/cards/EstimateWorkCard.tsx` | 4 | 8 | 0 | 12 |
| `features/projects/estimates/components/table/cards/EstimateSectionCard.tsx` | 4 | 6 | 0 | 10 |
| `features/admin/components/admin-user-menu.tsx` | 4 | 0 | 1 | 5 |
| `features/_shared/directories/components/directory-entity-sheet-shell.tsx` | 4 | 0 | 0 | 4 |
| `features/settings/components/user-settings-page.tsx` | 3 | 12 | 7 | 22 |
| `features/patterns/screens/PatternsScreen.tsx` | 3 | 10 | 2 | 15 |
| `features/projects/list/components/create-project-dialog.tsx` | 3 | 10 | 0 | 13 |
| `features/dashboard/components/TeamWidgetSection.tsx` | 3 | 8 | 0 | 11 |
| `features/permissions/components/PermissionLevelControl.tsx` | 3 | 6 | 0 | 9 |
| `features/catalog/components/MaterialCatalogPicker.client.tsx` | 2 | 13 | 10 | 25 |
| `features/global-purchases/components/global-purchases-columns.tsx` | 2 | 9 | 0 | 11 |
| `features/projects/dashboard/components/ProjectReceiptsSection.tsx` | 2 | 8 | 0 | 10 |
| `features/projects/estimates/components/params/RoomsParamsTable.tsx` | 2 | 8 | 0 | 10 |
| `features/notifications/components/notification-bell.tsx` | 2 | 5 | 0 | 7 |
| `features/projects/estimates/components/tabs/EstimateParams.tsx` | 2 | 4 | 0 | 6 |
| `features/team/screens/TeamScreen.tsx` | 2 | 4 | 0 | 6 |
| `features/_shared/guide-catalog/components/CatalogToolbar.tsx` | 2 | 1 | 4 | 7 |
| `features/_shared/guide-catalog/components/CatalogScreenFallback.tsx` | 2 | 0 | 4 | 6 |
| `features/_shared/directories/components/directory-sheet-form.tsx` | 2 | 0 | 0 | 2 |
| `features/_shared/guide-catalog/components/CatalogFilterSidebar.tsx` | 2 | 0 | 0 | 2 |
| `features/projects/estimates/components/table/cards/EstimateInlineNumberCell.tsx` | 2 | 0 | 0 | 2 |

## Fix order: buckets

| Bucket | Findings | Move to |
| --- | ---: | --- |
| control | 135 | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| dialog-sheet | 63 | shared/ui/dialog.tsx, shared/ui/sheet.tsx, or shared overlay semantic props |
| table | 58 | shared/ui/data-table.tsx or shared/ui/table-density.tsx |
| surface | 56 | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| card | 50 | shared/ui/card-shell.tsx, shared/ui/surface.tsx, or shared dashboard/card contracts |
| navigation | 45 | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| form | 43 | shared/ui/form-layout.tsx and shared form/control primitives |
| spacing | 29 | shared/ui/primitive-spacing.ts, shared/ui/primitive-density.ts, or component semantic density props |
| table-cell | 28 | shared/ui/cells/*, shared/ui/table-density.tsx, or shared table cell helpers |
| dashboard-chart | 21 | shared/ui/kpi-card.tsx, shared/ui/dashboard-layout.tsx, or shared/ui/dashboard-dynamics-chart.tsx |
| color | 21 | shared/ui primitive token, semantic variant/tone prop, or status/badge/card contract |
| layout | 20 | shared/ui/page-shell.tsx, shared/ui/section.tsx, or a narrower shared layout contract |

## High-priority examples

| Severity | Bucket | Location | Evidence | Move to |
| --- | --- | --- | --- | --- |
| high | control | `features/_shared/directories/components/directory-entity-sheet-shell.tsx:40` | `<SheetContent size="directory" layout="edge-to-edge" className={contentClassName}>` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/_shared/directories/components/directory-entity-sheet-shell.tsx:41` | `<SheetHeader className={directoryEntitySheetClassNames.header}>` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/_shared/directories/components/directory-entity-sheet-shell.tsx:48` | `<ScrollArea className={directoryEntitySheetClassNames.scrollArea}>` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/_shared/directories/components/directory-entity-sheet-shell.tsx:53` | `<SheetFooter className={directoryEntitySheetClassNames.footer}>` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/_shared/directories/components/directory-sheet-form.tsx:24` | `return <FormLabel className={directorySheetFormClassNames.label}>{children}</FormLabel>` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/_shared/directories/components/directory-sheet-form.tsx:44` | `<RadioGroup onValueChange={onValueChange} value={value} className={directorySheetFormClassNames.radioGroup}>` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/_shared/guide-catalog/components/CatalogFilterSidebar.tsx:56` | `<ScrollArea` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/_shared/guide-catalog/components/CatalogFilterSidebar.tsx:85` | `{separated ? <Separator className={catalogFilterSidebarClassNames.separator} /> : null}` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/_shared/guide-catalog/components/CatalogScreenFallback.tsx:7` | `<Skeleton className="h-8 w-48" />` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/_shared/guide-catalog/components/CatalogScreenFallback.tsx:8` | `<Skeleton className="h-12 w-full" />` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/_shared/guide-catalog/components/CatalogToolbar.tsx:79` | `<SheetContent side="left" className={catalogToolbarClassNames.sheet}>` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/_shared/guide-catalog/components/CatalogToolbar.tsx:80` | `<SheetHeader className={catalogToolbarClassNames.sheetHeader}>` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/admin/components/admin-user-menu.tsx:58` | `<DropdownMenuContent align="end" className="flex flex-col gap-1">` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/admin/components/admin-user-menu.tsx:59` | `<DropdownMenuItem className="cursor-pointer">` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/admin/components/admin-user-menu.tsx:65` | `<DropdownMenuItem className="cursor-pointer">` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/admin/components/admin-user-menu.tsx:71` | `<FormLayout action={handleSignOut} className="w-full">` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/auth/components/LoginForm.tsx:162` | `<FormLayout className={primitiveAuthFormGapClassName} action={formAction}>` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/catalog/components/MaterialCatalogDialog.client.tsx:45` | `<DialogHeader className="border-b p-4">` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/catalog/components/MaterialCatalogPicker.client.tsx:193` | `<ScrollArea className="h-full">` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | surface | `features/catalog/components/MaterialCatalogPicker.client.tsx:281` | `<div className={'relative flex size-9 sm:size-10 shrink-0 items-center justify-center overflow-hidden rounded-md ${primitiveSurfaceBorderClassNames.hairline}'}>` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | control | `features/counterparties/components/CreateCounterpartySheet.tsx:67` | `<Tabs defaultValue="general" className="w-full">` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/counterparties/components/CreateCounterpartySheet.tsx:68` | `<TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/counterparties/components/CreateCounterpartySheet.tsx:69` | `<TabsTrigger value="general" className="text-xs">` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/counterparties/components/CreateCounterpartySheet.tsx:72` | `<TabsTrigger value="details" className="text-xs">` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/counterparties/components/CreateCounterpartySheet.tsx:75` | `<TabsTrigger value="bank" className="text-xs">` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |

Full machine-readable details: `reports/ui-local-classes.json`.
