# UI Audit Phase 10 — Auth, landing and low-priority app surfaces

Source issue: #184.

## Scope reviewed

- `app/page.tsx`
- `features/auth/**`
- `app/(login)/verify-email/page.tsx`
- `app/not-found.tsx`
- `app/globals.css`
- `app/layout.tsx`

## Decisions

### Landing page

`app/page.tsx` is treated as an intentional marketing surface, not as a business runtime screen. Its dark art direction, radial gradients, accent-heavy hero blocks and custom marketing cards remain accepted exception candidates for this phase.

Phase 10 does not redesign the landing page. Any future landing cleanup should be scoped separately and should preserve marketing ownership instead of forcing runtime app table/card patterns onto the public page.

### Global token and layout surfaces

`app/globals.css` remains the canonical token and base utility ownership surface. Findings related to token declarations, theme variables and global utility classes are accepted as canonical ownership findings unless they violate governance.

`app/layout.tsx` remains the global app layout surface. Phase 10 does not move font, body or provider ownership out of this file.

### Auth surfaces

Auth pages are feature-owned surfaces. Shared auth composition belongs in `features/auth/components`, not in `shared/ui`, because these wrappers encode auth-specific layout and status semantics rather than reusable design-system primitives.

Normalized in this phase:

- Forgot/reset/verify pages now use a feature-local auth form shell.
- Auth status messages now use tokenized `destructive`, `success` and `brand` states instead of one-off red/green/amber text classes.
- Login form keeps its intentional dark marketing/auth split layout while reducing direct brand/status color duplication.

### Not found route

`app/not-found.tsx` is normalized to the canonical `Card` and `Button` primitives with semantic background/foreground/brand tokens.

## Non-goals preserved

- No landing redesign.
- No authentication behavior changes.
- No server action changes.
- No changes to global font/token ownership.
- No migration of feature-specific auth composition into `shared/ui`.

## Verification target

- `pnpm lint`
- `pnpm type-check`
- `pnpm audit:ui` in report-only mode
