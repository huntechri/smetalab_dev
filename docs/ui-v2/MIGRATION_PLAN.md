# UI v2 Migration Plan

## Цель

Пересобрать UI SmetaLab экран за экраном без дестабилизации текущего приложения.

## Стратегия

UI v2 строится параллельно.

Legacy UI остаётся рабочим, пока конкретный экран полностью не заменён.

Не делать массовую миграцию.  
Не переписывать всё сразу.

## Фазы

```txt
Phase 0 — Documentation only
Phase 1 — UI v2 scaffold
Phase 2 — First screen with mock data
Phase 3 — First screen backend connection
Phase 4 — Replace legacy route
Phase 5 — Delete replaced legacy screen code
Phase 6 — Repeat for next screen
```

## Phase 0 — Documentation only

Scope:

```txt
docs/ui-v2/README.md
docs/ui-v2/ARCHITECTURE.md
docs/ui-v2/COMPONENT_POLICY.md
docs/ui-v2/SCREEN_MAP.md
docs/ui-v2/MIGRATION_PLAN.md
```

Разрешено:

```txt
documentation only
```

Запрещено:

```txt
.tsx files
runtime code
routes
backend
database
components.json changes
eslint changes
```

Exit criteria:

```txt
UI v2 rules documented
screen order documented
component policy documented
migration process documented
first screen selected
```

## Phase 1 — UI v2 scaffold

Scope:

```txt
components/ui/**
components/app-shell/**
features-v2/**
app/(ui-v2)/**
```

Разрешено:

```txt
empty folders
minimal route placeholders
clean shadcn primitive setup
mock data folder structure
```

Запрещено:

```txt
backend integration
legacy shared/ui imports
old wrapper reuse
large screen implementation
```

Важно:

Если меняется `components.json`, это делается только в этой фазе и только после отдельного review.

Целевой UI v2 alias:

```txt
@/components/ui
```

## Phase 2 — First screen with mock data

Первый экран:

```txt
Projects List
```

Scope:

```txt
features-v2/projects/**
app/(ui-v2)/v2/projects/page.tsx
```

Разрешено:

```txt
ProjectsScreen
ProjectsToolbar
ProjectsTable
ProjectCard
ProjectFormDialog
ProjectDeleteDialog
ProjectsEmptyState
ProjectsLoadingSkeleton
mockProjects
```

Запрещено:

```txt
real backend calls
server actions
DB imports
legacy shared/ui
generic DataTableShell
generic CardShell
generic Surface
```

Exit criteria:

```txt
desktop UI approved
mobile UI approved
normal state approved
empty state approved
loading skeleton approved
dialogs approved
no backend code
```

## Phase 3 — Backend connection for first screen

Scope:

```txt
Projects List backend adapter
```

Разрешено:

```txt
connect existing backend data
map backend DTO to UI model
preserve approved UI layout
```

Запрещено:

```txt
redesigning UI during backend integration
changing DB schema unless separately approved
large backend refactor
```

Exit criteria:

```txt
Projects List works with real data
loading state works
empty state works
error handling exists
type-check passes
tests pass where applicable
```

## Phase 4 — Replace legacy route

Scope:

```txt
replace old Projects List route with UI v2 implementation
```

Правила:

- сохранить user-facing URL;
- не заменять unrelated screens;
- не удалять старый код до проверки replacement;
- не менять backend behavior.

Exit criteria:

```txt
old route renders new UI
main app navigation works
no broken imports
build passes
```

## Phase 5 — Delete replaced legacy code

Scope:

```txt
remove old Projects List screen code only
```

Разрешено:

```txt
delete unused old screen components
delete unused old mocks
delete unused old wrappers only if no other screen uses them
```

Запрещено:

```txt
delete shared wrappers still used by other legacy screens
delete unrelated feature code
mass cleanup
```

Exit criteria:

```txt
unused code removed
imports cleaned
type-check passes
build passes
```

## Phase 6 — Repeat

Следующий экран:

```txt
Project Dashboard
```

Потом:

```txt
Materials Catalog
Works Catalog
Global Purchases
Estimate Detail
Analytics
```

## PR policy

Каждый PR должен иметь одну цель.

Хорошие PR:

```txt
docs only
scaffold only
Projects UI mock only
Projects backend only
Projects route replacement only
Projects legacy deletion only
```

Плохие PR:

```txt
docs + scaffold + screen + backend
Projects + Estimates together
UI rewrite + DB migration
component policy + visual redesign
```

## Branch policy

Рекомендуемые branch names:

```txt
ui-v2/docs-contract
ui-v2/scaffold
ui-v2/projects-mock-ui
ui-v2/projects-backend
ui-v2/projects-route-replace
ui-v2/projects-legacy-delete
```

## Stop conditions

Остановиться и вынести на review, если:

```txt
UI v2 file imports @/shared/ui/*
UI v2 file imports @repo/ui
UI v2 file imports @/features/_shared/*
generic wrapper introduced
backend connected before UI approval
Estimate Detail started before simpler screens
PR touches too many unrelated areas
```

## Финальная цель миграции

Финальное состояние:

```txt
new screens use UI v2
legacy screens are deleted after replacement
components/ui contains clean shadcn primitives
features-v2 can eventually become features
old shared/ui can be retired gradually
```
