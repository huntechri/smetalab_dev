# Анализ архитектурных нарушений UI-слоя

> Дата анализа: 2026-04-19  
> Ветка: `analysis/ui-architecture-violations`

Данный документ фиксирует выявленные нарушения архитектурных принципов в UI-слое проекта Smetalab. Код приложения не изменялся — документ создан исключительно для обсуждения и приоритизации исправлений командой.

---

## Нарушение 1: Раздвоение источника UI-компонентов

**Статус:** Критическое  
**Файлы:**
- `components/ui/button.tsx` — содержит полную реализацию
- `components/ui/input.tsx` — содержит полную реализацию
- `shared/ui/button.tsx` — только реэкспорт из `components/ui`
- `shared/ui/input.tsx` — только реэкспорт из `components/ui`

**Описание:**  
В проекте существуют два пути импорта UI-примитивов: `@/components/ui` и `@/shared/ui`. Фактические реализации хранятся в `components/ui`, а `shared/ui` содержит лишь тонкие обёртки-реэкспорты. При этом 39 импортов идут напрямую в `@/components/ui`, а 144 — в `@/shared/ui`. Единого канонического источника нет.

**Последствия:**
- Новые разработчики не знают, откуда импортировать компоненты
- Риск расхождения при рефакторинге (изменение в одном месте не отражается в другом)
- Нарушает принцип единого источника истины

**Рекомендация:**  
Определить `@/shared/ui` как единственный публичный интерфейс. Перевести все прямые импорты из `@/components/ui` на `@/shared/ui`. `components/ui` сделать приватным (внутренняя деталь реализации).

---

## Нарушение 2: Прямой доступ к БД из UI-компонента

**Статус:** Критическое  
**Файл:** `features/admin/components/impersonation-banner.tsx`

**Описание:**  
Компонент `ImpersonationBanner` — серверный React-компонент — напрямую импортирует Drizzle `db` и схему БД, выполняя сырой запрос прямо в теле компонента:

```ts
import { db } from '@/lib/data/db/drizzle';
import { impersonationSessions } from '@/lib/data/db/schema';

const session = await db.query.impersonationSessions.findFirst({ ... });
```

**Последствия:**
- Полностью обходит сервисный и репозиторий слои
- Логика выборки данных не переиспользуется и не тестируется отдельно
- Нарушает принцип разделения ответственности: UI-компонент не должен знать о деталях хранения

**Рекомендация:**  
Создать функцию `getActiveImpersonationSession(token)` в `features/admin/lib` или `lib/services/impersonation.ts`. Компонент вызывает только её.

---

## Нарушение 3: Импорт репозитория чужой фичи в клиентском компоненте

**Статус:** Критическое  
**Файл:** `features/patterns/screens/PatternsScreen.tsx`  
**Импортирует из:** `features/projects/estimates/repository/patterns.actions`

**Описание:**  
`PatternsScreen` — клиентский компонент (`'use client'`) — напрямую импортирует `estimatePatternsActionRepo` из внутреннего репозитория другой фичи:

```ts
import { estimatePatternsActionRepo, EstimatePatternListItem, EstimatePatternPreviewRow }
  from '@/features/projects/estimates/repository/patterns.actions';
```

Это двойное нарушение:
1. **Кросс-фичевая граница**: `patterns` обходит публичный `index.ts` фичи `projects/estimates`
2. **Нарушение слоёв**: клиентский UI-компонент напрямую обращается к слою Repository

**Последствия:**
- Жёсткая связность между двумя несвязными фичами
- Изменение внутренней структуры `projects/estimates` ломает `patterns`
- Серверные зависимости могут утечь в клиентский бандл

**Рекомендация:**  
Добавить публичный реэкспорт в `features/projects/estimates/index.ts`. Либо вынести логику шаблонов в `entities/estimate-pattern`.

---

## Нарушение 4: Прямой импорт внутреннего компонента между фичами

**Статус:** Высокое  
**Файл:** `features/global-purchases/components/global-purchases-columns.tsx`  
**Импортирует из:** `features/projects/estimates/components/table/cells/EditableCell`

**Описание:**  
Фича `global-purchases` импортирует компонент `EditableCell` напрямую из внутренней структуры фичи `projects/estimates`:

```ts
import { EditableCell } from '@/features/projects/estimates/components/table/cells/EditableCell';
```

**Последствия:**
- `EditableCell` стал де-факто shared-компонентом, но всё ещё живёт внутри `projects/estimates`
- Любой рефакторинг структуры `projects/estimates` ломает `global-purchases`
- Нарушает принцип «публичный API фичи только через index.ts»

**Рекомендация:**  
Переместить `EditableCell` в `shared/ui/editable-cell.tsx` или реэкспортировать через `features/projects/estimates/index.ts`.

---

## Нарушение 5: Нарушения межфичевых границ (средний приоритет)

**Статус:** Среднее

Несколько фич импортируют внутренности друг друга в обход публичных `index.ts`:

| Импортирует | Из | Что |
|---|---|---|
| `features/global-purchases` | `features/catalog` | `MaterialCatalogDialog`, `CatalogMaterial` DTO |
| `features/projects/estimates` | `features/projects/dashboard` | `ProjectReceiptsSection` + repository |
| `features/material-suppliers` | `features/directories` | `DirectoryListScreen`, `DirectoryListAdapter` |
| `features/materials` | `features/guide-catalog` | `CatalogScreenShell`, `CatalogScreenAdapter` |
| `features/works` | `features/guide-catalog` | `CatalogScreenShell`, `CatalogScreenAdapter` |

**Рекомендация:**  
Для каждой из этих зависимостей: либо добавить реэкспорт в `index.ts` фичи-донора, либо вынести переиспользуемое в `shared/` или `entities/`.

---

## Нарушение 6: Слой `entities/` фактически не используется

**Статус:** Низкое  
**Текущее состояние:** Всего 5 импортов из `entities/` во всём проекте (директории: `entities/estimate`, `entities/project`)

**Описание:**  
Слой `entities/` задуман как место для доменных UI-представлений (статус-бейджи, форматтеры, иконки сущностей), переиспользуемых между фичами. На практике эти объекты разбросаны по внутренним папкам фич:
- `features/projects/shared/ui/project-badge-styles.ts` — используется в 5 разных местах
- Стили бейджей для смет дублируются через кросс-фичевые импорты

**Рекомендация:**  
Постепенно переносить доменные UI-представления (статусы проектов, смет и т.д.) из `features/*/shared/ui` в `entities/`. Не обязательно делать это сразу — достаточно ввести соглашение и придерживаться его при новой разработке.

---

## Сводная таблица

| # | Нарушение | Приоритет | Трудоёмкость |
|---|---|---|---|
| 1 | Раздвоение источника UI (components/ui vs shared/ui) | Критическое | Низкая (массовая замена импортов) |
| 2 | Прямой DB-доступ в ImpersonationBanner | Критическое | Низкая (вынести функцию) |
| 3 | Импорт репозитория чужой фичи в PatternsScreen | Критическое | Низкая (добавить реэкспорт) |
| 4 | Прямой импорт EditableCell в global-purchases | Высокое | Низкая (переместить/реэкспорт) |
| 5 | Межфичевые импорты в обход index.ts | Среднее | Средняя |
| 6 | Недоиспользование слоя entities/ | Низкое | Высокая |
