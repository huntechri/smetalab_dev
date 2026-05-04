# UI Inventory Report

## Top summary
- real violations count: 0
- needs-review count: 4
- informational count: 818
- auto-fix candidates count: 0
- manual review count: 4

## UI source-of-truth matrix
| Component | components/ui | shared/ui | packages/ui / @repo/ui | Runtime imports | Status | Decision |
|---|---|---|---|---|---|---|
| Button | false | true | false | 81 | canonical | informational |
| Input | false | true | false | 25 | canonical | informational |
| Textarea | false | true | false | 3 | canonical | informational |
| Select | false | true | false | 3 | canonical | informational |
| Checkbox | false | true | false | 1 | canonical | informational |
| Switch | false | true | false | 3 | canonical | informational |
| Label | false | true | false | 13 | canonical | informational |
| Form | false | true | false | 5 | canonical | informational |
| Card | false | true | false | 12 | canonical | informational |
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
| Skeleton | false | true | false | 8 | canonical | informational |
| LoadingState | false | true | false | 9 | canonical | informational |
| EmptyState | false | true | false | 3 | canonical | informational |
| ErrorState | false | true | false | 4 | canonical | informational |
| ForbiddenState | false | true | false | 2 | canonical | informational |
| StateShell | false | false | false | 0 | missing | not-imported; file-exists=true; exported=true |

## Raw HTML classification (app/features)
- none

