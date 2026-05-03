# Raw HTML classification for Issue #252

Generated from `pnpm audit:ui-inventory` on 2026-05-03.

| File | Element | Classification | Rationale |
|---|---|---|---|
| `features/_shared/guide-catalog/components/CatalogScreenShell.tsx` | `<input type="file">` | follow-up | Hidden file input uses ref semantics; `shared/ui/Input` lacks forwardRef. |
| `features/admin/components/admin-user-menu.tsx` | `<form>` | exception | Native submit required for server actions. |
| `features/admin/components/impersonate-button.tsx` | `<form>` | exception | Native submit required. |
| `features/admin/components/impersonate-button.tsx` | `<input type="hidden">` | exception | Transport-only field. |
| `features/auth/components/ForgotPasswordForm.tsx` | `<form>` | exception | Auth flow requires native submit. |
| `features/auth/components/LoginForm.tsx` | `<form>` | exception | Auth flow requires native submit. |
| `features/auth/components/LoginForm.tsx` | `<input type="hidden">` | exception | Transport-only field. |
| `features/auth/components/ResetPasswordForm.tsx` | `<form>` | exception | Native submit required. |
| `features/auth/components/ResetPasswordForm.tsx` | `<input type="hidden">` | exception | Transport-only field. |
| `features/counterparties/components/CreateCounterpartySheet.tsx` | `<form>` | exception | Native submit semantics intentional. |
| `features/global-purchases/components/GlobalPurchasesImportExportActions.tsx` | `<input type="file">` | follow-up | Requires forwardRef support. |
| `features/material-suppliers/components/CreateMaterialSupplierSheet.tsx` | `<form>` | exception | Native submit semantics intentional. |
| `features/projects/estimates/components/CreateEstimateDialog.tsx` | `<form>` | exception | Native submit semantics intentional. |
| `features/settings/screens/AdminGeneralSettingsScreen.tsx` | `<form>` | exception | Native submit semantics intentional. |
| `features/settings/screens/AdminSecuritySettingsScreen.tsx` | `<form>` | exception | Native submit semantics intentional. |
| `features/team/components/InviteTeamMemberCard.tsx` | `<form>` | exception | Native submit semantics intentional. |

## Summary

- `changed`: 0
- `no-op`: 0
- `exception`: 14
- `follow-up`: 2
