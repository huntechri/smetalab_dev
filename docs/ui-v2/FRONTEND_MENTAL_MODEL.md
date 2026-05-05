# UI v2 Frontend Mental Model

## Цель

Этот документ объясняет простыми словами, как работает frontend в UI v2: что откуда рендерится, где управляются размеры, где лежит экран, где лежат компоненты и как контролировать работу агента.

Документ написан для владельца продукта и для coding agents. Он не требует глубокого знания React.

## Главная схема

Frontend в Next.js App Router можно понимать как цепочку:

```txt
URL в браузере
  -> app route
  -> page.tsx
  -> feature screen
  -> feature components
  -> shadcn/ui primitives
  -> HTML в браузере
```

Для UI v2 целевая схема такая:

```txt
app/(ui-v2)/v2/projects/page.tsx
  -> features-v2/projects/components/projects-screen.tsx
    -> projects-table.tsx
    -> projects-grid.tsx
    -> project-card.tsx
    -> project-status-badge.tsx
      -> components/ui/button.tsx
      -> components/ui/card.tsx
      -> components/ui/table.tsx
      -> components/ui/badge.tsx
```

## Что такое route

Route — это путь в браузере.

Пример:

```txt
/app/v2/projects
```

В Next.js route создаётся папками внутри `app/**`.

Пример:

```txt
app/(ui-v2)/v2/projects/page.tsx
```

Файл `page.tsx` — это входная точка экрана.

## Что должен делать page.tsx

`page.tsx` должен быть тонким.

Хорошо:

```tsx
import { ProjectsScreen } from "@/features-v2/projects"

export default function ProjectsPage() {
  return <ProjectsScreen />
}
```

Плохо:

```tsx
export default function ProjectsPage() {
  // много JSX
  // таблица
  // карточки
  // фильтры
  // dialogs
  // бизнес-логика
}
```

Правило:

```txt
page.tsx только подключает экран.
Сам экран живёт в features-v2.
```

## Что такое feature screen

Feature screen — это главный компонент конкретного экрана.

Пример:

```txt
features-v2/projects/components/projects-screen.tsx
```

Он собирает экран из частей:

```txt
ProjectsScreen
├── ProjectsHeader
├── ProjectsToolbar
├── ProjectsTable
├── ProjectsGrid
├── ProjectsEmptyState
└── ProjectsLoadingSkeleton
```

Feature screen отвечает за композицию экрана, но не должен превращаться в огромный файл на 500 строк.

## Что такое feature component

Feature component — это часть конкретного экрана.

Примеры:

```txt
ProjectsTable
ProjectsGrid
ProjectCard
ProjectStatusBadge
ProjectProgress
ProjectActionsMenu
```

Это не дизайн-система. Это детали одного feature.

Хорошо:

```txt
ProjectStatusBadge
ProjectProgress
ProjectsTable
```

Плохо:

```txt
UniversalStatusBadge
UniversalProgress
GenericEntityTable
```

Правило:

```txt
В начале делаем конкретные компоненты под экран.
Не делаем универсальные компоненты раньше времени.
```

## Что такое shadcn/ui primitive

shadcn/ui primitive — это готовая базовая деталь интерфейса.

Примеры:

```txt
Button
Input
Card
Table
Dialog
Sheet
Badge
Skeleton
DropdownMenu
```

В UI v2 они должны импортироваться только из:

```txt
@/components/ui/*
```

Хорошо:

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
```

Плохо:

```tsx
import { Button } from "@/shared/ui/button"
```

## Где управляется размер экрана

Размер всей страницы управляется layout/container уровнем.

В UI v2 это должно быть:

```txt
components/app-shell/page-container.tsx
```

или временно простым контейнером внутри screen.

Пример:

```tsx
<div className="mx-auto w-full max-w-7xl px-4 py-6">
  <ProjectsScreen />
</div>
```

Но важно: не каждый компонент должен сам решать максимальную ширину страницы.

Правило:

```txt
Ширина страницы задаётся на верхнем уровне.
Карточки и таблицы не должны сами задавать глобальный container.
```

## Где управляются отступы

Есть 3 уровня отступов.

### 1. Page spacing

Отступы всей страницы:

```tsx
<div className="space-y-6">
```

Это нормально для screen.

### 2. Section spacing

Отступы между блоками внутри экрана:

```tsx
<div className="grid gap-4">
```

Это нормально.

### 3. Primitive internal spacing

Внутренние отступы кнопок, карточек, таблиц должны в основном идти из shadcn/ui.

Плохо, если агент вручную переписывает внутренний стиль shadcn:

```tsx
<input className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm ring-offset-background ..." />
```

Хорошо:

```tsx
<Input className="pl-9" />
```

## Что такое className

`className` — это Tailwind-стили.

В UI v2 разрешены простые layout-классы:

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
```

Они отвечают за расположение.

Но нельзя превращать feature files в самодельную дизайн-систему.

