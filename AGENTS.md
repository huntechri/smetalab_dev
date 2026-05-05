# AGENTS.md — правила для coding agents в SmetaLab

## Назначение

Этот файл задаёт обязательные правила для AI/coding agents, которые работают в репозитории `smetalab_dev`.

Главная текущая цель проекта: остановить бесконечный legacy UI refactor и перейти к чистой UI v2 пересборке экран за экраном.

Frontend в UI v2 должен строиться по принципу:

```txt
plain shadcn/ui primitives first
mock data first
backend later
no legacy UI wrappers
```

Не пытайся улучшать всё сразу. Работай маленькими PR с одним смыслом.

## Главный курс проекта

В проекте есть две зоны:

```txt
Legacy app  -> текущий рабочий продукт
UI v2       -> новая параллельная пересборка интерфейса
```

Legacy UI пока остаётся рабочим.

UI v2 не является рефакторингом старого UI. UI v2 — это новая чистая линия разработки, где экран сначала собирается на mock data, утверждается визуально и только потом подключается к backend.

## Обязательное чтение перед UI-задачами

Перед любой задачей по frontend/UI v2 агент обязан прочитать:

```txt
docs/ui-v2/README.md
docs/ui-v2/ARCHITECTURE.md
docs/ui-v2/COMPONENT_POLICY.md
docs/ui-v2/SCREEN_MAP.md
docs/ui-v2/MIGRATION_PLAN.md
docs/ui-v2/FRONTEND_MENTAL_MODEL.md
```

Если задача касается frontend, но агент не учитывает эти документы, результат считается архитектурно недействительным.

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

## Главная модель frontend

Frontend UI v2 строится по цепочке:

```txt
URL
  -> app route
  -> page.tsx
  -> feature screen
  -> feature components
  -> shadcn/ui primitives
  -> browser UI
```

Для Projects List пример цепочки:

```txt
/app/v2/projects
  -> app/(ui-v2)/v2/projects/page.tsx
  -> features-v2/projects/components/projects-screen.tsx
  -> projects-table.tsx / projects-grid.tsx / project-card.tsx
  -> components/ui/button.tsx / input.tsx / card.tsx / table.tsx
```

Не смешивай эти уровни.

## Frontend source of truth

Для UI v2 использовать только:

```txt
components/ui/**          -> shadcn/ui primitives
components/app-shell/**   -> app shell/layout только при необходимости
features-v2/**            -> новые feature screens/components
app/(ui-v2)/**            -> временные v2 routes
```

Legacy source для старых экранов может оставаться, но UI v2 не должен от него зависеть.

## SHADCN-FIRST RULES — ОБЯЗАТЕЛЬНО

### 1. Всегда использовать shadcn/ui primitives

Для frontend UI v2 все базовые элементы должны идти из `@/components/ui/*`.

Разрешено:

```txt
@/components/ui/button
@/components/ui/input
@/components/ui/card
@/components/ui/table
@/components/ui/dialog
@/components/ui/sheet
@/components/ui/dropdown-menu
@/components/ui/badge
@/components/ui/skeleton
@/components/ui/alert-dialog
@/components/ui/select
@/components/ui/tabs
@/components/ui/checkbox
@/components/ui/popover
@/components/ui/calendar
```

Запрещено рисовать руками то, что уже есть в shadcn/ui.

Нельзя вручную создавать:

```txt
custom button
custom input
custom card
custom table
custom dialog
custom sheet
custom dropdown
custom badge
custom skeleton
```

Если в `components/ui/*` нет нужного shadcn primitive, сначала добавить его через shadcn setup/scaffold в правильную директорию. Не создавать самодельную замену в feature.

### 2. Никаких native controls вместо shadcn controls

В UI v2 запрещено использовать native HTML controls как визуальные primitives, если есть shadcn-аналог.

Запрещено как UI primitive:

```txt
<button>
<input>
<select>
<textarea>
<table>
<dialog>
```

Разрешено использовать native HTML только как структурные элементы:

```txt
<div>
<section>
<header>
<main>
<nav>
<ul>
<li>
<span>
<p>
```

Правило:

```txt
Button -> использовать shadcn Button
Input -> использовать shadcn Input
Select -> использовать shadcn Select
Table -> использовать shadcn Table
Dialog -> использовать shadcn Dialog / AlertDialog
Dropdown -> использовать shadcn DropdownMenu
```

### 3. Не копировать внутренние shadcn classes руками

