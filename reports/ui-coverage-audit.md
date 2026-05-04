# UI Coverage Audit

This report is a refactor-stage coverage radar. It does not replace `audit:ui:visual`, Playwright smoke tests, accessibility tests, or manual UI review. It intentionally does not fail CI when coverage signals are found.

- Mode: report-only
- Strict requested: no
- Scanned files: 549
- Total findings: 94
- Bug candidates: 54

## Category counts

- state-surface-coverage: 7
- overlay-interaction-coverage: 12
- card-surface-coverage: 25
- icon-action-coverage: 43
- form-control-coverage: 1
- table-toolbar-coverage: 6

## Surface counts

- app: 11
- feature: 83

## Bug candidate counts

- P1: 1
- P2: 19
- P3: 0
- P4: 34

## Bug report candidates

### UI-COVERAGE-049 — P1 — Review UI coverage signals in features/settings/components/user-settings-page.tsx

- Surface: feature
- Findings: 10
- Severity: medium: 8, low: 2, high: 0
- Categories: card-surface-coverage: 8, icon-action-coverage: 2
- Recommended action: Create a follow-up UI bug/refactor ticket. This runtime surface has multiple medium coverage signals and should either gain a shared visual contract or targeted smoke/a11y coverage.

Sample evidence:
- `features/settings/components/user-settings-page.tsx:136` — card-surface-coverage / medium / `Card`
- `features/settings/components/user-settings-page.tsx:178` — icon-action-coverage / low / `Loader2`
- `features/settings/components/user-settings-page.tsx:190` — card-surface-coverage / medium / `Card`
- `features/settings/components/user-settings-page.tsx:201` — card-surface-coverage / medium / `CardContent`
- `features/settings/components/user-settings-page.tsx:270` — card-surface-coverage / medium / `Card`
- `features/settings/components/user-settings-page.tsx:325` — icon-action-coverage / low / `Loader2`
- `features/settings/components/user-settings-page.tsx:337` — card-surface-coverage / medium / `Card`
- `features/settings/components/user-settings-page.tsx:348` — card-surface-coverage / medium / `CardContent`

### UI-COVERAGE-015 — P2 — Review UI coverage signals in features/catalog/components/MaterialCatalogPicker.client.tsx

- Surface: feature
- Findings: 5
- Severity: medium: 4, low: 1, high: 0
- Categories: card-surface-coverage: 2, table-toolbar-coverage: 1, overlay-interaction-coverage: 1, icon-action-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/catalog/components/MaterialCatalogPicker.client.tsx:157` — card-surface-coverage / medium / `surface`
- `features/catalog/components/MaterialCatalogPicker.client.tsx:157` — table-toolbar-coverage / medium / `Toolbar`
- `features/catalog/components/MaterialCatalogPicker.client.tsx:157` — overlay-interaction-coverage / medium / `z-10`
- `features/catalog/components/MaterialCatalogPicker.client.tsx:187` — card-surface-coverage / medium / `panel`
- `features/catalog/components/MaterialCatalogPicker.client.tsx:326` — icon-action-coverage / low / `Plus`

### UI-COVERAGE-003 — P2 — Review UI coverage signals in app/page.tsx

- Surface: app
- Findings: 4
- Severity: medium: 4, high: 0, low: 0
- Categories: overlay-interaction-coverage: 3, card-surface-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `app/page.tsx:120` — overlay-interaction-coverage / medium / `z-50`
- `app/page.tsx:124` — overlay-interaction-coverage / medium / `z-40`
- `app/page.tsx:152` — card-surface-coverage / medium / `panel`
- `app/page.tsx:152` — overlay-interaction-coverage / medium / `z-50`

### UI-COVERAGE-022 — P2 — Review UI coverage signals in features/global-purchases/components/GlobalPurchasesToolbar.tsx

- Surface: feature
- Findings: 4
- Severity: low: 3, medium: 1, high: 0
- Categories: icon-action-coverage: 3, table-toolbar-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/global-purchases/components/GlobalPurchasesToolbar.tsx:60` — table-toolbar-coverage / medium / `Filter`
- `features/global-purchases/components/GlobalPurchasesToolbar.tsx:226` — icon-action-coverage / low / `Plus`
- `features/global-purchases/components/GlobalPurchasesToolbar.tsx:256` — icon-action-coverage / low / `MoreHorizontal`
- `features/global-purchases/components/GlobalPurchasesToolbar.tsx:269` — icon-action-coverage / low / `Plus`

