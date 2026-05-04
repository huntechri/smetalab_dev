# UI Local Classes Fix Summary

- Status: fail
- Files to touch: 110
- Findings: 916
- High: 510
- Medium: 242
- Low: 164

## Fix order: files

| File | High | Medium | Low | Total |
| --- | ---: | ---: | ---: | ---: |
| `features/counterparties/components/counterparty-sheet-sections.tsx` | 52 | 0 | 0 | 52 |
| `features/projects/estimates/components/table/EstimateTableToolbar.tsx` | 37 | 0 | 0 | 37 |
| `app/page.tsx` | 32 | 5 | 35 | 72 |
| `features/projects/estimates/components/table/EstimateTableDialogs.tsx` | 31 | 0 | 0 | 31 |
| `features/projects/list/components/project-card.tsx` | 26 | 2 | 1 | 29 |
| `features/team/components/TeamMembersCard.tsx` | 20 | 1 | 0 | 21 |
| `features/projects/estimates/components/table/columns.tsx` | 19 | 0 | 0 | 19 |
| `features/global-purchases/components/global-purchases-columns.tsx` | 18 | 0 | 0 | 18 |
| `features/projects/estimates/components/table/cards/EstimateWorkCard.tsx` | 17 | 0 | 0 | 17 |
| `features/projects/dashboard/components/ProjectReceiptsSection.tsx` | 16 | 0 | 0 | 16 |
| `features/settings/components/user-settings-page.tsx` | 15 | 3 | 18 | 36 |
| `features/permissions/components/permissions-matrix.tsx` | 13 | 16 | 1 | 30 |
| `features/team/components/InviteTeamMemberCard.tsx` | 12 | 1 | 1 | 14 |
| `features/projects/estimates/components/table/cards/EstimateMaterialCard.tsx` | 12 | 0 | 0 | 12 |
| `features/projects/estimates/components/table/cards/EstimateSectionCard.tsx` | 12 | 0 | 0 | 12 |
| `features/dashboard/components/TeamWidgetSection.tsx` | 11 | 1 | 0 | 12 |
| `features/projects/estimates/components/params/RoomsParamsTable.tsx` | 10 | 0 | 0 | 10 |
| `features/projects/estimates/components/table/cards/actions.tsx` | 10 | 0 | 0 | 10 |
| `features/projects/list/components/create-project-dialog.tsx` | 10 | 0 | 0 | 10 |
| `features/projects/dashboard/components/ProjectEstimatesCards.tsx` | 8 | 0 | 0 | 8 |
| `features/catalog/components/MaterialCatalogPicker.client.tsx` | 7 | 21 | 4 | 32 |
| `features/counterparties/components/CreateCounterpartySheet.tsx` | 7 | 0 | 0 | 7 |
| `features/projects/estimates/components/registry/EstimatesListTable.tsx` | 7 | 0 | 0 | 7 |
| `features/patterns/screens/PatternsScreen.tsx` | 6 | 9 | 0 | 15 |
| `features/global-purchases/components/cards/ProjectPicker.tsx` | 6 | 0 | 0 | 6 |

## Fix order: buckets