Запрещено вручную копировать классы shadcn primitive в feature-файлы.

Плохой признак:

```txt
feature component содержит длинный className для input/button/card/table:
rounded-md border border-input bg-background ring-offset-background focus-visible:ring-2 hover:bg-...
```

Это означает, что агент рисует primitive руками.

Правило:

```txt
Внешний layout можно задавать в feature.
Внутренний вид Button/Input/Card/Table должен идти из shadcn primitive.
```

### 4. `className` в feature files только для layout

В `features-v2/**` разрешены простые layout classes:

```txt
flex
grid
gap-*
space-y-*
items-*
justify-*
w-full
max-w-*
min-w-0
p-*
px-*
py-*
hidden
block
md:*
lg:*
xl:*
```

Подозрительные visual classes требуют review:

```txt
bg-*
border-*
shadow-*
rounded-*
hover:*
focus:*
text-[#...]
bg-[#...]
class-variance-authority
complex class maps
```

Не запрещай layout, но не строй новую дизайн-систему внутри feature.

### 5. Размеры и варианты компонентов задавать через shadcn props

Для shadcn primitives использовать штатные props:

```txt
Button size
Button variant
Badge variant
Dialog structure
Table structure
DropdownMenu structure
```

Не задавать размер кнопки руками через повторяющиеся классы:

```txt
h-8 w-8 px-3 py-2 rounded-md border bg-...
```

Идея:

```txt
один Button + одинаковый size + одинаковый variant = одинаковая кнопка во всех местах
```

Если нужно изменить визуал всех кнопок, менять `components/ui/button.tsx`, а не каждый экран.

### 6. Icon-only buttons должны иметь accessibility label

Любая кнопка только с иконкой обязана иметь понятный `aria-label`.

Примеры смыслов:

```txt
Показать таблицей
Показать карточками
Действия проекта
Открыть меню
Удалить проект
```

Если icon-only button без accessible label — это ошибка.

### 7. Actions делать через DropdownMenu

Кнопка с троеточием `MoreHorizontal` не должна быть пустой.

Для row/card actions использовать shadcn `DropdownMenu`.

Actions обычно:

```txt
Открыть
Редактировать
Удалить
```

Запрещено оставлять пустую кнопку с `MoreHorizontal`, если она выглядит как actions menu.

### 8. Dialog/Sheet только через shadcn

Create/edit/delete UI делать через shadcn primitives:

```txt
Dialog
Sheet
AlertDialog
```

Запрещены ранние generic wrappers:

```txt
GenericCrudDialog
EntityFormDialog
AppDialogShell
DialogShell
FormShell
```

Feature-specific dialogs разрешены:

```txt
ProjectFormDialog
ProjectDeleteDialog
EstimateCoefficientDialog
PurchaseFormSheet
```

## UI v2 layout rules

### 1. `page.tsx` должен быть тонким

`page.tsx` только подключает feature screen.

Запрещено в `page.tsx`:

```txt
таблицы
карточки
toolbar JSX
dialogs
forms
backend calls
business logic
large client state
```

### 2. Screen собирает экран

`features-v2/<feature>/components/<feature>-screen.tsx` отвечает за композицию:

```txt
Header
Toolbar
Content
Empty
Loading
Dialogs/Sheets if needed
```

Screen не должен превращаться в файл на 500 строк.

### 3. Feature components должны быть конкретными

Разрешено:

```txt
ProjectsScreen
ProjectsHeader
ProjectsToolbar
ProjectsTable
ProjectsGrid
ProjectCard
ProjectStatusBadge
ProjectProgress
ProjectActionsMenu
ProjectsEmptyState
ProjectsLoadingSkeleton
```

Запрещено на раннем этапе:

```txt
UniversalDataTable
GenericEntityTable
UniversalCard
UniversalStatusBadge
ReusableCrudScreen
```

Не абстрагировать раньше времени.

### 4. Desktop/mobile layout

Для списка проектов предпочтительная модель:

```txt
desktop -> ProjectsTable
mobile  -> ProjectsGrid / ProjectCard
```

Данные должны быть одни и те же.

Запрещено:

```txt
отдельный mobile route
отдельный backend для mobile
дублирование data loading
ручной переключатель table/grid без требования
```

## UI v2 data rules

### 1. Сначала mock data

На первом UI pass использовать только local mock data:

```txt
features-v2/<feature>/data/mock-*.ts
```

Пример:

```txt
features-v2/projects/data/mock-projects.ts
```

