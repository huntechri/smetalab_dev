# AGENTS.md — инструкции для coding agents в SmetaLab

## Назначение

Этот файл задаёт рабочие правила для AI/coding agents, которые вносят изменения в репозиторий `smetalab_dev`.

Главная текущая цель проекта: перейти от запутанного legacy UI к чистому UI v2, который пересобирается экран за экраном на plain shadcn/ui primitives.

Не пытайся «улучшать всё сразу». Работай маленькими PR с одним смыслом.

## Текущий стратегический контекст

В проекте существуют две зоны:

```txt
Legacy app  -> текущий рабочий продукт
UI v2       -> новая параллельная пересборка интерфейса
```

Legacy UI пока остаётся рабочим.

UI v2 не является рефакторингом старого UI. UI v2 — это новая чистая линия разработки, где экран сначала собирается на mock data, утверждается визуально и только потом подключается к backend.

Документация UI v2 находится здесь:

```txt
docs/ui-v2/README.md
docs/ui-v2/ARCHITECTURE.md
docs/ui-v2/COMPONENT_POLICY.md
docs/ui-v2/SCREEN_MAP.md
docs/ui-v2/MIGRATION_PLAN.md
```

Перед любой задачей по UI v2 агент обязан прочитать эти документы.

## Технологический стек

- Framework: Next.js 15+ App Router
- Language: TypeScript strict mode
- Styling: Tailwind CSS 4
- UI: shadcn/ui + Radix UI
- Database: Postgres + Drizzle ORM
- Auth/RBAC: custom auth + tenant-aware permissions
- Payments: Stripe
- Email: Resend
- Package manager: pnpm
- Tests: Vitest, Playwright where applicable

## Главный принцип работы

Сначала понять слой, потом писать код.

Не смешивай:

```txt
UI v2
Legacy UI
backend
database
server actions
infrastructure
```

Если задача касается только документации — не меняй runtime.

Если задача касается только UI — не меняй backend.

Если задача касается только backend — не меняй UI без явного требования.

Если решение спорное — не выбирай молча. Зафиксируй trade-off и вынеси на обсуждение.

## Архитектурные источники правды

### Для UI v2

Использовать только:

```txt
docs/ui-v2/**
```

### Для текущего legacy-приложения

Использовать:

```txt
ARCHITECTURE.md
```

Legacy-документы по старому UI/refactor/audit удаляются или считаются устаревшими. Не восстанавливай их без отдельного решения.

## UI v2: обязательные правила

### 1. UI v2 строится отдельно

Целевые зоны UI v2:

```txt
app/(ui-v2)/**
components/ui/**
components/app-shell/**
features-v2/**
```

### 2. Сначала mock data

Для каждого нового экрана порядок такой:

```txt
1. screen spec
2. mock data
3. static UI
4. desktop review
5. mobile review
6. empty state
7. loading skeleton
8. dialogs/sheets if needed
9. UX approval
10. backend integration
11. legacy route replacement
12. legacy deletion
```

Backend нельзя подключать до утверждения UI.

### 3. Использовать plain shadcn/ui primitives

В UI v2 разрешённый источник UI primitives:

```txt
@/components/ui/*
```

Пример:

```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table } from "@/components/ui/table"
```

### 4. Legacy UI запрещён в UI v2

В UI v2 запрещены импорты:

```txt
@/shared/ui/*
@repo/ui
@/features/_shared/*
old DataTableShell
old CardShell
old Surface
old PageShell
old CatalogTableWrapper
old DirectoryListScreen
```

Если новый UI v2 файл импортирует что-то из legacy UI, это архитектурная ошибка.

### 5. Не создавать новую дизайн-систему

В UI v2 запрещено преждевременно создавать wrappers:

```txt
Surface
CardShell
PageShell
DataTableShell
TableShell
DialogShell
FormShell
ToolbarShell
GenericCrudDialog
UniversalDataTable
```

Разрешены feature-specific components:

```txt
ProjectsScreen
ProjectsTable
ProjectCard
ProjectFormDialog
ProjectDeleteDialog
MaterialsTable
WorksTable
PurchasesTable
EstimateTable
```

