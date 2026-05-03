# UI Inventory Report

## Top summary
- real violations count: 0
- needs-review count: 13
- informational count: 740
- auto-fix candidates count: 0
- manual review count: 13

## UI source-of-truth matrix
| Component | components/ui | shared/ui | packages/ui / @repo/ui | Runtime imports | Status | Decision |
|---|---|---|---|---|---|---|
| Button | false | true | false | 79 | canonical | informational |
| Input | false | true | false | 28 | canonical | informational |
| Textarea | false | true | false | 3 | canonical | informational |
| Select | false | true | false | 3 | canonical | informational |
| Checkbox | false | true | false | 1 | canonical | informational |
| Switch | false | true | false | 3 | canonical | informational |
| Label | false | true | false | 13 | canonical | informational |
| Form | false | true | false | 5 | canonical | informational |
| Card | false | true | false | 15 | canonical | informational |
| Badge | false | true | false | 11 | canonical | informational |
| Table | false | true | false | 3 | canonical | informational |
| Dialog | false | true | false | 9 | canonical | informational |
| AlertDialog | false | true | false | 9 | canonical | informational |
| Sheet | false | true | false | 5 | canonical | informational |
| Popover | false | true | false | 9 | canonical | informational |
| DropdownMenu | false | true | false | 12 | canonical | informational |
| Tooltip | false | true | false | 12 | canonical | informational |
| Tabs | false | true | false | 6 | canonical | informational |
| Sidebar | false | true | false | 2 | canonical | informational |
| Skeleton | false | true | false | 9 | canonical | informational |
| LoadingState | false | true | false | 6 | canonical | informational |
| EmptyState | false | true | false | 3 | canonical | informational |
| ErrorState | false | true | false | 1 | canonical | informational |
| ForbiddenState | false | true | false | 2 | canonical | informational |
| StateShell | false | true | false | 2 | canonical | informational |

## Raw HTML classification (app/features)
- none

## Raw HTML classification (shared/ui)
- shared/ui/admin-surface.tsx: <form> => allowed
- shared/ui/admin-surface.tsx: <input> => allowed
- shared/ui/auto-form/index.tsx: <form> => allowed
- shared/ui/data-table.tsx: <button> => allowed
- shared/ui/data-table.tsx: <table> => allowed
- shared/ui/form-layout.tsx: <form> => allowed
- shared/ui/input.tsx: <input> => allowed
- shared/ui/sidebar.tsx: <button> => allowed
- shared/ui/switch.tsx: <input> => allowed
- shared/ui/table.tsx: <table> => allowed
- shared/ui/textarea.tsx: <textarea> => allowed

## Raw HTML classification (other)
- none