### UI-COVERAGE-002 — P2 — Review UI coverage signals in app/globals.css

- Surface: app
- Findings: 3
- Severity: medium: 3, high: 0, low: 0
- Categories: overlay-interaction-coverage: 3
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `app/globals.css:158` — overlay-interaction-coverage / medium / `z-50`
- `app/globals.css:166` — overlay-interaction-coverage / medium / `backdrop-blur`
- `app/globals.css:170` — overlay-interaction-coverage / medium / `backdrop-blur`

### UI-COVERAGE-013 — P2 — Review UI coverage signals in features/auth/components/AuthFormShell.tsx

- Surface: feature
- Findings: 3
- Severity: medium: 3, high: 0, low: 0
- Categories: card-surface-coverage: 3
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/auth/components/AuthFormShell.tsx:45` — card-surface-coverage / medium / `Card`
- `features/auth/components/AuthFormShell.tsx:46` — card-surface-coverage / medium / `CardHeader`
- `features/auth/components/AuthFormShell.tsx:52` — card-surface-coverage / medium / `CardContent`

### UI-COVERAGE-014 — P2 — Review UI coverage signals in features/auth/components/LoginForm.tsx

- Surface: feature
- Findings: 3
- Severity: medium: 2, low: 1, high: 0
- Categories: overlay-interaction-coverage: 1, card-surface-coverage: 1, icon-action-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/auth/components/LoginForm.tsx:66` — overlay-interaction-coverage / medium / `z-50`
- `features/auth/components/LoginForm.tsx:131` — card-surface-coverage / medium / `CardHeader`
- `features/auth/components/LoginForm.tsx:251` — icon-action-coverage / low / `Loader2`

### UI-COVERAGE-031 — P2 — Review UI coverage signals in features/permissions/components/permissions-matrix.tsx

- Surface: feature
- Findings: 3
- Severity: medium: 3, high: 0, low: 0
- Categories: overlay-interaction-coverage: 2, table-toolbar-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/permissions/components/permissions-matrix.tsx:41` — table-toolbar-coverage / medium / `Table`
- `features/permissions/components/permissions-matrix.tsx:42` — overlay-interaction-coverage / medium / `z-20`
- `features/permissions/components/permissions-matrix.tsx:42` — overlay-interaction-coverage / medium / `backdrop-blur`

### UI-COVERAGE-051 — P2 — Review UI coverage signals in features/settings/screens/AdminSecuritySettingsScreen.tsx

- Surface: feature
- Findings: 3
- Severity: low: 2, medium: 1, high: 0
- Categories: icon-action-coverage: 2, card-surface-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/settings/screens/AdminSecuritySettingsScreen.tsx:30` — card-surface-coverage / medium / `Card`
- `features/settings/screens/AdminSecuritySettingsScreen.tsx:38` — icon-action-coverage / low / `Loader2`
- `features/settings/screens/AdminSecuritySettingsScreen.tsx:50` — icon-action-coverage / low / `Loader2`

### UI-COVERAGE-016 — P2 — Review UI coverage signals in features/catalog/components/WorkCatalogFilters.client.tsx

- Surface: feature
- Findings: 2
- Severity: medium: 2, high: 0, low: 0
- Categories: overlay-interaction-coverage: 2
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/catalog/components/WorkCatalogFilters.client.tsx:33` — overlay-interaction-coverage / medium / `backdrop-blur`
- `features/catalog/components/WorkCatalogFilters.client.tsx:33` — overlay-interaction-coverage / medium / `z-20`

### UI-COVERAGE-027 — P2 — Review UI coverage signals in features/guide/screens/GuideScreen.tsx

- Surface: feature
- Findings: 2
- Severity: medium: 2, high: 0, low: 0
- Categories: card-surface-coverage: 2
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/guide/screens/GuideScreen.tsx:19` — card-surface-coverage / medium / `Card`
- `features/guide/screens/GuideScreen.tsx:20` — card-surface-coverage / medium / `CardHeader`

