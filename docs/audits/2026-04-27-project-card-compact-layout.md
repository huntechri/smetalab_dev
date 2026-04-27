# Project Card Compact Layout — 2026-04-27

## Purpose

This PR follows the card visual consistency audit and targets only the project summary card surface.

The goal is to reduce vertical empty space and make the existing project list cards denser without changing project data flow, actions, or business behavior.

## Surface reviewed

- `features/projects/list/components/project-card.tsx`
- `features/projects/list/components/project-actions.tsx`

## Changes in this PR

### ProjectCard

- Reduced header/content/footer padding on the card.
- Reduced vertical gaps between header, meta, metrics and progress sections.
- Kept the existing `Card` primitive.
- Kept project-specific summary card semantics separate from dense operational estimate/procurement cards.
- Changed budget/date metric blocks to a compact two-column grid on `sm+` screens.
- Moved progress into a compact bordered block and reduced progress height from `h-2` to `h-1.5`.
- Removed the internal `Separator` between metrics and progress.
- Kept `ProjectActions` unchanged.

## Explicit non-goals

- No data-flow changes.
- No route changes.
- No server action or DB changes.
- No global `Card` primitive changes.
- No shared dense card changes.
- No project action behavior changes.
- No progress calculation changes.
- No `getProgressGradient` changes.

## Manual smoke

- Project card opens the project route.
- Edit action still opens edit flow.
- Delete action still opens confirm dialog and deletes through the existing handler.
- Progress value and progress bar still match.
- Customer/address/date/budget still render with fallbacks.