## Button/Input density table
- app/(admin)/dashboard/tenants/[tenantId]/page.tsx: <Button> size=* => default-control
- app/(admin)/dashboard/tenants/page.tsx: <Button> bare => default-control
- app/(admin)/page.tsx: <Button> size=* => default-control
- app/(login)/verify-email/page.tsx: <Button> size=* => compact-explicit
- app/not-found.tsx: <Button> size=* => compact-explicit
- app/page.tsx: <Button> size=* => compact-explicit
- components/layout/user-menu.tsx: <Button> size=* => unknown
- features/_shared/directories/components/directory-list-screen.tsx: <Button> size=* => compact-explicit
- features/_shared/guide-catalog/components/CatalogFilterSidebar.tsx: <Button> size=* => compact-explicit
- features/_shared/guide-catalog/components/CatalogScreenShell.tsx: <Input> size=* => compact-explicit
- features/_shared/guide-catalog/components/CatalogTableWrapper.tsx: <Button> bare => table-cell
- features/admin/components/PricingSubmitButton.tsx: <Button> bare => default-control
- features/admin/components/admin-user-menu.tsx: <Button> bare => default-control
- features/admin/components/impersonate-button.tsx: <Button> bare => default-control
- features/admin/components/impersonate-button.tsx: <Input> bare => default-control
- features/admin/components/stop-impersonation-button.tsx: <Button> bare => default-control
- features/auth/components/ForgotPasswordForm.tsx: <Button> bare => default-control
- features/auth/components/ForgotPasswordForm.tsx: <Input> bare => default-control
- features/auth/components/LoginForm.tsx: <Button> size=* => default-control
- features/auth/components/LoginForm.tsx: <Input> bare => default-control
- features/auth/components/ResetPasswordForm.tsx: <Button> bare => default-control
- features/auth/components/ResetPasswordForm.tsx: <Input> bare => default-control
- features/catalog/components/CatalogCategoryButton.tsx: <Button> size=* => compact-explicit
- features/catalog/components/MaterialCatalogPicker.client.tsx: <Button> size=* => compact-explicit
- features/catalog/components/WorkCatalogPicker.client.tsx: <Button> size=* => unknown
- features/counterparties/components/CreateCounterpartySheet.tsx: <Button> size=* => compact-explicit
- features/counterparties/components/counterparty-sheet-sections.tsx: <Input> size=* => compact-explicit
- features/dashboard/components/TeamWidgetSection.tsx: <Button> size=* => compact-explicit
- features/global-purchases/components/GlobalPurchasesImportExportActions.tsx: <Input> size=* => compact-explicit
- features/global-purchases/components/cards/DeletePurchaseAction.tsx: <Button> size=* => unknown
- features/global-purchases/components/global-purchases-columns.tsx: <Button> size=* => table-cell
- features/guide/screens/GuideScreen.tsx: <Button> size=* => compact-explicit
- features/material-suppliers/components/CreateMaterialSupplierSheet.tsx: <Button> size=* => compact-explicit
- features/material-suppliers/components/CreateMaterialSupplierSheet.tsx: <Input> size=* => compact-explicit
- features/materials/components/MaterialsEditDialog.tsx: <Button> bare => default-control
- features/materials/components/MaterialsEditDialog.tsx: <Input> bare => default-control
- features/materials/components/MaterialsSidebar.tsx: <Button> size=* => unknown
- features/materials/components/columns.tsx: <Button> size=* => table-cell
- features/notifications/components/notification-bell.tsx: <Button> size=* => compact-explicit
- features/notifications/components/notification-item.tsx: <Button> size=* => compact-explicit
- features/patterns/screens/PatternsScreen.tsx: <Button> size=* => compact-explicit
- features/permissions/components/PermissionLevelControl.tsx: <Button> size=* => unknown
- features/projects/dashboard/components/ProjectEstimatesCards.tsx: <Button> size=* => compact-explicit
- features/projects/dashboard/components/ProjectEstimatesSection.tsx: <Button> size=* => compact-explicit
- features/projects/dashboard/components/ProjectReceiptsSection.tsx: <Button> size=* => compact-explicit
- features/projects/dashboard/components/ProjectReceiptsSection.tsx: <Input> size=* => compact-explicit
- features/projects/estimates/components/CreateEstimateDialog.tsx: <Button> bare => default-control
- features/projects/estimates/components/CreateEstimateDialog.tsx: <Input> bare => default-control
- features/projects/estimates/components/EstimateHeader.tsx: <Button> size=* => unknown
- features/projects/estimates/components/params/RoomsParamsTable.tsx: <Button> size=* => table-cell
- features/projects/estimates/components/params/RoomsParamsTable.tsx: <Input> bare => table-cell
- features/projects/estimates/components/registry/EstimateStatusMenu.tsx: <Button> size=* => unknown
- features/projects/estimates/components/registry/EstimatesListTable.tsx: <Button> size=* => table-cell
- features/projects/estimates/components/table/EstimateTable.client.tsx: <Button> bare => table-cell
- features/projects/estimates/components/table/EstimateTableDialogs.tsx: <Button> size=* => default-control
- features/projects/estimates/components/table/EstimateTableDialogs.tsx: <Input> bare => default-control
- features/projects/estimates/components/table/cards/EstimateInlineNumberCell.tsx: <Button> bare => table-cell
- features/projects/estimates/components/table/cards/EstimateInlineNumberCell.tsx: <Input> size=* => compact-explicit
- features/projects/estimates/components/table/cards/EstimateInlineTextCell.tsx: <Button> bare => table-cell
- features/projects/estimates/components/table/cards/EstimateInlineTextCell.tsx: <Input> size=* => compact-explicit
- features/projects/estimates/components/table/cards/EstimateMaterialCard.tsx: <Button> size=* => table-cell
- features/projects/estimates/components/table/cards/EstimateSectionCard.tsx: <Button> size=* => table-cell
- features/projects/estimates/components/table/cards/EstimateWorkCard.tsx: <Button> size=* => compact-explicit
- features/projects/estimates/components/table/columns.tsx: <Button> size=* => table-cell
- features/projects/estimates/components/tabs/execution/EstimateExecutionAddExtraWorkSheet.tsx: <Button> size=* => compact-explicit
- features/projects/list/components/create-project-dialog.tsx: <Button> size=* => default-control
- features/projects/list/components/create-project-dialog.tsx: <Input> bare => default-control
- features/projects/list/components/project-actions.tsx: <Button> size=* => unknown
- features/projects/list/components/projects-sort-select.tsx: <Button> size=* => compact-explicit
- features/projects/list/components/projects-toolbar.tsx: <Button> bare => toolbar-action
- features/settings/components/user-settings-page.tsx: <Button> bare => default-control
- features/settings/components/user-settings-page.tsx: <Input> bare => default-control
- features/settings/screens/AdminGeneralSettingsScreen.tsx: <Button> bare => default-control
- features/settings/screens/AdminGeneralSettingsScreen.tsx: <Input> bare => default-control
- features/settings/screens/AdminSecuritySettingsScreen.tsx: <Button> bare => default-control
- features/settings/screens/AdminSecuritySettingsScreen.tsx: <Input> bare => default-control
- features/team/components/InviteTeamMemberCard.tsx: <Button> size=* => compact-explicit
- features/team/components/InviteTeamMemberCard.tsx: <Input> size=* => compact-explicit
- features/team/components/TeamMembersCard.tsx: <Button> size=* => compact-explicit
- features/works/components/UnitSelect.tsx: <Button> size=* => compact-explicit
- features/works/components/WorksEditDialog.tsx: <Button> bare => default-control
- features/works/components/WorksEditDialog.tsx: <Input> bare => default-control
- features/works/components/columns.tsx: <Button> bare => table-cell
- shared/ui/action-menu.tsx: <Button> size=* => compact-explicit
- shared/ui/admin-surface.tsx: <Button> size=* => compact-explicit
- shared/ui/alert-dialog.tsx: <Button> size=* => default-control
- shared/ui/auto-form/fields/array.tsx: <Button> size=* => default-control
- shared/ui/auto-form/fields/input.tsx: <Input> bare => default-control
- shared/ui/auto-form/fields/number.tsx: <Input> bare => default-control
- shared/ui/auto-form/index.tsx: <Button> bare => default-control
- shared/ui/calendar.tsx: <Button> size=* => unknown
- shared/ui/carousel.tsx: <Button> size=* => unknown
- shared/ui/cells/editable-cell.tsx: <Button> bare => table-cell
- shared/ui/cells/editable-cell.tsx: <Input> bare => table-cell
- shared/ui/cells/table-cell-helpers.tsx: <Input> bare => table-cell
- shared/ui/dashboard-dynamics-chart.tsx: <Button> bare => compact-candidate
- shared/ui/date-picker.tsx: <Button> size=* => compact-explicit
- shared/ui/dense-list/pickers.tsx: <Button> size=* => compact-explicit
- shared/ui/dialog.tsx: <Button> bare => default-control
- shared/ui/estimate-tab.tsx: <Input> size=* => compact-explicit
- shared/ui/input-group.tsx: <Button> size=* => compact-explicit
- shared/ui/input-group.tsx: <Input> size=* => compact-explicit
- shared/ui/search-control.tsx: <Button> size=* => unknown
- shared/ui/search-input.tsx: <Input> size=* => compact-explicit
- shared/ui/sidebar.tsx: <Button> size=* => unknown
- shared/ui/sidebar.tsx: <Input> bare => compact-candidate
- shared/ui/table-actions.tsx: <Button> size=* => table-cell
- shared/ui/toolbar-button.tsx: <Button> size=* => toolbar-action