## Raw HTML classification (shared/ui)
- shared/ui/admin-surface.tsx: <form> => allowed
- shared/ui/auto-form/index.tsx: <form> => allowed
- shared/ui/data-table.tsx: <button> => allowed
- shared/ui/data-table.tsx: <table> => allowed
- shared/ui/file-input.tsx: <input> => allowed
- shared/ui/form-layout.tsx: <form> => allowed
- shared/ui/hidden-input.tsx: <input> => allowed
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
- app/(login)/verify-email/page.tsx: <Button> bare => default-control
- app/not-found.tsx: <Button> bare => default-control
- app/page.tsx: <Button> bare => default-control
- components/layout/user-menu.tsx: <Button> bare => toolbar-action
- features/_shared/directories/components/directory-list-screen.tsx: <Button> bare => toolbar-action
- features/_shared/guide-catalog/components/CatalogFilterSidebar.tsx: <Button> bare => toolbar-action
- features/_shared/guide-catalog/components/CatalogTableWrapper.tsx: <Button> bare => table-cell
- features/admin/components/PricingSubmitButton.tsx: <Button> bare => default-control
- features/admin/components/admin-user-menu.tsx: <Button> bare => default-control
- features/admin/components/impersonate-button.tsx: <Button> bare => default-control
- features/admin/components/stop-impersonation-button.tsx: <Button> bare => default-control
- features/auth/components/ForgotPasswordForm.tsx: <Button> bare => default-control
- features/auth/components/ForgotPasswordForm.tsx: <Input> bare => default-control
- features/auth/components/LoginForm.tsx: <Button> bare => default-control
- features/auth/components/LoginForm.tsx: <Input> bare => default-control
- features/auth/components/ResetPasswordForm.tsx: <Button> bare => default-control
- features/auth/components/ResetPasswordForm.tsx: <Input> bare => default-control
- features/catalog/components/CatalogCategoryButton.tsx: <Button> bare => toolbar-action
- features/catalog/components/MaterialCatalogPicker.client.tsx: <Button> bare => compact-candidate
- features/catalog/components/WorkCatalogPicker.client.tsx: <Button> bare => compact-candidate
- features/counterparties/components/CreateCounterpartySheet.tsx: <Button> bare => default-control
- features/counterparties/components/counterparty-sheet-sections.tsx: <Input> bare => default-control
- features/dashboard/components/TeamWidgetSection.tsx: <Button> bare => toolbar-action
- features/global-purchases/components/cards/DeletePurchaseAction.tsx: <Button> bare => table-cell
- features/global-purchases/components/global-purchases-columns.tsx: <Button> bare => table-cell
- features/guide/screens/GuideScreen.tsx: <Button> bare => toolbar-action
- features/material-suppliers/components/CreateMaterialSupplierSheet.tsx: <Button> bare => default-control
- features/material-suppliers/components/CreateMaterialSupplierSheet.tsx: <Input> bare => default-control
- features/materials/components/MaterialsEditDialog.tsx: <Button> bare => default-control
- features/materials/components/MaterialsEditDialog.tsx: <Input> bare => default-control
- features/materials/components/MaterialsSidebar.tsx: <Button> bare => toolbar-action
- features/materials/components/columns.tsx: <Button> bare => table-cell
- features/notifications/components/notification-bell.tsx: <Button> bare => compact-candidate
- features/notifications/components/notification-item.tsx: <Button> bare => compact-candidate
- features/patterns/screens/PatternsScreen.tsx: <Button> bare => toolbar-action
- features/permissions/components/PermissionLevelControl.tsx: <Button> bare => default-control
- features/projects/dashboard/components/ProjectEstimatesCards.tsx: <Button> bare => compact-candidate
- features/projects/dashboard/components/ProjectEstimatesSection.tsx: <Button> bare => toolbar-action
- features/projects/dashboard/components/ProjectReceiptsSection.tsx: <Button> bare => toolbar-action
- features/projects/dashboard/components/ProjectReceiptsSection.tsx: <Input> bare => default-control
- features/projects/estimates/components/CreateEstimateDialog.tsx: <Button> bare => default-control
- features/projects/estimates/components/CreateEstimateDialog.tsx: <Input> bare => default-control
- features/projects/estimates/components/EstimateHeader.tsx: <Button> bare => toolbar-action
- features/projects/estimates/components/params/RoomsParamsTable.tsx: <Button> bare => table-cell
- features/projects/estimates/components/params/RoomsParamsTable.tsx: <Input> bare => table-cell
- features/projects/estimates/components/registry/EstimateStatusMenu.tsx: <Button> bare => table-cell
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
- features/projects/estimates/components/tabs/EstimateExecution.tsx: <Button> bare => unknown
- features/projects/estimates/components/tabs/EstimateProcurement.tsx: <Button> bare => unknown
- features/projects/estimates/components/tabs/execution/EstimateExecutionAddExtraWorkSheet.tsx: <Button> bare => default-control
- features/projects/list/components/create-project-dialog.tsx: <Button> bare => default-control
- features/projects/list/components/create-project-dialog.tsx: <Input> bare => default-control
- features/projects/list/components/project-actions.tsx: <Button> bare => table-cell
- features/projects/list/components/projects-sort-select.tsx: <Button> bare => toolbar-action
- features/projects/list/components/projects-toolbar.tsx: <Button> bare => toolbar-action
- features/settings/components/user-settings-page.tsx: <Button> bare => default-control
- features/settings/components/user-settings-page.tsx: <Input> bare => default-control
- features/settings/screens/AdminGeneralSettingsScreen.tsx: <Button> bare => default-control
- features/settings/screens/AdminGeneralSettingsScreen.tsx: <Input> bare => default-control
- features/settings/screens/AdminSecuritySettingsScreen.tsx: <Button> bare => default-control
- features/settings/screens/AdminSecuritySettingsScreen.tsx: <Input> bare => default-control
- features/team/components/InviteTeamMemberCard.tsx: <Button> bare => default-control
- features/team/components/InviteTeamMemberCard.tsx: <Input> bare => default-control
- features/team/components/TeamMembersCard.tsx: <Button> bare => table-cell
- features/works/components/UnitSelect.tsx: <Button> bare => default-control
- features/works/components/WorksEditDialog.tsx: <Button> bare => default-control
- features/works/components/WorksEditDialog.tsx: <Input> bare => default-control
- features/works/components/columns.tsx: <Button> bare => table-cell
- shared/ui/action-menu.tsx: <Button> bare => toolbar-action
- shared/ui/admin-surface.tsx: <Button> bare => default-control
- shared/ui/alert-dialog.tsx: <Button> bare => default-control
- shared/ui/auto-form/fields/array.tsx: <Button> bare => default-control
- shared/ui/auto-form/fields/input.tsx: <Input> bare => default-control
- shared/ui/auto-form/fields/number.tsx: <Input> bare => default-control
- shared/ui/auto-form/index.tsx: <Button> bare => default-control
- shared/ui/calendar.tsx: <Button> bare => compact-candidate
- shared/ui/carousel.tsx: <Button> bare => compact-candidate
- shared/ui/cells/editable-cell.tsx: <Button> bare => table-cell
- shared/ui/cells/editable-cell.tsx: <Input> bare => table-cell
- shared/ui/cells/table-cell-helpers.tsx: <Input> bare => table-cell
- shared/ui/dashboard-dynamics-chart.tsx: <Button> bare => compact-candidate
- shared/ui/date-picker.tsx: <Button> bare => compact-candidate
- shared/ui/dense-list/pickers.tsx: <Button> bare => compact-candidate
- shared/ui/dialog.tsx: <Button> bare => default-control
- shared/ui/estimate-tab.tsx: <Input> bare => table-cell
- shared/ui/hidden-input.tsx: <Input> bare => unknown
- shared/ui/input-group.tsx: <Button> bare => default-control
- shared/ui/input-group.tsx: <Input> bare => default-control
- shared/ui/search-control.tsx: <Button> bare => toolbar-action
- shared/ui/search-input.tsx: <Input> bare => default-control
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
- features/_shared/guide-catalog/components/CatalogTableWrapper.tsx: bare
- features/admin/components/PricingSubmitButton.tsx: bare
- features/admin/components/admin-user-menu.tsx: bare
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
- features/projects/estimates/components/tabs/EstimateExecution.tsx: bare
- features/projects/estimates/components/tabs/EstimateProcurement.tsx: bare
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
- shared/ui/hidden-input.tsx: bare
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
- features/projects/estimates/components/tabs/EstimateExecution.tsx: <Button>
- features/projects/estimates/components/tabs/EstimateProcurement.tsx: <Button>
- shared/ui/hidden-input.tsx: <Input>
