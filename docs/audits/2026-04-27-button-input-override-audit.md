# Button/Input Override Audit — 2026-04-27

## Purpose

This audit is the next P2 step after PR #93. It identifies the button/input override patterns that should be handled in small follow-up refactors without mixing in business logic, server actions, DB work, or broad UX redesign.

## Sources checked

- `docs/buttons_audit_updated.md`
- `docs/inputs_audit_updated.md`
- `shared/ui/button.tsx`
- `shared/ui/input.tsx`
- `shared/ui/textarea.tsx`
- `shared/ui/input-group.tsx`

## Current primitive baseline

### Button

`shared/ui/button.tsx` already supports these stable variants:

- `default`
- `primary`
- `destructive`
- `outline`
- `secondary`
- `ghost`
- `link`
- `brand`

Supported sizes:

- `xs`
- `sm`
- `default`
- `lg`
- `xl`
- `icon`
- `icon-xs`
- `icon-sm`
- `icon-lg`

The main gap is not missing base primitives. The gap is repeated feature-level `className` recipes layered on top of buttons.

### Input

`shared/ui/input.tsx` already supports:

- `variant="default"`
- `variant="ghost"`
- `size="xs" | "sm" | "default"`
- `textAlign="left" | "center" | "right"`
- `numeric`

`shared/ui/textarea.tsx` now supports:

- `variant="default"`
- `variant="inputGroup"`

After PR #92, the biggest input risk is not the shared primitive itself. Most remaining input classes are layout-specific widths, table density, or icon padding.

## Audit numbers from existing reports

### Buttons

`docs/buttons_audit_updated.md` reports:

- total buttons found: 294

The report shows repeated button class recipes, especially:

```text
font-semibold tracking-tight shadow-sm transition-all active:scale-95
```

Common additions around that recipe:

```text
gap-1.5
text-xs
px-3
rounded-full
w-full
flex-1
```

### Inputs

`docs/inputs_audit_updated.md` reports:

- total fields found: 138
- `component-input`: 104
- `component-command-input`: 6
- `component-select`: 7
- `component-select-trigger`: 7
- `component-textarea`: 3
- `html-hidden-input`: 6
- `html-input`: 4
- `html-textarea`: 1

Most component inputs have no extra classes. Meaning: input cleanup should be narrower than button cleanup.

## Button override clusters

### Cluster A — action button weight/interaction recipe

Observed shape:

```text
font-semibold tracking-tight shadow-sm transition-all active:scale-95
```

Examples appear across catalog, guide, global purchases, directories and admin controls.

Recommended handling:

- do not add another visual variant immediately;
- first introduce a tiny shared recipe/helper or feature-level constant if the exact recipe repeats in a single feature area;
- only promote to `buttonVariants` if the same semantic recipe is stable across several unrelated features.

Possible future API, after a narrow implementation PR:

```tsx
<Button className={actionButtonClassName} />
```

or, only if proven global:

```tsx
<Button emphasis="action" />
```

Do not implement a new `emphasis` API until the repeated usage is mechanically verified.

### Cluster B — pill/rounded controls

Observed shape:

```text
rounded-full
```

Common places:

- admin CTA buttons;
- user/admin menu triggers;
- catalog category chips;
- filter/chip-like buttons.

Recommended handling:

- keep category/chip behavior feature-owned for now;
- consider a separate `ChipButton`/`PillButton` adapter only for catalog/filter controls;
- do not change global `Button` radius defaults.

Rationale:

Rounded buttons may be CTA, avatar trigger, chip, filter, or category selector. Same class does not imply same semantic component.

### Cluster C — full-width and flex footer buttons

Observed shape:

```text
w-full
flex-1
```

Common places:

- auth forms;
- sheet/dialog footers;
- mobile button groups.

Recommended handling:

- leave as local layout classes;
- do not promote to Button variant.

Rationale:

These are layout concerns, not visual button variants.

### Cluster D — icon button action states

Observed shape:

```text
size-7
rounded-[6px]
opacity-50 hover:opacity-100
text-primary
text-muted-foreground
hover:bg-transparent
cursor-move
```

Common places:

- table row actions;
- drag handles;
- insert/delete row actions;
- dropdown triggers.

Recommended handling:

- keep table-specific icon actions in table/cell adapters;
- prefer existing `ActionMenu` and cell helpers where available;
- avoid adding many micro-variants to global `Button`.

### Cluster E — landing/admin dark-surface buttons

Observed shape:

```text
text-white
border-white/40
bg-[#0B0A0F]
hover:bg-white/15
focus-visible:ring-white/60
```

Common places:

- landing page;
- admin/marketing surfaces.

Recommended handling:

- treat as surface-specific visual work;
- do not mix with shared UI cleanup;
- if needed, implement in the P3 landing/admin visual cleanup batch.

## Input override clusters

### Cluster F — icon padding

Observed shape:

```text
pr-10
pl-9 pr-9
```

Common places:

- password fields with visibility toggle;
- `SearchInput`.

Recommended handling:

- keep `SearchInput` as the canonical search adapter;
- password-field padding can remain local unless multiple password field wrappers emerge.

### Cluster G — table/estimate width constraints

Observed shape:

```text
w-24
min-w-[180px]
tabular-nums
```

Common places:

- room params table;
- estimate execution numeric inputs;
- dashboard table filters.

Recommended handling:

- keep width classes local to table layout;
- use existing `numeric`/`textAlign` props where applicable;
- do not promote table widths to global `Input` variants.

### Cluster H — grid placement classes

Observed shape:

```text
col-span-3
sm:col-span-3
```

Common places:

- edit dialogs/forms.

Recommended handling:

- keep as local form grid layout;
- do not promote to input variants.

### Cluster I — color/file/hidden inputs

Observed shape:

```text
hidden
w-14 cursor-pointer
```

Common places:

- file import controls;
- color picker fields;
- hidden auth/server-action inputs.

Recommended handling:

- no shared variant needed now;
- `Input` already handles `type="color"` with cursor/padding defaults;
- hidden/file inputs are behavior-specific plumbing.

## Safe implementation plan

### PR A — Button action recipe audit codification

Scope:

- create a small documented helper only if exact duplicates are confirmed in files under one feature area;
- start with `features/guide-catalog` or `features/global-purchases`, not the whole app.

Allowed changes:

- class recipe extraction inside one feature;
- no JSX structure changes;
- no variant API changes.

### PR B — Catalog/filter pill adapter audit

Scope:

- inspect catalog category/filter controls;
- decide whether a feature-level `CatalogChipButton` adapter is justified.

Allowed changes:

- feature-level adapter only;
- no global `Button` radius changes.

### PR C — Input numeric/table cleanup

Scope:

- inspect numeric inputs in room params/execution/table cells;
- replace manual `tabular-nums` with `numeric` only where behavior and style are identical.

Allowed changes:

- prop-level cleanup only;
- no table layout width changes.

## Explicit non-goals

- Do not add broad new global Button variants based only on class repetition.
- Do not change `Button` default radius, height, font weight, or focus styles.
- Do not change `Input` default size or focus ring.
- Do not normalize layout-only classes like `w-full`, `flex-1`, `col-span-*`, `w-24`.
- Do not touch DB/schema/server actions.
- Do not mix landing page visual cleanup with shared UI cleanup.

## Recommended next PR

Start with a narrow implementation PR in `features/guide-catalog` or `features/global-purchases` to extract the repeated action button class recipe into a local constant/helper.

This should be a small, mechanically verifiable cleanup, not a visual redesign.