Правило: сначала прямой shadcn composition, extraction только после реального повторения минимум в трёх утверждённых экранах.

### 6. Первый экран UI v2

Первый целевой экран:

```txt
Projects List
```

Не начинать с Estimate Detail. Страница сметы слишком сложная для первого прохода и может снова создать архитектурный клубок.

## Legacy UI: правила работы

Legacy UI пока можно поддерживать, если задача явно требует исправить текущий экран.

Но нельзя:

- начинать новые UI v2 экраны на `shared/ui`;
- тащить legacy wrappers в `features-v2`;
- расширять старую UI governance систему;
- добавлять новые UI audit scripts;
- возвращать удалённые legacy UI/refactor docs;
- делать широкий refactor legacy UI без отдельного решения.

Если задача требует исправления legacy UI, меняй только минимально необходимый участок.

## Backend и database правила

### Data layer

- DB schema, queries и repositories находятся в `lib/data/**`.
- Drizzle schema и migrations должны быть синхронизированы.
- Не импортируй UI, `features/**` или React в `lib/data/**`.
- Tenant-aware таблицы должны фильтроваться через актуальные tenant guards/helpers проекта.

### Service/domain layer

- Бизнес-логика не должна жить в route components.
- Server actions должны оставаться тонкими: auth/permission guard, validation, вызов service/domain/data, invalidation.
- Не переносить UI-типы в backend-слои.
- Client components не должны импортировать DB row types напрямую из schema.

### Mutations

Перед любой mutation обязательны:

```txt
input validation
authorization check
tenant boundary check
transaction for multi-table writes
```

## TypeScript правила

- Strict typing.
- Не добавлять `any`, кроме случаев, где это явно уже разрешено локальной legacy-зоной.
- Для внешнего input использовать Zod или существующую validation-схему проекта.
- Не ломать public exports без необходимости.
- Не создавать circular imports.

## Testing и verification

CI сейчас переведён на ручной запуск через `workflow_dispatch`.

Audit scripts отключены и не должны запускаться в CI.

Не добавляй обратно:

```txt
audit:ui*
audit:ui-inventory*
audit:buttons
audit:inputs
audit:test-db-boundaries*
audit:unused
audit:deps
audit:imports
audit:lib-feature-imports
audit:legacy-compat-imports
```

Базовая локальная проверка для runtime code:

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

Для documentation-only PR проверки можно не запускать, если не менялся runtime code. В таком случае явно указать в PR/ответе: `runtime code не менялся, тесты не запускались`.

Не утверждай, что тесты прошли, если они не запускались.

## CI/CD правила

Основной workflow должен запускаться вручную:

```yaml
on:
  workflow_dispatch:
```

Не возвращай автоматические triggers без отдельного решения:

```txt
push
pull_request
```

Не возвращай UI audit workflows.

Preview/production deploy не должен становиться автоматическим побочным эффектом UI v2 documentation/scaffold задач.

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
legacy cleanup + new feature
```

## Что нельзя делать без явного запроса

- Не создавать `.tsx` файлы в documentation-only задачах.
- Не менять `components.json` без отдельного решения.
- Не менять ESLint без отдельного решения.
- Не удалять runtime code только потому, что он выглядит legacy.
- Не менять database schema без отдельного решения.
- Не запускать массовые codemods.
- Не подключать backend к UI v2 mock screen раньше UX approval.
- Не добавлять новые shared wrappers ради одного экрана.
- Не восстанавливать удалённые audit workflows.

## Формат ответа агента после работы

В конце задачи агент должен кратко указать:

```txt
Что изменено
Какие файлы затронуты
Что не менялось
Какие проверки запускались
Какие проверки не запускались и почему
Есть ли спорные решения
```

Если были внесены изменения в GitHub PR, дать ссылку на PR.

## Текущий курс проекта

Курс проекта: остановить бесконечный legacy UI refactor и перейти к чистой UI v2 пересборке.

Основное правило:

```txt
Не лечить старый UI бесконечно.
Строить новый UI v2 маленькими проверяемыми шагами.
```
