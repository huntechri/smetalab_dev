# UI v2 Screen Map

## Цель

Определить порядок пересборки экранов до написания UI-кода.

Главная задача — не начать с самого сложного экрана и не пересоздать старую сложность.

## Рекомендуемый порядок

```txt
1. Projects List
2. Project Dashboard
3. Materials Catalog
4. Works Catalog
5. Global Purchases
6. Estimate Detail
7. Estimate Execution
8. Estimate Procurement
9. Analytics
10. Settings / Team / Permissions
```

## Почему такой порядок

Начинать нужно с экранов, которые достаточно репрезентативны, но не экстремально сложны.

Не начинать с Estimate Detail, потому что там есть:

```txt
nested work/material rows
virtualized table behavior
inline editing
coefficients
plan/fact data
procurement aggregation
execution tracking
future backend complexity
```

Projects List лучше подходит для первого экрана, потому что там есть типичный SaaS CRUD:

```txt
cards
table
search
filters
create/edit/delete dialogs
empty state
mobile layout
```

## Экран 1 — Projects List

Основной route:

```txt
/app/projects
```

Временный UI v2 route:

```txt
/app/v2/projects
```

Feature location:

```txt
features-v2/projects
```

### Нужные UI-блоки

```txt
ProjectsScreen
├── ProjectsHeader
├── ProjectsSummaryCards
├── ProjectsToolbar
├── ProjectsTable
├── ProjectsMobileCards
├── ProjectFormDialog
├── ProjectDeleteDialog
├── ProjectsEmptyState
└── ProjectsLoadingSkeleton
```

### Нужные shadcn primitives

```txt
Button
Card
Input
Table
Dialog
AlertDialog
DropdownMenu
Badge
Skeleton
Separator
```

### Нужные mock data

```txt
mockProjects
```

Поля:

```txt
id
name
customerName
contractSum
status
startDate
endDate
progress
estimatesCount
updatedAt
```

### Нужные состояния

```txt
normal
empty
loading
long project names
many projects
mobile
```

### Backend status

Backend не подключать в первом UI pass.

## Экран 2 — Project Dashboard

Основной route:

```txt
/app/projects/[projectId]
```

Временный UI v2 route:

```txt
/app/v2/projects/[projectId]
```

### Нужные UI-блоки

```txt
ProjectDashboardScreen
├── ProjectHeader
├── ProjectInfoCards
├── ProjectEstimateList
├── ProjectFinancialSummary
├── ProjectTimeline
├── ProjectActions
└── ProjectDashboardSkeleton
```

### Нужные shadcn primitives

```txt
Button
Card
Badge
Table
Tabs
DropdownMenu
Skeleton
Separator
```

### Backend status

Первый pass — только mock data.

## Экран 3 — Materials Catalog

Основной route:

```txt
/app/catalog/materials
```

Временный UI v2 route:

```txt
/app/v2/catalog/materials
```

### Нужные UI-блоки

```txt
MaterialsScreen
├── MaterialsHeader
├── MaterialsToolbar
├── MaterialsTable
├── MaterialFormDialog
├── MaterialDeleteDialog
├── MaterialsEmptyState
└── MaterialsLoadingSkeleton
```

### Нужные shadcn primitives

```txt
Button
Input
Table
Dialog
AlertDialog
DropdownMenu
Badge
Skeleton
Select
```

### Важное правило

Не использовать старые directory wrappers.

Запрещено:

```txt
DirectoryListScreen
DataTableShell
CatalogTableWrapper
```

## Экран 4 — Works Catalog

Основной route:

```txt
/app/catalog/works
```

Временный UI v2 route:

```txt
/app/v2/catalog/works
```

### Нужные UI-блоки

```txt
WorksScreen
├── WorksHeader
├── WorksToolbar
├── WorksTable
├── WorkFormDialog
├── WorkDeleteDialog
├── WorksEmptyState
└── WorksLoadingSkeleton
```

## Экран 5 — Global Purchases

Основной route:

```txt
/app/global-purchases
```

Временный UI v2 route:

```txt
/app/v2/purchases
```

### Нужные UI-блоки

```txt
PurchasesScreen
├── PurchasesHeader
├── PurchasesSummaryCards
├── PurchasesToolbar
├── PurchasesTable
├── PurchaseFormSheet
├── PurchaseDeleteDialog
├── PurchasesEmptyState
└── PurchasesLoadingSkeleton
```

### Нужные shadcn primitives

```txt
Button
Card
Input
Table
Sheet
Dialog
AlertDialog
DropdownMenu
Badge
Skeleton
Select
Calendar
Popover
```

## Экран 6 — Estimate Detail

Начинать только после того, как готовы минимум три более простых экрана.

Основной route:

```txt
/app/projects/[projectId]/estimates/[estimateId]
```

Временный UI v2 route:

```txt
/app/v2/projects/[projectId]/estimates/[estimateId]
```

### Нужные UI-блоки

```txt
EstimateDetailScreen
├── EstimateHeader
├── EstimateTabs
├── EstimateWorksMaterialsTable
├── EstimateCoefficientDialog
├── EstimateSummaryPanel
├── EstimateRoomParamsSection
├── EstimateExecutionTab
├── EstimateProcurementTab
└── EstimateLoadingSkeleton
```

### Важное предупреждение

Этот экран не должен вводить universal data table abstraction.

Сначала делаем estimate-specific table components.

## Экран 7 — Analytics

Основной route:

```txt
/app/analytics
```

Временный UI v2 route:

```txt
/app/v2/analytics
```

### Нужные UI-блоки

```txt
AnalyticsScreen
├── AnalyticsHeader
├── KpiCards
├── RangeSelector
├── ProjectDynamicsChart
├── CashFlowChart
├── WorksFactPanel
├── PurchasesFactPanel
└── AnalyticsLoadingSkeleton
```

### Нужные shadcn primitives

```txt
Card
Tabs
Select
Button
Skeleton
```

Charts подключать только после утверждения статичной компоновки экрана.

## Общий DoD для каждого экрана

Каждый экран должен иметь:

```txt
desktop layout
mobile layout
normal state
empty state
loading skeleton
mock data
clear component split
no backend calls
no legacy shared/ui imports
```
