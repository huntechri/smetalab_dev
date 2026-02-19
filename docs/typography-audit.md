# Typography Audit (Headings, Subheadings, Body Lines)

## Scope
- Reviewed `app/**/*.tsx` and `components/**/*.tsx` for typography usage.
- Focused on:
  1. Headings
  2. Subheadings
  3. Body lines
- Additional requirement from product: no bold fonts in tables.

## Current Snapshot
Automated scan across `.tsx` files:

- Heading tags: `h1: 23`, `h2: 13`, `h3: 4`, `h4: 3`
- Font weights: `font-bold: 48`, `font-semibold: 68`, `font-medium: 114`
- Font sizes: `text-xs: 151`, `text-sm: 211`, `text-base: 20`, `text-lg: 29`, `text-xl: 13`, `text-2xl: 26`

## Risks to Visual Consistency
- Multiple sizing/weight combinations are used for semantic headings (`h1`, `h2`, card titles, page titles), which can make screens feel inconsistent.
- Subheading patterns vary (`text-sm font-medium`, `text-base font-bold`, `text-lg font-semibold`, etc.).
- Body line styles are mostly `text-sm`, but mixed with `text-xs` in places that look like regular content instead of helper text.
- Table-related typography had bold-ish styles in headers/footers (`font-semibold` / `font-medium`), conflicting with the non-bold table requirement.

## Standardization Baseline
Recommended baseline for immediate consistency:

- **Heading (H1 / page title)**: `text-2xl font-medium tracking-tight`
- **Section heading (H2/H3 / block title)**: `text-lg font-medium`
- **Subheading / meta title**: `text-sm font-medium`
- **Body line**: `text-sm font-normal`
- **Helper / caption**: `text-xs font-normal text-muted-foreground`
- **Table header / cells / footer**: `font-normal` only

## Implemented in this pass
- Removed non-normal weights from shared table primitives:
  - `components/ui/table.tsx`: `TableHead` and `TableFooter` now use `font-normal`.
- Removed non-normal header weight in virtualized table:
  - `components/ui/data-table.tsx`: both table header render paths now use `font-normal`.

## Next Step Plan (for full unification)
1. Introduce reusable typography tokens/classes (`heading-1`, `heading-2`, `subheading`, `body`, `caption`) in global styles.
2. Apply to all page-level headings in `app/**`.
3. Apply to card headers and section labels for cross-screen consistency.
4. Keep tables strictly `font-normal` unless an explicit product exception is approved.