## Density markers count/details
- count: 108
- app/(admin)/dashboard/tenants/[tenantId]/page.tsx: size=*
- app/(admin)/dashboard/tenants/page.tsx: bare
- app/(admin)/page.tsx: size=*
- app/(login)/verify-email/page.tsx: size=*
- app/not-found.tsx: size=*
- app/page.tsx: size=*
- components/layout/user-menu.tsx: size=*
- features/_shared/directories/components/directory-list-screen.tsx: size=*
- features/_shared/guide-catalog/components/CatalogFilterSidebar.tsx: size=*
- features/_shared/guide-catalog/components/CatalogScreenShell.tsx: size=*
- features/_shared/guide-catalog/components/CatalogTableWrapper.tsx: bare
- features/admin/components/PricingSubmitButton.tsx: bare
- features/admin/components/admin-user-menu.tsx: bare
- features/admin/components/impersonate-button.tsx: bare
- features/admin/components/impersonate-button.tsx: bare
- features/admin/components/stop-impersonation-button.tsx: bare
- features/auth/components/ForgotPasswordForm.tsx: bare
- features/auth/components/ForgotPasswordForm.tsx: bare
- features/auth/components/LoginForm.tsx: size=*
- features/auth/components/LoginForm.tsx: bare
- features/auth/components/ResetPasswordForm.tsx: bare
- features/auth/components/ResetPasswordForm.tsx: bare
- features/catalog/components/CatalogCategoryButton.tsx: size=*
- features/catalog/components/MaterialCatalogPicker.client.tsx: size=*
- features/catalog/components/WorkCatalogPicker.client.tsx: size=*
- features/counterparties/components/CreateCounterpartySheet.tsx: size=*
- features/counterparties/components/counterparty-sheet-sections.tsx: size=*
- features/dashboard/components/TeamWidgetSection.tsx: size=*
- features/global-purchases/components/GlobalPurchasesImportExportActions.tsx: size=*
- features/global-purchases/components/cards/DeletePurchaseAction.tsx: size=*
- features/global-purchases/components/global-purchases-columns.tsx: size=*
- features/guide/screens/GuideScreen.tsx: size=*
- features/material-suppliers/components/CreateMaterialSupplierSheet.tsx: size=*
- features/material-suppliers/components/CreateMaterialSupplierSheet.tsx: size=*
- features/materials/components/MaterialsEditDialog.tsx: bare
- features/materials/components/MaterialsEditDialog.tsx: bare
- features/materials/components/MaterialsSidebar.tsx: size=*
- features/materials/components/columns.tsx: size=*
- features/notifications/components/notification-bell.tsx: size=*
- features/notifications/components/notification-item.tsx: size=*
- features/patterns/screens/PatternsScreen.tsx: size=*
- features/permissions/components/PermissionLevelControl.tsx: size=*
- features/projects/dashboard/components/ProjectEstimatesCards.tsx: size=*
- features/projects/dashboard/components/ProjectEstimatesSection.tsx: size=*
- features/projects/dashboard/components/ProjectReceiptsSection.tsx: size=*
- features/projects/dashboard/components/ProjectReceiptsSection.tsx: size=*
- features/projects/estimates/components/CreateEstimateDialog.tsx: bare
- features/projects/estimates/components/CreateEstimateDialog.tsx: bare
- features/projects/estimates/components/EstimateHeader.tsx: size=*
- features/projects/estimates/components/params/RoomsParamsTable.tsx: size=*
- features/projects/estimates/components/params/RoomsParamsTable.tsx: bare
- features/projects/estimates/components/registry/EstimateStatusMenu.tsx: size=*
- features/projects/estimates/components/registry/EstimatesListTable.tsx: size=*
- features/projects/estimates/components/table/EstimateTable.client.tsx: bare
- features/projects/estimates/components/table/EstimateTableDialogs.tsx: size=*
- features/projects/estimates/components/table/EstimateTableDialogs.tsx: bare
- features/projects/estimates/components/table/cards/EstimateInlineNumberCell.tsx: bare
- features/projects/estimates/components/table/cards/EstimateInlineNumberCell.tsx: size=*
- features/projects/estimates/components/table/cards/EstimateInlineTextCell.tsx: bare
- features/projects/estimates/components/table/cards/EstimateInlineTextCell.tsx: size=*
- features/projects/estimates/components/table/cards/EstimateMaterialCard.tsx: size=*
- features/projects/estimates/components/table/cards/EstimateSectionCard.tsx: size=*
- features/projects/estimates/components/table/cards/EstimateWorkCard.tsx: size=*
- features/projects/estimates/components/table/columns.tsx: size=*
- features/projects/estimates/components/tabs/execution/EstimateExecutionAddExtraWorkSheet.tsx: size=*
- features/projects/list/components/create-project-dialog.tsx: size=*
- features/projects/list/components/create-project-dialog.tsx: bare
- features/projects/list/components/project-actions.tsx: size=*
- features/projects/list/components/projects-sort-select.tsx: size=*
- features/projects/list/components/projects-toolbar.tsx: bare
- features/settings/components/user-settings-page.tsx: bare
- features/settings/components/user-settings-page.tsx: bare
- features/settings/screens/AdminGeneralSettingsScreen.tsx: bare
- features/settings/screens/AdminGeneralSettingsScreen.tsx: bare
- features/settings/screens/AdminSecuritySettingsScreen.tsx: bare
- features/settings/screens/AdminSecuritySettingsScreen.tsx: bare
- features/team/components/InviteTeamMemberCard.tsx: size=*
- features/team/components/InviteTeamMemberCard.tsx: size=*
- features/team/components/TeamMembersCard.tsx: size=*
- features/works/components/UnitSelect.tsx: size=*
- features/works/components/WorksEditDialog.tsx: bare
- features/works/components/WorksEditDialog.tsx: bare
- features/works/components/columns.tsx: bare
- shared/ui/action-menu.tsx: size=*
- shared/ui/admin-surface.tsx: size=*
- shared/ui/alert-dialog.tsx: size=*
- shared/ui/auto-form/fields/array.tsx: size=*
- shared/ui/auto-form/fields/input.tsx: bare
- shared/ui/auto-form/fields/number.tsx: bare
- shared/ui/auto-form/index.tsx: bare
- shared/ui/calendar.tsx: size=*
- shared/ui/carousel.tsx: size=*
- shared/ui/cells/editable-cell.tsx: bare
- shared/ui/cells/editable-cell.tsx: bare
- shared/ui/cells/table-cell-helpers.tsx: bare
- shared/ui/dashboard-dynamics-chart.tsx: bare
- shared/ui/date-picker.tsx: size=*
- shared/ui/dense-list/pickers.tsx: size=*
- shared/ui/dialog.tsx: bare
- shared/ui/estimate-tab.tsx: size=*
- shared/ui/input-group.tsx: size=*
- shared/ui/input-group.tsx: size=*
- shared/ui/search-control.tsx: size=*
- shared/ui/search-input.tsx: size=*
- shared/ui/sidebar.tsx: size=*
- shared/ui/sidebar.tsx: bare
- shared/ui/table-actions.tsx: size=*
- shared/ui/toolbar-button.tsx: size=*

## Auto-fix candidates
- none
- reason: classification-first mode; fix-safe disabled

## Unknown density surfaces require manual review before #243 auto-fix
- components/layout/user-menu.tsx: <Button>
- features/catalog/components/WorkCatalogPicker.client.tsx: <Button>
- features/global-purchases/components/cards/DeletePurchaseAction.tsx: <Button>
- features/materials/components/MaterialsSidebar.tsx: <Button>
- features/permissions/components/PermissionLevelControl.tsx: <Button>
- features/projects/estimates/components/EstimateHeader.tsx: <Button>
- features/projects/estimates/components/registry/EstimateStatusMenu.tsx: <Button>
- features/projects/list/components/project-actions.tsx: <Button>
- shared/ui/calendar.tsx: <Button>
- shared/ui/carousel.tsx: <Button>
- shared/ui/search-control.tsx: <Button>
- shared/ui/sidebar.tsx: <Button>