### UI-COVERAGE-036 — P2 — Review UI coverage signals in features/projects/estimates/components/params/RoomsParamsTable.tsx

- Surface: feature
- Findings: 2
- Severity: medium: 2, high: 0, low: 0
- Categories: card-surface-coverage: 1, table-toolbar-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/projects/estimates/components/params/RoomsParamsTable.tsx:90` — card-surface-coverage / medium / `card`
- `features/projects/estimates/components/params/RoomsParamsTable.tsx:91` — table-toolbar-coverage / medium / `Table`

### UI-COVERAGE-038 — P2 — Review UI coverage signals in features/projects/estimates/components/table/EstimateCardsTable.tsx

- Surface: feature
- Findings: 2
- Severity: medium: 2, high: 0, low: 0
- Categories: card-surface-coverage: 2
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/projects/estimates/components/table/EstimateCardsTable.tsx:26` — card-surface-coverage / medium / `Surface`
- `features/projects/estimates/components/table/EstimateCardsTable.tsx:26` — card-surface-coverage / medium / `card`

### UI-COVERAGE-005 — P2 — Review UI coverage signals in features/_shared/directories/components/directory-sheet-form.tsx

- Surface: feature
- Findings: 1
- Severity: medium: 1, high: 0, low: 0
- Categories: form-control-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/_shared/directories/components/directory-sheet-form.tsx:44` — form-control-coverage / medium / `RadioGroup`

### UI-COVERAGE-010 — P2 — Review UI coverage signals in features/_shared/guide-catalog/components/CatalogToolbar.tsx

- Surface: feature
- Findings: 1
- Severity: medium: 1, high: 0, low: 0
- Categories: table-toolbar-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/_shared/guide-catalog/components/CatalogToolbar.tsx:76` — table-toolbar-coverage / medium / `Filter`

### UI-COVERAGE-019 — P2 — Review UI coverage signals in features/dashboard/components/HomeKpiCards.tsx

- Surface: feature
- Findings: 1
- Severity: medium: 1, high: 0, low: 0
- Categories: card-surface-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/dashboard/components/HomeKpiCards.tsx:42` — card-surface-coverage / medium / `kpi`

### UI-COVERAGE-020 — P2 — Review UI coverage signals in features/dashboard/components/SignalsSection.tsx

- Surface: feature
- Findings: 1
- Severity: medium: 1, high: 0, low: 0
- Categories: card-surface-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/dashboard/components/SignalsSection.tsx:29` — card-surface-coverage / medium / `Card`

### UI-COVERAGE-035 — P2 — Review UI coverage signals in features/projects/estimates/components/EstimateHeader.tsx

- Surface: feature
- Findings: 1
- Severity: medium: 1, high: 0, low: 0
- Categories: card-surface-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/projects/estimates/components/EstimateHeader.tsx:40` — card-surface-coverage / medium / `panel`

### UI-COVERAGE-037 — P2 — Review UI coverage signals in features/projects/estimates/components/params/RoomsParamsTotals.tsx

- Surface: feature
- Findings: 1
- Severity: medium: 1, high: 0, low: 0
- Categories: card-surface-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/projects/estimates/components/params/RoomsParamsTotals.tsx:51` — card-surface-coverage / medium / `Surface`

### UI-COVERAGE-048 — P2 — Review UI coverage signals in features/projects/list/components/projects-sort-select.tsx

- Surface: feature
- Findings: 1
- Severity: medium: 1, high: 0, low: 0
- Categories: table-toolbar-coverage: 1
- Recommended action: Review in the next UI audit batch. Normalize the local visual recipe or add explicit test coverage for the affected interaction/state surface.

Sample evidence:
- `features/projects/list/components/projects-sort-select.tsx:56` — table-toolbar-coverage / medium / `Filter`

### UI-COVERAGE-001 — P4 — Review UI coverage signals in app/(workspace)/app/loading.tsx

- Surface: app
- Findings: 4
- Severity: low: 4, high: 0, medium: 0
- Categories: state-surface-coverage: 4
- Recommended action: Keep as report-only evidence unless this surface starts producing route-level smoke errors or visual regressions.

