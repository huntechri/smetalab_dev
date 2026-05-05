# UI v2 Architecture

## Цель

Создать чистую параллельную UI-архитектуру для пересборки SmetaLab экран за экраном.

Архитектура должна быть простой: у каждого файла должно быть очевидное место.

## Целевая структура

```txt
app/
  (ui-v2)/
    v2/
      layout.tsx
      page.tsx
      projects/
        page.tsx
      projects/[projectId]/
        page.tsx
      projects/[projectId]/estimates/[estimateId]/
        page.tsx
      catalog/materials/
        page.tsx
      catalog/works/
        page.tsx
      purchases/
        page.tsx
      analytics/
        page.tsx

components/
  ui/
    button.tsx
    card.tsx
    input.tsx
    label.tsx
    textarea.tsx
    select.tsx
    table.tsx
    dialog.tsx
    alert-dialog.tsx
    sheet.tsx
    dropdown-menu.tsx
    tabs.tsx
    badge.tsx
    skeleton.tsx
    separator.tsx
    checkbox.tsx
    popover.tsx
    calendar.tsx

  app-shell/
    app-shell.tsx
    app-sidebar.tsx
    app-header.tsx
    page-container.tsx
    nav-main.tsx
    breadcrumbs.tsx

features-v2/
  projects/
    components/
    data/
    types.ts
    index.ts

  estimates/
    components/
    data/
    types.ts
    index.ts

  catalog/
    components/
    data/
    types.ts
    index.ts

  purchases/
    components/
    data/
    types.ts
    index.ts

  analytics/
    components/
    data/
    types.ts
    index.ts
```

## Роли папок

### `app/(ui-v2)/**`

Временные routes для UI v2.

Разрешено:

- route files;
- layout files;
- page files;
- подключение feature screen.

Запрещено:

- бизнес-логика;
- backend calls на mock phase;
- сложный client state;
- table orchestration;
- reusable UI implementation.

Route должен быть тонким:

```tsx
import { ProjectsScreen } from "@/features-v2/projects"

export default function ProjectsPage() {
  return <ProjectsScreen />
}
```

### `components/ui/**`

Чистый слой shadcn/ui primitives.

Здесь лежат только базовые shadcn-компоненты:

```txt
Button
Card
Input
Table
Dialog
AlertDialog
Sheet
Tabs
Badge
Skeleton
DropdownMenu
Select
Popover
Calendar
```

Запрещено:

```txt
ProjectsTable
EstimateTable
Surface
CardShell
DataTableShell
PageShell
MarketingShell
AdminSurface
business-specific components
backend access
feature imports
```

### `components/app-shell/**`

Минимальный каркас приложения для UI v2.

Разрешено:

```txt
sidebar
header
navigation
page container
breadcrumbs
```

Запрещено:

```txt
project-specific UI
estimate-specific UI
purchase-specific UI
analytics-specific UI
data fetching
server actions
DB access
```

### `features-v2/**`

Новые screen-level компоненты.

Разрешено:

```txt
screen components
feature-specific tables
feature-specific cards
feature-specific dialogs
feature-specific forms
mock data
local types
```

Запрещено на mock phase:

```txt
server actions
DB imports
service imports
domain imports
old feature wrappers
old shared UI wrappers
```

## Направление импортов

Разрешённое направление:

```txt
app/(ui-v2) -> features-v2
features-v2 -> components/ui
features-v2 -> components/app-shell
features-v2 -> local mock data
components/app-shell -> components/ui
components/ui -> lib/utils
```

Запрещённое направление:

```txt
features-v2 -> shared/ui
features-v2 -> @repo/ui
features-v2 -> features/_shared
features-v2 -> lib/data
features-v2 -> lib/domain
features-v2 -> lib/services
features-v2 -> app/actions

components/ui -> features-v2
components/ui -> app
components/ui -> shared/ui
```

## Legacy boundary

Старый UI остаётся рабочим, пока конкретный экран не заменён.

UI v2 не должен зависеть от legacy UI.

Legacy-код может оставаться в проекте, но не должен импортироваться в UI v2.

## Backend boundary

Backend подключается отдельным этапом.

На первом UI-проходе экран работает только на mock data.

Разрешено:

```txt
features-v2/projects/data/mock-projects.ts
features-v2/estimates/data/mock-estimate.ts
```

Запрещено:

```txt
app/actions/**
lib/data/**
lib/domain/**
lib/services/**
server-only
drizzle-orm
```

## Design-system boundary

UI v2 не должен создавать новую дизайн-систему.

Использовать shadcn/ui напрямую.

Не создавать новые primitive wrappers, пока один и тот же паттерн не повторится минимум в трёх утверждённых экранах.

Главное правило:

```txt
Сначала прямой shadcn composition.
Потом — extraction только по реальному повторению.
```

## Будущее подключение backend

После утверждения экрана на mock data можно создать backend adapter.

UI-компонент должен остаться почти без изменений.

Целевая схема:

```txt
mock data -> backend adapter -> real server data
```

Backend нельзя подключать до утверждения UI.
