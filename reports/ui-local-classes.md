# UI Local Classes Fix Summary

- Status: fail
- Files to touch: 101
- Findings: 689
- High: 165
- Medium: 381
- Low: 143

## Fix order: files

| File | High | Medium | Low | Total |
| --- | ---: | ---: | ---: | ---: |
| `features/counterparties/components/counterparty-sheet-sections.tsx` | 31 | 20 | 0 | 51 |
| `app/page.tsx` | 22 | 10 | 35 | 67 |
| `features/permissions/components/permissions-matrix.tsx` | 14 | 19 | 4 | 37 |
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

## Fix order: buckets

| Bucket | Findings | Move to |
| --- | ---: | --- |
| control | 182 | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| dialog-sheet | 81 | shared/ui/dialog.tsx, shared/ui/sheet.tsx, or shared overlay semantic props |
| surface | 76 | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| table | 63 | shared/ui/data-table.tsx or shared/ui/table-density.tsx |
| card | 52 | shared/ui/card-shell.tsx, shared/ui/surface.tsx, or shared dashboard/card contracts |
| navigation | 50 | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| form | 48 | shared/ui/form-layout.tsx and shared form/control primitives |
| table-cell | 30 | shared/ui/cells/*, shared/ui/table-density.tsx, or shared table cell helpers |
| spacing | 29 | shared/ui/primitive-spacing.ts, shared/ui/primitive-density.ts, or component semantic density props |
| dashboard-chart | 21 | shared/ui/kpi-card.tsx, shared/ui/dashboard-layout.tsx, or shared/ui/dashboard-dynamics-chart.tsx |
| color | 21 | shared/ui primitive token, semantic variant/tone prop, or status/badge/card contract |
| layout | 19 | shared/ui/page-shell.tsx, shared/ui/section.tsx, or a narrower shared layout contract |

## High-priority examples

| Severity | Bucket | Location | Evidence | Move to |
| --- | --- | --- | --- | --- |
| high | navigation | `app/page.tsx:103` | `const navLinkClassNameBase = 'rounded-md transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60';` | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| high | navigation | `app/page.tsx:104` | `const headerNavLinkClassName = '${navLinkClassNameBase} px-3 py-2';` | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| high | navigation | `app/page.tsx:105` | `const footerNavLinkClassName = '${navLinkClassNameBase} px-2 py-1';` | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| high | surface | `app/page.tsx:120` | `<a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-black">` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | navigation | `app/page.tsx:124` | `<header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0A0F]">` | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| high | surface | `app/page.tsx:127` | `<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6A3D] text-black font-bold">S</div>` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | surface | `app/page.tsx:148` | `className="list-none rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:border-white/40 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 [&::-webkit-details-marker]:hidden"` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | navigation | `app/page.tsx:152` | `<div id="mobile-navigation-panel" className="absolute left-0 right-0 top-16 z-50 border-t border-white/10 bg-[#0B0A0F] shadow-2xl">` | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| high | form | `app/page.tsx:175` | `<div className={['absolute left-1/2 top-[-260px] h-[520px] w-[520px] -translate-x-1/2 rounded-full', primitiveMarketingGradientOrangeClassName, 'blur-2xl will-change-transform'].join(' ')} />` | shared/ui/form-layout.tsx and shared form/control primitives |
| high | form | `app/page.tsx:176` | `<div className={['absolute right-[-120px] top-[220px] h-[420px] w-[420px] rounded-full', primitiveMarketingGradientCyanClassName, 'blur-3xl will-change-transform'].join(' ')} />` | shared/ui/form-layout.tsx and shared form/control primitives |
| high | form | `app/page.tsx:177` | `<div className={['absolute left-[-160px] top-[520px] h-[380px] w-[380px] rounded-full', primitiveMarketingGradientPurpleClassName, 'blur-3xl will-change-transform'].join(' ')} />` | shared/ui/form-layout.tsx and shared form/control primitives |
| high | surface | `app/page.tsx:224` | `<div className="mt-4 inline-flex rounded-2xl bg-[#0B0A0F] px-3 py-1 text-2xl font-semibold text-white">84.3 млн ₽</div>` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | surface | `app/page.tsx:227` | `<div className="rounded-2xl border border-white/10 bg-[#111015] p-4">` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | surface | `app/page.tsx:233` | `<div className="rounded-2xl border border-white/10 bg-[#111015] p-4">` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | surface | `app/page.tsx:237` | `<div key={frame} className="relative h-20 rounded-xl border border-white/10 bg-linear-to-br from-white/10 to-transparent">` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | surface | `app/page.tsx:238` | `<span className="absolute left-2 top-2 rounded-full bg-[#0B0A0F] px-2 py-0.5 text-[10px] text-white">{frame}</span>` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | surface | `app/page.tsx:245` | `<div aria-hidden className="absolute -bottom-10 -left-6 h-20 w-40 rounded-full bg-[#B4FF7A]/40 blur-3xl animate-pulse" />` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | surface | `app/page.tsx:250` | `<MarketingSection id="capabilities" className="bg-[#0F0E14]">` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | surface | `app/page.tsx:296` | `<MarketingSection id="pricing" className="bg-[#0F0E14]">` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | surface | `app/page.tsx:309` | `? 'rounded-3xl border border-[#FF6A3D] bg-[#16131A] p-6 shadow-[0_30px_80px_rgba(255,106,61,0.2)]'` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | surface | `app/page.tsx:310` | `: 'rounded-3xl border border-white/10 bg-[#14121A] p-6'` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | surface | `app/page.tsx:349` | `<footer className="border-t border-white/10 bg-[#0B0A0F]">` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | control | `features/_shared/directories/components/directory-entity-sheet-shell.tsx:40` | `<SheetContent size="directory" layout="edge-to-edge" className={contentClassName}>` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/_shared/directories/components/directory-entity-sheet-shell.tsx:41` | `<SheetHeader className={directoryEntitySheetClassNames.header}>` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| high | control | `features/_shared/directories/components/directory-entity-sheet-shell.tsx:48` | `<ScrollArea className={directoryEntitySheetClassNames.scrollArea}>` | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |

Full machine-readable details: `reports/ui-local-classes.json`.