Sample evidence:
- `app/(workspace)/app/loading.tsx:8` — state-surface-coverage / low / `Skeleton`
- `app/(workspace)/app/loading.tsx:10` — state-surface-coverage / low / `Skeleton`
- `app/(workspace)/app/loading.tsx:11` — state-surface-coverage / low / `Skeleton`
- `app/(workspace)/app/loading.tsx:12` — state-surface-coverage / low / `Skeleton`

### UI-COVERAGE-004 — P4 — Review UI coverage signals in features/_shared/directories/components/directory-list-screen.tsx

- Surface: feature
- Findings: 3
- Severity: low: 3, high: 0, medium: 0
- Categories: icon-action-coverage: 3
- Recommended action: Keep as report-only evidence unless this surface starts producing route-level smoke errors or visual regressions.

Sample evidence:
- `features/_shared/directories/components/directory-list-screen.tsx:99` — icon-action-coverage / low / `Plus`
- `features/_shared/directories/components/directory-list-screen.tsx:114` — icon-action-coverage / low / `Loader2`
- `features/_shared/directories/components/directory-list-screen.tsx:125` — icon-action-coverage / low / `Plus`

### UI-COVERAGE-007 — P4 — Review UI coverage signals in features/_shared/guide-catalog/components/CatalogScreenFallback.tsx

- Surface: feature
- Findings: 2
- Severity: low: 2, high: 0, medium: 0
- Categories: state-surface-coverage: 2
- Recommended action: Keep as report-only evidence unless this surface starts producing route-level smoke errors or visual regressions.

Sample evidence:
- `features/_shared/guide-catalog/components/CatalogScreenFallback.tsx:7` — state-surface-coverage / low / `Skeleton`
- `features/_shared/guide-catalog/components/CatalogScreenFallback.tsx:8` — state-surface-coverage / low / `Skeleton`

### UI-COVERAGE-026 — P4 — Review UI coverage signals in features/global-purchases/components/global-purchases-columns.tsx

- Surface: feature
- Findings: 2
- Severity: low: 2, high: 0, medium: 0
- Categories: icon-action-coverage: 2
- Recommended action: Keep as report-only evidence unless this surface starts producing route-level smoke errors or visual regressions.

Sample evidence:
- `features/global-purchases/components/global-purchases-columns.tsx:86` — icon-action-coverage / low / `Loader2`
- `features/global-purchases/components/global-purchases-columns.tsx:153` — icon-action-coverage / low / `Loader2`

### UI-COVERAGE-006 — P4 — Review UI coverage signals in features/_shared/guide-catalog/components/CatalogFilterSidebar.tsx

- Surface: feature
- Findings: 1
- Severity: low: 1, high: 0, medium: 0
- Categories: icon-action-coverage: 1
- Recommended action: Keep as report-only evidence unless this surface starts producing route-level smoke errors or visual regressions.

Sample evidence:
- `features/_shared/guide-catalog/components/CatalogFilterSidebar.tsx:88` — icon-action-coverage / low / `Icon`


## Findings