| Bucket | Findings | Move to |
| --- | ---: | --- |
| table | 137 | shared/ui/data-table.tsx or shared/ui/table-density.tsx |
| dialog-sheet | 128 | shared/ui/dialog.tsx, shared/ui/sheet.tsx, or shared overlay semantic props |
| surface | 96 | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| card | 86 | shared/ui/card-shell.tsx, shared/ui/surface.tsx, or shared dashboard/card contracts |
| navigation | 85 | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| form | 71 | shared/ui/form-layout.tsx and shared form/control primitives |
| control | 59 | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| color | 53 | shared/ui primitive token, semantic variant/tone prop, or status/badge/card contract |
| table-cell | 52 | shared/ui/cells/*, shared/ui/table-density.tsx, or shared table cell helpers |
| spacing | 48 | shared/ui/primitive-spacing.ts, shared/ui/primitive-density.ts, or component semantic density props |
| dashboard-chart | 40 | shared/ui/kpi-card.tsx, shared/ui/dashboard-layout.tsx, or shared/ui/dashboard-dynamics-chart.tsx |
| layout | 31 | shared/ui/page-shell.tsx, shared/ui/section.tsx, or a narrower shared layout contract |

## High-priority examples

| Severity | Bucket | Location | Evidence | Move to |
| --- | --- | --- | --- | --- |
| high | dashboard-chart | `app/(admin)/dashboard/layout.tsx:30` | `<div className="flex h-14 items-center gap-4">` | shared/ui/kpi-card.tsx, shared/ui/dashboard-layout.tsx, or shared/ui/dashboard-dynamics-chart.tsx |
| high | dashboard-chart | `app/(admin)/dashboard/layout.tsx:32` | `<div className="flex-1">` | shared/ui/kpi-card.tsx, shared/ui/dashboard-layout.tsx, or shared/ui/dashboard-dynamics-chart.tsx |
| high | dashboard-chart | `app/(admin)/dashboard/layout.tsx:33` | `<span className="font-semibold text-lg">Admin Dashboard</span>` | shared/ui/kpi-card.tsx, shared/ui/dashboard-layout.tsx, or shared/ui/dashboard-dynamics-chart.tsx |
| high | dashboard-chart | `app/(admin)/dashboard/tenants/[tenantId]/page.tsx:63` | `<div className="flex items-center gap-4">` | shared/ui/kpi-card.tsx, shared/ui/dashboard-layout.tsx, or shared/ui/dashboard-dynamics-chart.tsx |
| high | table | `app/(admin)/dashboard/tenants/[tenantId]/page.tsx:66` | `<ArrowLeft className="size-5" />` | shared/ui/data-table.tsx or shared/ui/table-density.tsx |
| high | dashboard-chart | `app/(admin)/dashboard/tenants/[tenantId]/page.tsx:99` | `<div className="flex items-center gap-3">` | shared/ui/kpi-card.tsx, shared/ui/dashboard-layout.tsx, or shared/ui/dashboard-dynamics-chart.tsx |
| high | table | `app/(admin)/dashboard/tenants/page.tsx:45` | `<ArrowRight className="ml-2 size-3.5 transition-transform group-hover:translate-x-0.5" />` | shared/ui/data-table.tsx or shared/ui/table-density.tsx |
| high | table | `app/(admin)/page.tsx:35` | `<ArrowRight className="ml-2 size-5" />` | shared/ui/data-table.tsx or shared/ui/table-density.tsx |
| high | table | `app/(admin)/page.tsx:47` | `<ArrowRight className="ml-3 size-6" />` | shared/ui/data-table.tsx or shared/ui/table-density.tsx |
| high | card | `app/(login)/verify-email/page.tsx:24` | `<AuthPanel className="p-8 text-center">` | shared/ui/card-shell.tsx, shared/ui/surface.tsx, or shared dashboard/card contracts |
| high | surface | `app/api-docs/page.tsx:10` | `<div className="bg-white min-h-screen">` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | navigation | `app/page.tsx:103` | `const navLinkClassNameBase = 'rounded-md transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60';` | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| high | navigation | `app/page.tsx:104` | `const headerNavLinkClassName = '${navLinkClassNameBase} px-3 py-2';` | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| high | navigation | `app/page.tsx:105` | `const footerNavLinkClassName = '${navLinkClassNameBase} px-2 py-1';` | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| high | surface | `app/page.tsx:120` | `<a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-black">` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | navigation | `app/page.tsx:124` | `<header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0A0F]">` | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| high | surface | `app/page.tsx:125` | `<div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-8">` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | surface | `app/page.tsx:127` | `<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6A3D] text-black font-bold">S</div>` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | surface | `app/page.tsx:148` | `className="list-none rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:border-white/40 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 [&::-webkit-details-marker]:hidden"` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | navigation | `app/page.tsx:152` | `<div id="mobile-navigation-panel" className="absolute left-0 right-0 top-16 z-50 border-t border-white/10 bg-[#0B0A0F] shadow-2xl">` | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| high | surface | `app/page.tsx:153` | `<div className="container mx-auto flex flex-col gap-4 px-4 py-6">` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| high | form | `app/page.tsx:175` | `<div className={['absolute left-1/2 top-[-260px] h-[520px] w-[520px] -translate-x-1/2 rounded-full', primitiveMarketingGradientOrangeClassName, 'blur-2xl will-change-transform'].join(' ')} />` | shared/ui/form-layout.tsx and shared form/control primitives |
| high | form | `app/page.tsx:176` | `<div className={['absolute right-[-120px] top-[220px] h-[420px] w-[420px] rounded-full', primitiveMarketingGradientCyanClassName, 'blur-3xl will-change-transform'].join(' ')} />` | shared/ui/form-layout.tsx and shared form/control primitives |
| high | form | `app/page.tsx:177` | `<div className={['absolute left-[-160px] top-[520px] h-[380px] w-[380px] rounded-full', primitiveMarketingGradientPurpleClassName, 'blur-3xl will-change-transform'].join(' ')} />` | shared/ui/form-layout.tsx and shared form/control primitives |
| high | table | `app/page.tsx:194` | `<ArrowRight className="ml-2 h-5 w-5" />` | shared/ui/data-table.tsx or shared/ui/table-density.tsx |

Full machine-readable details: `reports/ui-local-classes.json`.
