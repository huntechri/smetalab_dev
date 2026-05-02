# Auth and landing visual ownership classification

Status: current classification for issue #216.

This document classifies auth, landing, and adjacent fallback visual ownership without redesigning those surfaces and without changing authentication behavior.

## Ownership model

Authenticated runtime app UI and marketing/auth UI are separate visual ownership domains.

- Runtime app surfaces should continue to use `shared/ui/**` runtime contracts for primitives, shells, density, tables, cards, dialogs, and forms.
- Landing surfaces may keep their own marketing visual language when the recipe is page-specific and not reused across authenticated runtime app UI.
- Auth surfaces may keep an auth-only visual language when the recipe supports sign-in, sign-up, verification, password reset, or invitation flows.
- Auth behavior is out of scope for this classification. Do not change auth actions, redirects, validation, email verification, password reset, session handling, or token handling as part of visual ownership cleanup.
- Dedicated `shared/ui/marketing/*` or `shared/ui/auth/*` contracts should be introduced only when a visual recipe becomes reusable outside the current single owner. Do not create vague wrappers only to hide audit findings.

## Classification buckets

- Accepted marketing exception: page-specific marketing surface; not runtime app drift.
- Accepted auth exception: auth-only surface or contract; not runtime app drift.
- Dedicated `shared/ui/marketing/*` contract required: reusable marketing visual contract should be centralized.
- Dedicated `shared/ui/auth/*` contract required: reusable auth visual contract should be centralized.
- Runtime app UI drift requiring normalization: visual recipe belongs to authenticated runtime shared UI contracts.
- Out-of-scope/no-op: route wrapper, missing surface, canonical token/global surface, or fallback not sharing auth/marketing visual language.

## Inspected surface inventory

| Surface | File | Classification | Ownership decision | Follow-up |
| --- | --- | --- | --- | --- |
| Landing / marketing | `app/page.tsx` | Accepted marketing exception | The dark hero, marketing gradients, brand palette, pricing/workflow sections, and marketing CTA composition are landing-owned. They must not be forced into authenticated runtime app shell conventions. | No `shared/ui/marketing/*` contract is required until another marketing surface repeats the same recipe. |
| Landing feature folder | `features/landing/**` | Out-of-scope/no-op | No landing feature folder is present in the inspected repo state. | None. |
| Marketing components folder | `components/marketing/**` | Out-of-scope/no-op | No marketing component folder is present in the inspected repo state. | None. |
| Auth route wrapper | `app/(login)/sign-in/page.tsx` | Out-of-scope/no-op | Thin route wrapper that delegates to `Login mode="signin"`. It does not own a separate visual recipe. | None. |
| Auth route wrapper | `app/(login)/sign-up/page.tsx` | Out-of-scope/no-op | Thin route wrapper that delegates to `Login mode="signup"`. It does not own a separate visual recipe. | None. |
| Auth route wrapper | `app/(login)/forgot-password/page.tsx` | Out-of-scope/no-op | Thin route wrapper that delegates to `ForgotPasswordForm`. It does not own a separate visual recipe. | None. |
| Auth route wrapper | `app/(login)/reset-password/page.tsx` | Out-of-scope/no-op | Thin route wrapper that passes the reset token into `ResetPasswordForm`. Token behavior is not visual ownership and remains unchanged. | None. |
| Auth verification page | `app/(login)/verify-email/page.tsx` | Accepted auth exception | Uses `AuthFormShell` and `AuthStatusMessage` for auth-only confirmation/error presentation while preserving server-side email verification behavior. | No behavior follow-up. Extract only if auth shell moves to `shared/ui/auth/*` in a later dedicated PR. |
| Auth sign-in/sign-up form | `features/auth/components/LoginForm.tsx` | Accepted auth exception | Owns the current auth entry visual language for sign-in and sign-up, including auth/marketing split layout and dark onboarding presentation. This is not authenticated runtime app drift. | Consider `shared/ui/auth/*` only if this recipe must be reused outside `features/auth`. |
| Auth shell/status contract | `features/auth/components/AuthFormShell.tsx` | Accepted auth exception | Current auth-only form shell and status-message visual contract. It is intentionally separate from runtime app shells. | No immediate extraction required. |
| Auth password recovery form | `features/auth/components/ForgotPasswordForm.tsx` | Accepted auth exception | Composes `AuthFormShell`, `AuthStatusMessage`, and shared primitives for the password recovery flow. | None. |
| Auth password reset form | `features/auth/components/ResetPasswordForm.tsx` | Accepted auth exception | Composes `AuthFormShell`, `AuthStatusMessage`, and shared primitives for reset-token flow. Token and validation behavior remain out of scope. | None. |
| Login route group layout | `app/(login)/layout.tsx` | Out-of-scope/no-op | No route group layout is present in the inspected repo state. | None. |
| Login route group loading state | `app/(login)/loading.tsx` | Out-of-scope/no-op | No route group loading file is present in the inspected repo state. | None. |
| Root loading state | `app/loading.tsx` | Out-of-scope/no-op | No root loading file is present in the inspected repo state. | None. |
| Root error state | `app/error.tsx` | Out-of-scope/no-op | No root error file is present in the inspected repo state. | None. |
| Global fallback | `app/not-found.tsx` | Out-of-scope/no-op | Runtime fallback uses shared primitives and semantic runtime tokens. It does not share the landing/auth dark marketing visual recipe. | None for #216. |
| Global token surface | `app/globals.css` | Out-of-scope/no-op | Canonical token/global CSS ownership surface. Not auth or landing drift. | None for #216. |
| Global layout surface | `app/layout.tsx` | Out-of-scope/no-op | Canonical root layout surface. Not auth or landing drift. | None for #216. |

## Before / after disposition counts

Baseline counts come from the Phase 10 UI audit issue that introduced these low-priority auth, landing, and global surfaces.

Before #216 classification:

| Bucket | Files | Historical findings |
| --- | ---: | ---: |
| Marketing / landing exception candidate | 1 | 178 |
| Auth ambiguous exception candidates | 4 | 68 |
| Global fallback candidate | 1 | 13 |
| Canonical/global token and layout surfaces | 2 | 5 |
| Total historical Phase 10 surfaced files | 8 | 264 |

After #216 classification for present inspected files:

| Bucket | Files | Historical findings classified |
| --- | ---: | ---: |
| Accepted marketing exception | 1 | 178 |
| Accepted auth exception / current auth-only contract | 5 | 68 |
| Dedicated `shared/ui/marketing/*` contract required | 0 | 0 |
| Dedicated `shared/ui/auth/*` contract required | 0 | 0 |
| Runtime app UI drift requiring normalization | 0 | 0 |
| Out-of-scope/no-op route/global/fallback files | 7 | 18 |
| Present inspected files | 13 | 264 |

## Relationship to #184

Issue #184 is closed as completed. This classification does not reopen it and does not redesign any Phase 10 surface.

Remaining auth/landing visual audit signals are handled as explicit ownership decisions:

- `app/page.tsx` remains an accepted marketing exception.
- `features/auth/**` and `app/(login)/verify-email/page.tsx` remain accepted auth exceptions or auth-only contracts.
- `app/not-found.tsx` remains a runtime fallback surface, not a marketing/auth contract.
- `app/globals.css` and `app/layout.tsx` remain canonical/global ownership surfaces.

Future work is only required if product scope adds additional marketing/auth surfaces that reuse the same recipes. At that point, introduce a narrow `shared/ui/marketing/*` or `shared/ui/auth/*` contract in a dedicated PR.
