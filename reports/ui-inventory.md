# UI Inventory Report

## Top summary
- real violations count: 0
- needs-review count: 58
- informational count: 695
- auto-fix candidates count: 0
- manual review count: 58

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
- features/admin/components/admin-user-menu.tsx: <form> => needs-review
- features/admin/components/impersonate-button.tsx: <form> => needs-review
- features/auth/components/ForgotPasswordForm.tsx: <form> => needs-review
- features/auth/components/LoginForm.tsx: <form> => needs-review
- features/auth/components/ResetPasswordForm.tsx: <form> => needs-review
- features/counterparties/components/CreateCounterpartySheet.tsx: <form> => needs-review
- features/material-suppliers/components/CreateMaterialSupplierSheet.tsx: <form> => needs-review
- features/projects/estimates/components/CreateEstimateDialog.tsx: <form> => needs-review
- features/settings/screens/AdminGeneralSettingsScreen.tsx: <form> => needs-review
- features/settings/screens/AdminSecuritySettingsScreen.tsx: <form> => needs-review
- features/team/components/InviteTeamMemberCard.tsx: <form> => needs-review

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
- app/(admin)/dashboard/tenants/[tenantId]/page.tsx: <Button> bare => default-control
- app/(admin)/dashboard/tenants/page.tsx: <Button> bare => default-control
- app/(admin)/page.tsx: <Button> bare => default-control
- app/(login)/verify-email/page.tsx: <Button> bare => unknown
- app/not-found.tsx: <Button> bare => unknown
- app/page.tsx: <Button> bare => unknown
- components/layout/user-menu.tsx: <Button> bare => unknown
- features/_shared/directories/components/directory-list-screen.tsx: <Button> bare => unknown
- features/_shared/guide-catalog/components/CatalogFilterSidebar.tsx: <Button> bare => unknown
- features/_shared/guide-catalog/components/CatalogScreenShell.tsx: <Input> bare => unknown
- features/_shared/guide-catalog/components/CatalogTableWrapper.tsx: <Button> bare => table-cell
- features/admin/components/PricingSubmitButton.tsx: <Button> bare => default-control
- features/admin/components/admin-user-menu.tsx: <Button> bare => default-control
- features/admin/components/impersonate-button.tsx: <Button> bare => default-control
- features/admin/components/impersonate-button.tsx: <Input> bare => default-control
- features/admin/components/stop-impersonation-button.tsx: <Button> bare => default-control
- features/auth/components/ForgotPasswordForm.tsx: <Button> bare => default-control
- features/auth/components/ForgotPasswordForm.tsx: <Input> bare => default-control
- features/auth/components/LoginForm.tsx: <Button> bare => default-control
- features/auth/components/LoginForm.tsx: <Input> bare => default-control
- features/auth/components/ResetPasswordForm.tsx: <Button> bare => default-control
- features/auth/components/ResetPasswordForm.tsx: <Input> bare => default-control
- features/catalog/components/CatalogCategoryButton.tsx: <Button> bare => unknown
- features/catalog/components/MaterialCatalogPicker.client.tsx: <Button> bare => unknown
- features/catalog/components/WorkCatalogPicker.client.tsx: <Button> bare => unknown
- features/counterparties/components/CreateCounterpartySheet.tsx: <Button> bare => unknown
- features/counterparties/components/counterparty-sheet-sections.tsx: <Input> bare => unknown
- features/dashboard/components/TeamWidgetSection.tsx: <Button> bare => unknown
- features/global-purchases/components/GlobalPurchasesImportExportActions.tsx: <Input> bare => unknown
- features/global-purchases/components/cards/DeletePurchaseAction.tsx: <Button> bare => unknown
- features/global-purchases/components/global-purchases-columns.tsx: <Button> bare => table-cell
- features/guide/screens/GuideScreen.tsx: <Button> bare => unknown
- features/material-suppliers/components/CreateMaterialSupplierSheet.tsx: <Button> bare => unknown
- features/material-suppliers/components/CreateMaterialSupplierSheet.tsx: <Input> bare => unknown
- features/materials/components/MaterialsEditDialog.tsx: <Button> bare => default-control
- features/materials/components/MaterialsEditDialog.tsx: <Input> bare => default-control
- features/materials/components/MaterialsSidebar.tsx: <Button> bare => unknown
- features/materials/components/columns.tsx: <Button> bare => table-cell
- features/notifications/components/notification-bell.tsx: <Button> bare => unknown
- features/notifications/components/notification-item.tsx: <Button> bare => unknown
- features/patterns/screens/PatternsScreen.tsx: <Button> bare => unknown
- features/permissions/components/PermissionLevelControl.tsx: <Button> bare => unknown
- features/projects/dashboard/components/ProjectEstimatesCards.tsx: <Button> bare => unknown
- features/projects/dashboard/components/ProjectEstimatesSection.tsx: <Button> bare => unknown
- features/projects/dashboard/components/ProjectReceiptsSection.tsx: <Button> bare => unknown
- features/projects/dashboard/components/ProjectReceiptsSection.tsx: <Input> bare => unknown
- features/projects/estimates/components/CreateEstimateDialog.tsx: <Button> bare => default-control
- features/projects/estimates/components/CreateEstimateDialog.tsx: <Input> bare => default-control
- features/projects/estimates/components/EstimateHeader.tsx: <Button> bare => unknown
- features/projects/estimates/components/params/RoomsParamsTable.tsx: <Button> bare => table-cell
- features/projects/estimates/components/params/RoomsParamsTable.tsx: <Input> bare => table-cell
- features/projects/estimates/components/registry/EstimateStatusMenu.tsx: <Button> bare => unknown
- features/projects/estimates/components/registry/EstimatesListTable.tsx: <Button> bare => table-cell
- features/projects/estimates/components/table/EstimateTable.client.tsx: <Button> bare => table-cell
- features/projects/estimates/components/table/EstimateTableDialogs.tsx: <Button> bare => default-control
- features/projects/estimates/components/table/EstimateTableDialogs.tsx: <Input> bare => default-control
- features/projects/estimates/components/table/cards/EstimateInlineNumberCell.tsx: <Button> bare => table-cell
- features/projects/estimates/components/table/cards/EstimateInlineNumberCell.tsx: <Input> bare => table-cell
- features/projects/estimates/components/table/cards/EstimateInlineTextCell.tsx: <Button> bare => table-cell
- features/projects/estimates/components/table/cards/EstimateInlineTextCell.tsx: <Input> bare => table-cell
- features/projects/estimates/components/table/cards/EstimateMaterialCard.tsx: <Button> bare => table-cell
- features/projects/estimates/components/table/cards/EstimateSectionCard.tsx: <Button> bare => table-cell
- features/projects/estimates/components/table/cards/EstimateWorkCard.tsx: <Button> bare => table-cell
- features/projects/estimates/components/table/columns.tsx: <Button> bare => table-cell
- features/projects/estimates/components/tabs/execution/EstimateExecutionAddExtraWorkSheet.tsx: <Button> bare => unknown
- features/projects/list/components/create-project-dialog.tsx: <Button> bare => default-control
- features/projects/list/components/create-project-dialog.tsx: <Input> bare => default-control
- features/projects/list/components/project-actions.tsx: <Button> bare => unknown
- features/projects/list/components/projects-sort-select.tsx: <Button> bare => unknown
- features/projects/list/components/projects-toolbar.tsx: <Button> bare => toolbar-action
- features/settings/components/user-settings-page.tsx: <Button> bare => default-control
- features/settings/components/user-settings-page.tsx: <Input> bare => default-control
- features/settings/screens/AdminGeneralSettingsScreen.tsx: <Button> bare => default-control
- features/settings/screens/AdminGeneralSettingsScreen.tsx: <Input> bare => default-control
- features/settings/screens/AdminSecuritySettingsScreen.tsx: <Button> bare => default-control
- features/settings/screens/AdminSecuritySettingsScreen.tsx: <Input> bare => default-control
- features/team/components/InviteTeamMemberCard.tsx: <Button> bare => unknown
- features/team/components/InviteTeamMemberCard.tsx: <Input> bare => unknown
- features/team/components/TeamMembersCard.tsx: <Button> bare => unknown
- features/works/components/UnitSelect.tsx: <Button> bare => unknown
- features/works/components/WorksEditDialog.tsx: <Button> bare => default-control
- features/works/components/WorksEditDialog.tsx: <Input> bare => default-control
- features/works/components/columns.tsx: <Button> bare => table-cell
- shared/ui/action-menu.tsx: <Button> bare => unknown
- shared/ui/admin-surface.tsx: <Button> bare => default-control
- shared/ui/alert-dialog.tsx: <Button> bare => default-control
- shared/ui/auto-form/fields/array.tsx: <Button> bare => default-control
- shared/ui/auto-form/fields/input.tsx: <Input> bare => default-control
- shared/ui/auto-form/fields/number.tsx: <Input> bare => default-control
- shared/ui/auto-form/index.tsx: <Button> bare => default-control
- shared/ui/calendar.tsx: <Button> bare => unknown
- shared/ui/carousel.tsx: <Button> bare => unknown
- shared/ui/cells/editable-cell.tsx: <Button> bare => table-cell
- shared/ui/cells/editable-cell.tsx: <Input> bare => table-cell
- shared/ui/cells/table-cell-helpers.tsx: <Input> bare => table-cell
- shared/ui/dashboard-dynamics-chart.tsx: <Button> bare => compact-candidate
- shared/ui/date-picker.tsx: <Button> bare => unknown
- shared/ui/dense-list/pickers.tsx: <Button> bare => unknown
- shared/ui/dialog.tsx: <Button> bare => default-control
- shared/ui/estimate-tab.tsx: <Input> bare => unknown
- shared/ui/input-group.tsx: <Button> bare => unknown
- shared/ui/input-group.tsx: <Input> bare => unknown
- shared/ui/search-control.tsx: <Button> bare => unknown
- shared/ui/search-input.tsx: <Input> bare => unknown
- shared/ui/sidebar.tsx: <Button> bare => compact-candidate
- shared/ui/sidebar.tsx: <Input> bare => compact-candidate
- shared/ui/table-actions.tsx: <Button> bare => table-cell
- shared/ui/toolbar-button.tsx: <Button> bare => toolbar-action