| Severity | Category | Location | Token |
| --- | --- | --- | --- |
| low | state-surface-coverage | `app/(workspace)/app/loading.tsx:8` | `Skeleton` |
| low | state-surface-coverage | `app/(workspace)/app/loading.tsx:10` | `Skeleton` |
| low | state-surface-coverage | `app/(workspace)/app/loading.tsx:11` | `Skeleton` |
| low | state-surface-coverage | `app/(workspace)/app/loading.tsx:12` | `Skeleton` |
| medium | overlay-interaction-coverage | `app/globals.css:158` | `z-50` |
| medium | overlay-interaction-coverage | `app/globals.css:166` | `backdrop-blur` |
| medium | overlay-interaction-coverage | `app/globals.css:170` | `backdrop-blur` |
| medium | overlay-interaction-coverage | `app/page.tsx:120` | `z-50` |
| medium | overlay-interaction-coverage | `app/page.tsx:124` | `z-40` |
| medium | card-surface-coverage | `app/page.tsx:152` | `panel` |
| medium | overlay-interaction-coverage | `app/page.tsx:152` | `z-50` |
| low | icon-action-coverage | `features/_shared/directories/components/directory-list-screen.tsx:99` | `Plus` |
| low | icon-action-coverage | `features/_shared/directories/components/directory-list-screen.tsx:114` | `Loader2` |
| low | icon-action-coverage | `features/_shared/directories/components/directory-list-screen.tsx:125` | `Plus` |
| medium | form-control-coverage | `features/_shared/directories/components/directory-sheet-form.tsx:44` | `RadioGroup` |
| low | icon-action-coverage | `features/_shared/guide-catalog/components/CatalogFilterSidebar.tsx:88` | `Icon` |
| low | state-surface-coverage | `features/_shared/guide-catalog/components/CatalogScreenFallback.tsx:7` | `Skeleton` |
| low | state-surface-coverage | `features/_shared/guide-catalog/components/CatalogScreenFallback.tsx:8` | `Skeleton` |
| low | icon-action-coverage | `features/_shared/guide-catalog/components/CatalogScreenShell.tsx:62` | `Loader2` |
| low | icon-action-coverage | `features/_shared/guide-catalog/components/CatalogTableWrapper.tsx:67` | `Plus` |
| medium | table-toolbar-coverage | `features/_shared/guide-catalog/components/CatalogToolbar.tsx:76` | `Filter` |
| low | icon-action-coverage | `features/admin/components/PricingSubmitButton.tsx:19` | `Loader2` |
| low | icon-action-coverage | `features/admin/components/impersonate-button.tsx:36` | `Loader2` |
| medium | card-surface-coverage | `features/auth/components/AuthFormShell.tsx:45` | `Card` |
| medium | card-surface-coverage | `features/auth/components/AuthFormShell.tsx:46` | `CardHeader` |
| medium | card-surface-coverage | `features/auth/components/AuthFormShell.tsx:52` | `CardContent` |
| medium | overlay-interaction-coverage | `features/auth/components/LoginForm.tsx:66` | `z-50` |
| medium | card-surface-coverage | `features/auth/components/LoginForm.tsx:131` | `CardHeader` |
| low | icon-action-coverage | `features/auth/components/LoginForm.tsx:251` | `Loader2` |
| medium | card-surface-coverage | `features/catalog/components/MaterialCatalogPicker.client.tsx:157` | `surface` |
| medium | table-toolbar-coverage | `features/catalog/components/MaterialCatalogPicker.client.tsx:157` | `Toolbar` |
| medium | overlay-interaction-coverage | `features/catalog/components/MaterialCatalogPicker.client.tsx:157` | `z-10` |
| medium | card-surface-coverage | `features/catalog/components/MaterialCatalogPicker.client.tsx:187` | `panel` |
| low | icon-action-coverage | `features/catalog/components/MaterialCatalogPicker.client.tsx:326` | `Plus` |
| medium | overlay-interaction-coverage | `features/catalog/components/WorkCatalogFilters.client.tsx:33` | `backdrop-blur` |
| medium | overlay-interaction-coverage | `features/catalog/components/WorkCatalogFilters.client.tsx:33` | `z-20` |
| low | icon-action-coverage | `features/catalog/components/WorkCatalogPicker.client.tsx:161` | `Plus` |
| low | icon-action-coverage | `features/counterparties/components/CreateCounterpartySheet.tsx:56` | `Loader2` |
| medium | card-surface-coverage | `features/dashboard/components/HomeKpiCards.tsx:42` | `kpi` |
| medium | card-surface-coverage | `features/dashboard/components/SignalsSection.tsx:29` | `Card` |
| low | icon-action-coverage | `features/global-purchases/components/GlobalPurchasesEmptyStateActions.tsx:22` | `Plus` |
| medium | table-toolbar-coverage | `features/global-purchases/components/GlobalPurchasesToolbar.tsx:60` | `Filter` |
| low | icon-action-coverage | `features/global-purchases/components/GlobalPurchasesToolbar.tsx:226` | `Plus` |
| low | icon-action-coverage | `features/global-purchases/components/GlobalPurchasesToolbar.tsx:256` | `MoreHorizontal` |
| low | icon-action-coverage | `features/global-purchases/components/GlobalPurchasesToolbar.tsx:269` | `Plus` |
| low | icon-action-coverage | `features/global-purchases/components/cards/GlobalPurchaseCard.tsx:58` | `Loader2` |
| low | icon-action-coverage | `features/global-purchases/components/cards/ProjectPicker.tsx:45` | `Loader2` |
| low | icon-action-coverage | `features/global-purchases/components/cards/SupplierPicker.tsx:50` | `Loader2` |
| low | icon-action-coverage | `features/global-purchases/components/global-purchases-columns.tsx:86` | `Loader2` |
| low | icon-action-coverage | `features/global-purchases/components/global-purchases-columns.tsx:153` | `Loader2` |
| medium | card-surface-coverage | `features/guide/screens/GuideScreen.tsx:19` | `Card` |
| medium | card-surface-coverage | `features/guide/screens/GuideScreen.tsx:20` | `CardHeader` |
| low | icon-action-coverage | `features/material-suppliers/components/CreateMaterialSupplierSheet.tsx:131` | `Loader2` |
| low | icon-action-coverage | `features/materials/components/MaterialsHeader.tsx:10` | `Loader2` |
| low | icon-action-coverage | `features/materials/components/columns.tsx:118` | `Settings` |
| medium | table-toolbar-coverage | `features/permissions/components/permissions-matrix.tsx:41` | `Table` |
| medium | overlay-interaction-coverage | `features/permissions/components/permissions-matrix.tsx:42` | `z-20` |
| medium | overlay-interaction-coverage | `features/permissions/components/permissions-matrix.tsx:42` | `backdrop-blur` |
| low | icon-action-coverage | `features/projects/dashboard/components/ProjectEstimatesCards.tsx:99` | `Plus` |
| low | icon-action-coverage | `features/projects/dashboard/components/ProjectReceiptsSection.tsx:207` | `Plus` |
| low | icon-action-coverage | `features/projects/estimates/components/CreateEstimateDialog.tsx:129` | `Loader2` |
| medium | card-surface-coverage | `features/projects/estimates/components/EstimateHeader.tsx:40` | `panel` |
| medium | card-surface-coverage | `features/projects/estimates/components/params/RoomsParamsTable.tsx:90` | `card` |
| medium | table-toolbar-coverage | `features/projects/estimates/components/params/RoomsParamsTable.tsx:91` | `Table` |
| medium | card-surface-coverage | `features/projects/estimates/components/params/RoomsParamsTotals.tsx:51` | `Surface` |
| medium | card-surface-coverage | `features/projects/estimates/components/table/EstimateCardsTable.tsx:26` | `Surface` |
| medium | card-surface-coverage | `features/projects/estimates/components/table/EstimateCardsTable.tsx:26` | `card` |
| low | icon-action-coverage | `features/projects/estimates/components/table/cards/EstimateMaterialCard.tsx:114` | `Settings` |
| low | icon-action-coverage | `features/projects/estimates/components/table/cards/EstimateSectionCard.tsx:92` | `Settings` |
| low | icon-action-coverage | `features/projects/estimates/components/table/cards/EstimateWorkCard.tsx:133` | `Settings` |
| low | icon-action-coverage | `features/projects/estimates/components/table/columns.tsx:212` | `Settings` |
| low | icon-action-coverage | `features/projects/estimates/components/tabs/EstimateParams.tsx:63` | `Plus` |
| low | icon-action-coverage | `features/projects/estimates/components/tabs/execution/EstimateExecutionAddExtraWorkSheet.tsx:52` | `Plus` |
| low | icon-action-coverage | `features/projects/list/components/create-project-dialog.tsx:272` | `Loader2` |
| low | icon-action-coverage | `features/projects/list/components/project-actions.tsx:50` | `Edit` |
| low | state-surface-coverage | `features/projects/list/components/projects-list.tsx:21` | `Empty` |
| medium | table-toolbar-coverage | `features/projects/list/components/projects-sort-select.tsx:56` | `Filter` |
| medium | card-surface-coverage | `features/settings/components/user-settings-page.tsx:136` | `Card` |
| low | icon-action-coverage | `features/settings/components/user-settings-page.tsx:178` | `Loader2` |
| medium | card-surface-coverage | `features/settings/components/user-settings-page.tsx:190` | `Card` |
