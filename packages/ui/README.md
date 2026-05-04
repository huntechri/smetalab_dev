# @repo/ui — DEPRECATED

> **This package is deprecated.** Do not use in new code.

## Migration

All UI components have been moved to `@/shared/ui/*`.

### Before
```ts
import { Button } from '@repo/ui';
```

### After
```ts
import { Button } from '@/shared/ui/button';
```

## Why

The `packages/ui/` package was a temporary compatibility layer that re-exported from `shared/ui/`.
It was kept active during the migration to avoid breaking existing imports. As of Phase 15, all
consumers have been migrated to `@/shared/ui/*` directly.

## Removal

This package will be removed entirely once all pipeline references and CI scripts have been
updated to not depend on the `@repo/ui` workspace alias.
