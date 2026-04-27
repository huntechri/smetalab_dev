# Project Actions Compact — 2026-04-27

## Purpose

This PR follows the project card compact layout cleanup and targets only the action button density inside project cards.

## Surface reviewed

- `features/projects/list/components/project-actions.tsx`
- `features/projects/list/components/project-card.tsx`

## Changes in this PR

- Compact project actions now use full-width three-column grid inside the card footer.
- Compact project actions use `Button size="xs"`.
- Default project actions keep the previous button size and spacing.
- Action semantics remain unchanged:
  - open project route;
  - edit project;
  - open delete confirmation dialog.

## Explicit non-goals

- No project card layout changes beyond the action row density.
- No route changes.
- No delete/edit behavior changes.
- No server action or DB changes.
- No global `Button` variant changes.
- No changes to the delete confirmation copy.

## Manual smoke

- Open action navigates to the project route.
- Edit action calls the existing edit handler.
- Delete action opens the existing confirmation dialog.
- Compact card footer actions fit across three columns on mobile and desktop.