Подозрительные классы:

```txt
bg-*
border-*
shadow-*
rounded-*
hover:*
focus:*
text-[#...]
bg-[#...]
```

Они не всегда запрещены, но требуют review. Если их много — агент уходит в кастомный UI.

## Где управляется table/grid переключение

Если экран имеет переключатель вида:

```txt
table | grid
```

то состояние может жить в `ProjectsScreen`:

```tsx
const [view, setView] = React.useState<"table" | "grid">("table")
```

Это означает: компонент должен быть client component.

Тогда сверху будет:

```tsx
"use client"
```

Это нормально для первого mock UI pass.

Но в будущем можно будет разделить:

```txt
ProjectsScreen          -> server/neutral wrapper
ProjectsViewSwitcher    -> client component
ProjectsTable/Grid      -> presentation
```

На первом этапе это не критично.

## Где живут данные

На mock phase данные живут здесь:

```txt
features-v2/projects/data/mock-projects.ts
```

Экран импортирует их так:

```tsx
import { mockProjects } from "../data/mock-projects"
```

На mock phase нельзя импортировать:

```txt
lib/data/**
lib/domain/**
app/actions/**
server actions
DB queries
```

## Как data проходит в компоненты

Правильный поток:

```txt
mock-projects.ts
  -> ProjectsScreen
  -> ProjectsTable / ProjectsGrid
  -> ProjectCard
```

Пример:

```tsx
<ProjectsTable projects={mockProjects} />
<ProjectsGrid projects={mockProjects} />
```

Это называется props.

Props — это просто данные, которые один компонент передаёт другому.

## Что такое render

Render — это когда React превращает компоненты в HTML.

Пример:

```tsx
<ProjectsTable projects={mockProjects} />
```

React вызывает функцию `ProjectsTable`, передаёт туда `projects`, получает JSX и показывает таблицу в браузере.

Упрощённо:

```txt
Component function -> JSX -> HTML on screen
```

## Где управляется responsive

Responsive — это поведение на разных размерах экрана.

В Tailwind это обычно классы:

```txt
sm:
md:
lg:
xl:
```

Пример:

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

Это значит:

```txt
mobile: 1 колонка
sm: 2 колонки
lg: 3 колонки
xl: 4 колонки
```

Правило:

```txt
Responsive задаётся там, где компонент решает раскладку.
```

Для project cards это `ProjectsGrid`.

Для всей страницы это `PageContainer` или `ProjectsScreen`.

## Где должны быть actions

Кнопка с `MoreHorizontal` не должна быть пустой.

Нужно использовать shadcn `DropdownMenu`.

Хорошо:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="Действия проекта">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>Открыть</DropdownMenuItem>
    <DropdownMenuItem>Редактировать</DropdownMenuItem>
    <DropdownMenuItem>Удалить</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Плохо:

```tsx
<Button variant="ghost">
  <MoreHorizontal />
</Button>
```

## Что такое accessibility label

Если кнопка содержит только иконку, человек и screen reader не понимают, что она делает.

Плохо:

```tsx
<Button>
  <List />
</Button>
```

Хорошо:

```tsx
<Button aria-label="Показать таблицей">
  <List />
</Button>
```

Правило:

```txt
Icon-only button всегда имеет aria-label.
```

## Минимальная структура первого экрана Projects List

```txt
features-v2/projects/
├── components/
│   ├── projects-screen.tsx
│   ├── projects-toolbar.tsx
│   ├── projects-table.tsx
│   ├── projects-grid.tsx
│   ├── project-card.tsx
│   ├── project-status-badge.tsx
│   ├── project-progress.tsx
│   ├── project-actions-menu.tsx
│   ├── projects-empty-state.tsx
│   └── projects-loading-skeleton.tsx
├── data/
│   └── mock-projects.ts
├── types.ts
└── index.ts
```

## Как понять, что агент делает правильно

Проверочный список:

```txt
1. page.tsx тонкий?
2. Экран лежит в features-v2?
3. UI primitives идут из @/components/ui/*?
4. Нет @/shared/ui/*?
5. Нет @repo/ui?
6. Нет @/features/_shared/*?
7. Нет lib/data, app/actions, server actions?
8. Есть mock data?
9. Есть normal state?
10. Есть empty state?
11. Есть loading skeleton?
12. Icon-only buttons имеют aria-label?
13. Inputs сделаны через shadcn Input?
14. Actions сделаны через DropdownMenu?
15. Нет Surface/CardShell/DataTableShell/PageShell?
```

Если ответ `нет` по пунктам 1-15 — агент должен исправить код до продолжения.

## Самое важное правило для владельца продукта

Не нужно понимать весь frontend.

Нужно контролировать только архитектурную цепочку:

```txt
route -> screen -> feature components -> shadcn primitives -> mock data
```

Если агент ломает эту цепочку, он уходит в хаос.

Если агент держит эту цепочку, UI v2 остаётся управляемым.