### 2. Backend не подключать до UX approval

На mock phase запрещено импортировать:

```txt
lib/data/**
lib/domain/**
lib/services/**
app/actions/**
server actions
DB queries
drizzle-orm
server-only
```

### 3. Экран должен иметь состояния

Каждый screen обязан иметь:

```txt
normal state
empty state
loading skeleton
```

Error state обязателен после backend integration.

## Legacy UI forbidden in UI v2

В `features-v2/**` и `app/(ui-v2)/**` запрещены импорты:

```txt
@/shared/ui/*
@repo/ui
@/features/_shared/*
```

Запрещено использовать legacy wrappers:

```txt
DataTableShell
CardShell
Surface
PageShell
CatalogTableWrapper
DirectoryListScreen
ActionMenu из старого shared слоя
```

Если агент импортирует legacy UI в UI v2 — остановить работу и исправить архитектуру.

## Запрет новой дизайн-системы

UI v2 не должен создавать вторую кастомную дизайн-систему.

Запрещено преждевременно создавать:

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

Правило extraction:

```txt
Сначала 3 утверждённых экрана на прямой shadcn composition.
Только потом выносить повторяющиеся patterns.
```

## Backend и database rules

### Data layer

- DB schema, queries и repositories находятся в `lib/data/**`.
- Drizzle schema и migrations должны быть синхронизированы.
- Не импортировать UI, React или `features/**` в `lib/data/**`.
- Tenant-aware таблицы должны фильтроваться через актуальные tenant guards/helpers проекта.

### Service/domain layer

- Бизнес-логика не должна жить в route components.
- Server actions должны быть тонкими: auth/permission guard, validation, вызов service/domain/data, invalidation.
- Client components не должны импортировать DB row types напрямую из schema.

### Mutations

Перед mutation обязательны:

```txt
input validation
authorization check
tenant boundary check
transaction for multi-table writes
```

## TypeScript rules

- Strict typing.
- Не добавлять `any`, кроме явно обоснованных legacy edge cases.
- Для внешнего input использовать Zod или существующую validation-схему.
- Не ломать public exports без необходимости.
- Не создавать circular imports.

## Testing и verification

CI сейчас переведён на ручной запуск через `workflow_dispatch`.

Audit scripts отключены и не должны запускаться в CI.

Не добавлять обратно:

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

Для documentation-only PR проверки можно не запускать, если runtime code не менялся. В ответе/PR нужно честно указать: `runtime code не менялся, тесты не запускались`.

Не утверждать, что тесты прошли, если они не запускались.

## CI/CD rules

Основной workflow должен запускаться вручную:

```yaml
on:
  workflow_dispatch:
```

Не возвращать автоматические triggers без отдельного решения:

```txt
push
pull_request
```

Не возвращать UI audit workflows.

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

## Запрещено без явного запроса

- Создавать `.tsx` файлы в documentation-only задачах.
- Менять `components.json` без отдельного решения.
- Менять ESLint без отдельного решения.
- Удалять runtime code только потому, что он выглядит legacy.
- Менять database schema без отдельного решения.
- Запускать массовые codemods.
- Подключать backend к UI v2 mock screen раньше UX approval.
- Добавлять shared wrappers ради одного экрана.
- Восстанавливать удалённые audit workflows.
- Создавать самодельные UI primitives вместо shadcn/ui.

## Agent self-check before finishing frontend task

Перед завершением frontend/UI задачи агент обязан проверить:

```txt
1. page.tsx тонкий?
2. Экран лежит в features-v2?
3. UI primitives импортируются из @/components/ui/*?
4. Нет @/shared/ui/*?
5. Нет @repo/ui?
6. Нет @/features/_shared/*?
7. Нет lib/data/app/actions/server actions на mock phase?
8. Используются shadcn Button/Input/Card/Table/Dialog/etc, а не native controls?
9. Нет ручного копирования shadcn classes в feature files?
10. Есть normal state?
11. Есть empty state?
12. Есть loading skeleton?
13. Icon-only buttons имеют aria-label?
14. Row/card actions используют DropdownMenu?
15. Нет Surface/CardShell/DataTableShell/PageShell/UniversalDataTable?
```

Если хотя бы один пункт нарушен, исправить до завершения задачи.

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

## Финальное правило

```txt
Не лечить старый UI бесконечно.
Не лепить primitives руками.
Не строить новую дизайн-систему.
Строить UI v2 маленькими шагами на plain shadcn/ui.
```
