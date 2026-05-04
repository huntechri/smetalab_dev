# UI Local Classes Fix Summary

- Status: fail
- Files to touch: 99
- Findings: 614
- High: 41
- Medium: 405
- Low: 168

## Fix order: files

| File | High | Medium | Low | Total |
| --- | ---: | ---: | ---: | ---: |
| `app/page.tsx` | 22 | 10 | 35 | 67 |
| `features/projects/estimates/components/registry/EstimateStatusMenu.tsx` | 4 | 0 | 0 | 4 |
| `features/permissions/components/permissions-matrix.tsx` | 3 | 17 | 5 | 25 |
| `features/auth/components/LoginForm.tsx` | 2 | 21 | 0 | 23 |
| `features/notifications/components/notification-item.tsx` | 2 | 2 | 1 | 5 |
| `features/catalog/components/MaterialCatalogPicker.client.tsx` | 1 | 14 | 10 | 25 |
| `features/patterns/screens/PatternsScreen.tsx` | 1 | 10 | 2 | 13 |
| `features/dashboard/components/TeamWidgetSection.tsx` | 1 | 8 | 0 | 9 |
| `features/projects/estimates/components/params/RoomsParamsTable.tsx` | 1 | 8 | 0 | 9 |
| `features/team/components/InviteTeamMemberCard.tsx` | 1 | 6 | 1 | 8 |
| `features/projects/estimates/components/params/RoomsParamsTotals.tsx` | 1 | 2 | 1 | 4 |
| `components/layout/app-sidebar.tsx` | 1 | 0 | 12 | 13 |
| `app/api-docs/page.tsx` | 1 | 0 | 0 | 1 |
| `features/projects/estimates/components/table/EstimateTableDialogs.tsx` | 0 | 27 | 0 | 27 |
| `features/counterparties/components/counterparty-sheet-sections.tsx` | 0 | 20 | 0 | 20 |
| `features/projects/list/components/project-card.tsx` | 0 | 14 | 1 | 15 |
| `features/team/components/TeamMembersCard.tsx` | 0 | 13 | 0 | 13 |
| `features/settings/components/user-settings-page.tsx` | 0 | 12 | 17 | 29 |
| `features/settings/screens/AdminSecuritySettingsScreen.tsx` | 0 | 10 | 1 | 11 |
| `features/global-purchases/components/global-purchases-columns.tsx` | 0 | 10 | 0 | 10 |
| `features/projects/list/components/create-project-dialog.tsx` | 0 | 10 | 0 | 10 |
| `features/projects/dashboard/components/ProjectReceiptsSection.tsx` | 0 | 8 | 0 | 8 |
| `features/projects/estimates/components/table/cards/EstimateWorkCard.tsx` | 0 | 8 | 0 | 8 |
| `features/works/components/UnitSelect.tsx` | 0 | 8 | 0 | 8 |
| `features/catalog/components/WorkCatalogPicker.client.tsx` | 0 | 7 | 5 | 12 |

## Fix order: buckets

| Bucket | Findings | Move to |
| --- | ---: | --- |
| surface | 89 | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
| dialog-sheet | 87 | shared/ui/dialog.tsx, shared/ui/sheet.tsx, or shared overlay semantic props |
| table | 71 | shared/ui/data-table.tsx or shared/ui/table-density.tsx |
| navigation | 57 | shared/ui/sidebar.tsx, shared/ui/page-shell.tsx, or shared navigation contracts |
| form | 51 | shared/ui/form-layout.tsx and shared form/control primitives |
| control | 51 | shared/ui/button.tsx, shared/ui/input.tsx, shared/ui/select.tsx, or shared/ui/search-control.tsx |
| card | 50 | shared/ui/card-shell.tsx, shared/ui/surface.tsx, or shared dashboard/card contracts |
| spacing | 33 | shared/ui/primitive-spacing.ts, shared/ui/primitive-density.ts, or component semantic density props |
| table-cell | 31 | shared/ui/cells/*, shared/ui/table-density.tsx, or shared table cell helpers |
| layout | 24 | shared/ui/page-shell.tsx, shared/ui/section.tsx, or a narrower shared layout contract |
| color | 23 | shared/ui primitive token, semantic variant/tone prop, or status/badge/card contract |
| dashboard-chart | 21 | shared/ui/kpi-card.tsx, shared/ui/dashboard-layout.tsx, or shared/ui/dashboard-dynamics-chart.tsx |

## High-priority examples

| Severity | Bucket | Location | Evidence | Move to |
| --- | --- | --- | --- | --- |
| high | surface | `app/api-docs/page.tsx:10` | `<div className="bg-white min-h-screen">` | shared/ui/surface.tsx or shared/ui/card-shell.tsx |
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
| high | form | `features/auth/components/LoginForm.tsx:66` | `className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground"` | shared/ui/form-layout.tsx and shared form/control primitives |
| high | badge-status | `features/auth/components/LoginForm.tsx:157` | `<AuthStatusMessage variant="warning" className="mb-4">` | shared/ui/badge.tsx or shared/ui/status-badge.tsx |

Full machine-readable details: `reports/ui-local-classes.json`.
