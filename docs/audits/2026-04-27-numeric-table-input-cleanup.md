# Numeric Table Input Cleanup — 2026-04-27

## Purpose

This PR follows the button/input override audit and keeps the scope narrow: numeric table input cleanup without changing table layout or business behavior.

## Reviewed surfaces

- `shared/ui/input.tsx`
- `shared/ui/cells/editable-cell.tsx`
- `features/projects/estimates/components/table/cards/EstimateInlineNumberCell.tsx`
- `features/projects/estimates/components/params/RoomsParamsTable.tsx`
- `features/projects/dashboard/components/DashboardDataTable.tsx`
- `features/global-purchases/components/cards/format.ts`

## Baseline

`Input` already applies `tabular-nums` when either:

- `numeric` is true;
- `type="number"`.

`EditableCell` already passes `numeric={type === 'number'}`.

`EstimateInlineNumberCell` already uses:

```tsx
<Input numeric type="number" size="xs" textAlign="right" />
```

## Changes in this PR

### RoomsParamsTable

`RoomsParamsTable` had repeated inline numeric input blocks:

```tsx
<div className="w-24">
  <Input type="number" ... />
</div>
```

This PR extracts:

- `RoomParamNumberInput`
- `NumericCell`
- `CalculatedValueCell`

The layout width (`w-24`) remains local to the table cell. This is intentional because width is table layout, not an `Input` variant.

## Explicit non-goals

- No layout changes.
- No width changes such as `w-24`, `min-w-*`, `col-span-*`.
- No changes to numeric parsing/validation.
- No server action or DB changes.
- No global `Input` variant changes.
- No dashboard demo table behavior changes.

## Follow-up candidates

1. Review `DashboardDataTable` separately; it is demo/dashboard table code and should not be mixed with estimate params cleanup unless required.
2. Review global-purchases inline cell class recipes separately; they are editable dense-card recipes, not generic input variants.
