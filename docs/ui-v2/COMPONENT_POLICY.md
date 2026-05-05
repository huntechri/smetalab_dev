# UI v2 Component Policy

## Цель

Сохранить UI v2 простым.

Использовать shadcn/ui primitives напрямую и не создавать вторую кастомную UI-систему.

## Категории компонентов

В UI v2 есть только 4 категории:

```txt
1. Shadcn primitives
2. App shell components
3. Feature components
4. Mock data / types
```

## 1. Shadcn primitives

Расположение:

```txt
components/ui/**
```

Примеры:

```txt
button.tsx
card.tsx
input.tsx
table.tsx
dialog.tsx
sheet.tsx
tabs.tsx
badge.tsx
skeleton.tsx
dropdown-menu.tsx
alert-dialog.tsx
```

Правила:

- primitives должны быть generic;
- primitives не импортируют features;
- primitives не импортируют app routes;
- primitives не импортируют backend;
- primitives не содержат бизнес-логику SmetaLab.

Правильно:

```tsx
import { Button } from "@/components/ui/button"
```

Неправильно:

```tsx
import { Button } from "@/shared/ui/button"
```

## 2. App shell components

Расположение:

```txt
components/app-shell/**
```

Примеры:

```txt
app-shell.tsx
app-sidebar.tsx
app-header.tsx
page-container.tsx
nav-main.tsx
breadcrumbs.tsx
```

Правила:

- shell components описывают каркас приложения;
- shell components могут использовать shadcn primitives;
- shell components не содержат feature-specific UI;
- shell components не грузят бизнес-данные.

Разрешено:

```txt
navigation labels
layout composition
responsive shell behavior
```

Запрещено:

```txt
project tables
estimate tables
purchase forms
analytics charts with real data
server actions
DB queries
```

## 3. Feature components

Расположение:

```txt
features-v2/<feature>/components/**
```

Примеры:

```txt
features-v2/projects/components/projects-screen.tsx
features-v2/projects/components/projects-table.tsx
features-v2/projects/components/project-card.tsx
features-v2/projects/components/project-form-dialog.tsx
```

Правила:

- feature components собирают экран из shadcn primitives;
- feature components могут использовать local mock data;
- feature components могут использовать local types;
- feature components не должны становиться design-system components;
- feature components должны оставаться рядом с экраном.

Правильно:

```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table } from "@/components/ui/table"
import { mockProjects } from "../data/mock-projects"
```

Неправильно:

```tsx
import { Button } from "@/shared/ui/button"
import { Surface } from "@/shared/ui/surface"
import { CardShell } from "@/shared/ui/card-shell"
import { DataTableShell } from "@/shared/ui/shells/data-table-shell"
import { DirectoryListScreen } from "@/features/_shared/directories"
import { getProjects } from "@/lib/data/projects"
```

## 4. Mock data и types

Расположение:

```txt
features-v2/<feature>/data/**
features-v2/<feature>/types.ts
```

Правила:

- mock data должны быть локальными для feature;
- mock data должны отражать реальные UI-состояния;
- mock data должны включать достаточно записей для проверки table/card layout;
- mock data должны включать edge cases.

Нужные mock states:

```txt
normal data
empty data
long names
missing optional fields
archived/disabled items
large money values
old dates
```

## Правила стилизации

UI v2 использует shadcn defaults.

В feature files можно использовать минимальные Tailwind layout classes.

Разрешены layout classes:

```txt
flex
grid
gap-*
space-y-*
items-*
justify-*
min-w-0
w-full
max-w-*
p-*
px-*
py-*
```

Эти классы нужны только для компоновки экрана.

Избегать кастомных visual classes в feature files.

Избегать:

```txt
custom colors
custom shadows
custom border systems
custom hover states
custom focus states
arbitrary color values
arbitrary spacing values
complex class maps
class-variance-authority in feature components
```

Запрещённые примеры:

```tsx
<div className="bg-[#0B0A0F] text-[#FF6A3D] shadow-xl">
<Button className="bg-blue-600 hover:bg-blue-700">
<Card className="border-2 border-orange-500 shadow-lg">
```

Разрешённые примеры:

```tsx
<div className="space-y-6">
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
<div className="flex items-center justify-between gap-3">
```

## Wrapper policy

Не создавать wrappers вокруг shadcn primitives, пока паттерн не повторился минимум в трёх утверждённых экранах.

Запрещённые ранние wrappers:

```txt
Surface
CardShell
PageShell
DataTableShell
TableShell
DialogShell
FormShell
ToolbarShell
```

Разрешённые feature components:

```txt
ProjectsToolbar
ProjectsTable
ProjectCard
ProjectFormDialog
EstimateTable
PurchaseForm
AnalyticsOverview
```

## Table policy

Не создавать универсальную таблицу в начале.

Разрешено:

```txt
ProjectsTable
MaterialsTable
WorksTable
PurchasesTable
EstimateTable
```

Запрещено:

```txt
UniversalDataTable
DataTableShell
GenericEntityTable
```

Причина:

У каждой таблицы свои требования:

```txt
columns
filters
row actions
mobile layout
inline editing
empty state
future backend connection
```

Сначала делаем specific tables.  
Extract — только после повторения паттернов.

## Dialog policy

Использовать shadcn `Dialog`, `Sheet`, `AlertDialog` напрямую.

Разрешено:

```txt
ProjectFormDialog
ProjectDeleteDialog
EstimateCoefficientDialog
PurchaseFormSheet
```

Запрещено:

```txt
GenericCrudDialog
EntityFormDialog
AppDialogShell
```

## Form policy

Использовать shadcn form primitives и `react-hook-form` только когда это реально нужно.

На первом static UI pass формы могут быть визуальными, с local state или вообще без submit behavior.

Не подключать формы к server actions на mock phase.

## Empty/loading/error policy

Каждый экран должен иметь:

```txt
normal state
empty state
loading skeleton
```

Error state обязателен только после backend connection.

## Naming policy

Использовать конкретные feature names.

Хорошо:

```txt
ProjectsScreen
ProjectsTable
ProjectCard
ProjectFormDialog
ProjectDeleteDialog
```

Плохо:

```txt
EntityScreen
UniversalTable
DataView
GenericCard
CrudDialog
```

## Главное правило

Не абстрагировать раньше времени.

Первые три экрана строятся прямой композицией shadcn/ui.

Shared extraction допускается только после реального повторения.
