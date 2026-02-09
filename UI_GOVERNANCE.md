# UI Governance

This document outlines the rules for building and maintaining UI components in **Smetalab v2**.

## 1. Storybook & Components

- **Must have stories**: Every new UI component must have a corresponding `.stories.tsx` file in the same directory.
- **Atomic Design**: Prefer small, reusable components.
- **Accessibility**: Use semantic HTML and Radix UI primitives.

## 2. Visual Regression Testing (Loki)

- **Catch shifts**: Any change in padding, margins, or layout will be caught by Loki.
- **Local verification**: Run `pnpm test:ui` before committing.
- **Auto-check**: The `pnpm dev:ui` command runs a watcher that executes Loki on every save.
- **Stable stories**:
  - Animations are automatically disabled in Storybook per `.storybook/preview.tsx`.
  - Do not use random data or non-deterministic logic in stories.
  - Viewports are fixed for consistency.

## 3. PR / CI Protection (Chromatic)

- **Mandatory check**: Every PR runs Chromatic.
- **Blocking**: PRs cannot be merged if there are unapproved visual changes.
- **Approval**: Designers or Lead Architects must approve visual changes in the Chromatic UI.

## 4. Commands

- `pnpm storybook`: Start Storybook development server.
- `pnpm test:ui`: Run local visual regression tests.
- `pnpm test:ui:update`: Update baseline screenshots (use when changes are intentional).
- `pnpm dev:ui`: Start Storybook and the visual regression watcher together.
