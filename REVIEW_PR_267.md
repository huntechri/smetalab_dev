# PR #267 Review Notes (updated)

## Confirmed by discussion

1. **Auto-clear for quantity is intentional and valid for your UX**
   - For inserted work rows, default `qty = 1` is a placeholder and often incorrect.
   - Clearing the input on focus/click reduces friction: user can immediately type the target quantity.
   - If user leaves the field empty and blurs, reverting to previous value (`1`) is expected behavior.

## Major issues

1. **Migration constraint existence checks are too broad**
   - In migrations `0013` and `0015`, constraint checks use only `conname`.
   - PostgreSQL does not enforce global uniqueness of constraint names across all tables.
   - If another table has same constraint name, migration may skip needed constraint creation.
   - Prefer checks by both name and relation (`conrelid = 'table_name'::regclass`).

## Medium issues

1. **Auto-clear should be scoped only to intended fields**
   - Current implementation in `EditableCell` applies clear behavior at component level.
   - This can unintentionally affect other editable columns (e.g. `price`, `expense`, or any future text fields).
   - Suggestion: explicit prop (e.g. `clearOnFocus`) and enable it only for `qty`.

2. **No automated tests for updated editing UX**
   - PR changes interactive editing behavior for estimate table cells but adds no unit/integration tests.
   - Suggested tests:
     - `qty` clears on focus and commits typed value;
     - blur without input restores previous value;
     - non-qty fields keep incremental edit behavior;
     - Enter/blur commit semantics are stable.

3. **Global CSS formatting-only noise mixed with behavior changes**
   - `app/globals.css` includes many non-functional formatting updates plus spinner removal.
   - Consider separating formatting-only updates from functional UX changes into independent commit.

## Suggested fixes

- Keep quantity auto-clear behavior (as agreed), but make it opt-in per cell.
- Tighten migration checks:
  - query `pg_constraint` with table scope.
- Add tests covering edit lifecycle and agreed qty-specific UX.
