# Audit tooling source of truth

This note records the current canonical audit entrypoints for button and input UI audits.

## Canonical commands

```bash
pnpm audit:buttons
pnpm audit:inputs
pnpm audit:ui
```

These commands are wired in `package.json` and call the AST-based scripts:

```txt
scripts/migrate-buttons.ts --report
scripts/migrate-inputs.ts --report
```

## Authoritative outputs

The authoritative reports are generated JSON/spec artifacts:

```txt
reports/button-audit.json
reports/button-canonical-spec.md
reports/input-audit.json
reports/input-canonical-spec.md
```

These report files are generated artifacts and should stay ignored by git.

The old markdown summaries are human-readable snapshots only. They should not be used as the source of truth when they differ from the AST reports.

## Retired duplicate entrypoints

```txt
scripts/audit_buttons.mjs
scripts/audit_inputs.mjs
```

The button wrapper used regex scanning. The input wrapper duplicated the existing package script. Both were removed to keep one audit path.

## Maintenance rule

Do not commit regenerated audit report outputs unless the PR explicitly updates the audit report format or canonical source-of-truth docs.