## Density markers count/details
- count: 108
- app/(admin)/dashboard/tenants/[tenantId]/page.tsx: bare
- app/(admin)/dashboard/tenants/page.tsx: bare
- app/(admin)/page.tsx: bare
- app/(login)/verify-email/page.tsx: bare
- app/not-found.tsx: bare
- app/page.tsx: bare
- components/layout/user-menu.tsx: bare
- features/_shared/directories/components/directory-list-screen.tsx: bare
- features/_shared/guide-catalog/components/CatalogFilterSidebar.tsx: bare
- features/_shared/guide-catalog/components/CatalogScreenShell.tsx: bare
- features/_shared/guide-catalog/components/CatalogTableWrapper.tsx: bare
- features/admin/components/PricingSubmitButton.tsx: bare
- features/admin/components/admin-user-menu.tsx: bare
- features/admin/components/impersonate-button.tsx: bare
- features/admin/components/impersonate-button.tsx: bare
- features/admin/components/stop-impersonation-button.tsx: bare
- features/auth/components/ForgotPasswordForm.tsx: bare
- features/auth/components/ForgotPasswordForm.tsx: bare
- features/auth/components/LoginForm.tsx: bare
- features/auth/components/LoginForm.tsx: bare
- features/auth/components/ResetPasswordForm.tsx: bare
- features/auth/components/ResetPasswordForm.tsx: bare
- features/catalog/components/CatalogCategoryButton.tsx: bare
- features/catalog/components/MaterialCatalogPicker.client.tsx: bare
- features/catalog/components/WorkCatalogPicker.client.tsx: bare
- features/counterparties/components/CreateCounterpartySheet.tsx: bare
- features/counterparties/components/counterparty-sheet-sections.tsx: bare
- features/dashboard/components/TeamWidgetSection.tsx: bare
- features/global-purchases/components/GlobalPurchasesImportExportActions.tsx: bare
- features/global-purchases/components/cards/DeletePurchaseAction.tsx: bare
- features/global-purchases/components/global-purchases-columns.tsx: bare
- features/guide/screens/GuideScreen.tsx: bare
- features/material-suppliers/components/CreateMaterialSupplierSheet.tsx: bare
- features/material-suppliers/components/CreateMaterialSupplierSheet.tsx: bare
- features/materials/components/MaterialsEditDialog.tsx: bare
- features/materials/components/MaterialsEditDialog.tsx: bare
- features/materials/components/MaterialsSidebar.tsx: bare
- features/materials/components/columns.tsx: bare
- features/notifications/components/notification-bell.tsx: bare
- features/notifications/components/notification-item.tsx: bare
- features/patterns/screens/PatternsScreen.tsx: bare
- features/permissions/components/PermissionLevelControl.tsx: bare
- features/projects/dashboard/components/ProjectEstimatesCards.tsx: bare
- features/projects/dashboard/components/ProjectEstimatesSection.tsx: bare
- features/projects/dashboard/components/ProjectReceiptsSection.tsx: bare
- features/projects/dashboard/components/ProjectReceiptsSection.tsx: bare
- features/projects/estimates/components/CreateEstimateDialog.tsx: bare
- features/projects/estimates/components/CreateEstimateDialog.tsx: bare
- features/projects/estimates/components/EstimateHeader.tsx: bare
- features/projects/estimates/components/params/RoomsParamsTable.tsx: bare
- features/projects/estimates/components/params/RoomsParamsTable.tsx: bare
- features/projects/estimates/components/registry/EstimateStatusMenu.tsx: bare
- features/projects/estimates/components/registry/EstimatesListTable.tsx: bare
- features/projects/estimates/components/table/EstimateTable.client.tsx: bare
- features/projects/estimates/components/table/EstimateTableDialogs.tsx: bare
- features/projects/estimates/components/table/EstimateTableDialogs.tsx: bare
- features/projects/estimates/components/table/cards/EstimateInlineNumberCell.tsx: bare
- features/projects/estimates/components/table/cards/EstimateInlineNumberCell.tsx: bare
- features/projects/estimates/components/table/cards/EstimateInlineTextCell.tsx: bare
- features/projects/estimates/components/table/cards/EstimateInlineTextCell.tsx: bare
- features/projects/estimates/components/table/cards/EstimateMaterialCard.tsx: bare
- features/projects/estimates/components/table/cards/EstimateSectionCard.tsx: bare
- features/projects/estimates/components/table/cards/EstimateWorkCard.tsx: bare
- features/projects/estimates/components/table/columns.tsx: bare
- features/projects/estimates/components/tabs/execution/EstimateExecutionAddExtraWorkSheet.tsx: bare
- features/projects/list/components/create-project-dialog.tsx: bare
- features/projects/list/components/create-project-dialog.tsx: bare
- features/projects/list/components/project-actions.tsx: bare
- features/projects/list/components/projects-sort-select.tsx: bare
- features/projects/list/components/projects-toolbar.tsx: bare
- features/settings/components/user-settings-page.tsx: bare
- features/settings/components/user-settings-page.tsx: bare
- features/settings/screens/AdminGeneralSettingsScreen.tsx: bare
- features/settings/screens/AdminGeneralSettingsScreen.tsx: bare
- features/settings/screens/AdminSecuritySettingsScreen.tsx: bare
- features/settings/screens/AdminSecuritySettingsScreen.tsx: bare
- features/team/components/InviteTeamMemberCard.tsx: bare
- features/team/components/InviteTeamMemberCard.tsx: bare
- features/team/components/TeamMembersCard.tsx: bare
- features/works/components/UnitSelect.tsx: bare
- features/works/components/WorksEditDialog.tsx: bare
- features/works/components/WorksEditDialog.tsx: bare
- features/works/components/columns.tsx: bare
- shared/ui/action-menu.tsx: bare
- shared/ui/admin-surface.tsx: bare
- shared/ui/alert-dialog.tsx: bare
- shared/ui/auto-form/fields/array.tsx: bare
- shared/ui/auto-form/fields/input.tsx: bare
- shared/ui/auto-form/fields/number.tsx: bare
- shared/ui/auto-form/index.tsx: bare
- shared/ui/calendar.tsx: bare
- shared/ui/carousel.tsx: bare
- shared/ui/cells/editable-cell.tsx: bare
- shared/ui/cells/editable-cell.tsx: bare
- shared/ui/cells/table-cell-helpers.tsx: bare
- shared/ui/dashboard-dynamics-chart.tsx: bare
- shared/ui/date-picker.tsx: bare
- shared/ui/dense-list/pickers.tsx: bare
- shared/ui/dialog.tsx: bare
- shared/ui/estimate-tab.tsx: bare
- shared/ui/input-group.tsx: bare
- shared/ui/input-group.tsx: bare
- shared/ui/search-control.tsx: bare
- shared/ui/search-input.tsx: bare
- shared/ui/sidebar.tsx: bare
- shared/ui/sidebar.tsx: bare
- shared/ui/table-actions.tsx: bare
- shared/ui/toolbar-button.tsx: bare

## Auto-fix candidates
- none
- reason: classification-first mode; fix-safe disabled

## Unknown density surfaces require manual review before #243 auto-fix
- app/(login)/verify-email/page.tsx: <Button>
- app/not-found.tsx: <Button>
- app/page.tsx: <Button>
- components/layout/user-menu.tsx: <Button>
- features/_shared/directories/components/directory-list-screen.tsx: <Button>
- features/_shared/guide-catalog/components/CatalogFilterSidebar.tsx: <Button>
- features/_shared/guide-catalog/components/CatalogScreenShell.tsx: <Input>
- features/catalog/components/CatalogCategoryButton.tsx: <Button>
- features/catalog/components/MaterialCatalogPicker.client.tsx: <Button>
- features/catalog/components/WorkCatalogPicker.client.tsx: <Button>
- features/counterparties/components/CreateCounterpartySheet.tsx: <Button>
- features/counterparties/components/counterparty-sheet-sections.tsx: <Input>
- features/dashboard/components/TeamWidgetSection.tsx: <Button>
- features/global-purchases/components/GlobalPurchasesImportExportActions.tsx: <Input>
- features/global-purchases/components/cards/DeletePurchaseAction.tsx: <Button>
- features/guide/screens/GuideScreen.tsx: <Button>
- features/material-suppliers/components/CreateMaterialSupplierSheet.tsx: <Button>
- features/material-suppliers/components/CreateMaterialSupplierSheet.tsx: <Input>
- features/materials/components/MaterialsSidebar.tsx: <Button>
- features/notifications/components/notification-bell.tsx: <Button>
- features/notifications/components/notification-item.tsx: <Button>
- features/patterns/screens/PatternsScreen.tsx: <Button>
- features/permissions/components/PermissionLevelControl.tsx: <Button>
- features/projects/dashboard/components/ProjectEstimatesCards.tsx: <Button>
- features/projects/dashboard/components/ProjectEstimatesSection.tsx: <Button>
- features/projects/dashboard/components/ProjectReceiptsSection.tsx: <Button>
- features/projects/dashboard/components/ProjectReceiptsSection.tsx: <Input>
- features/projects/estimates/components/EstimateHeader.tsx: <Button>
- features/projects/estimates/components/registry/EstimateStatusMenu.tsx: <Button>
- features/projects/estimates/components/tabs/execution/EstimateExecutionAddExtraWorkSheet.tsx: <Button>
- features/projects/list/components/project-actions.tsx: <Button>
- features/projects/list/components/projects-sort-select.tsx: <Button>
- features/team/components/InviteTeamMemberCard.tsx: <Button>
- features/team/components/InviteTeamMemberCard.tsx: <Input>
- features/team/components/TeamMembersCard.tsx: <Button>
- features/works/components/UnitSelect.tsx: <Button>
- shared/ui/action-menu.tsx: <Button>
- shared/ui/calendar.tsx: <Button>
- shared/ui/carousel.tsx: <Button>
- shared/ui/date-picker.tsx: <Button>
- shared/ui/dense-list/pickers.tsx: <Button>
- shared/ui/estimate-tab.tsx: <Input>
- shared/ui/input-group.tsx: <Button>
- shared/ui/input-group.tsx: <Input>
- shared/ui/search-control.tsx: <Button>
- shared/ui/search-input.tsx: <Input>
