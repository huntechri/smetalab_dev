# Frontend Architecture Analysis — Smetalab v3

> Дата: 12.02.2026 | Версия: Next.js 15.6.0-canary.59 (Turbopack) | ~59 500 строк кода

---

## 1. Общая архитектура

### 1.1. Слоистая структура (Layered Architecture)

```
app/                        ← Роутинг, страницы (RSC), layouts
  ├── actions/              ← Server Actions (контроллеры)
  ├── api/                  ← REST API (Route Handlers)
  └── (workspace|admin|login)/  ← Route Groups
features/                   ← Feature-модули (UI + логика домена)
components/                 ← Shared UI (Shadcn + custom)
hooks/                      ← Глобальные хуки
lib/
  ├── domain/               ← Бизнес-логика (use-cases)
  ├── data/                 ← Репозитории + DB queries
  ├── infrastructure/       ← Auth, payments, email, notifications
  ├── ai/                   ← Embeddings, AI search
  └── services/             ← Утилитарные сервисы
```

**Вердикт:** ✅ Архитектура в целом соответствует заявленной layered-структуре: `app/ → actions/ → domain/ → data/`. Feature-модули хорошо изолированы.

---

## 2. Route Groups

| Route Group | Назначение | Кол-во страниц |
|---|---|---|
| `(workspace)` | Основное рабочее пространство | ~20 |
| `(admin)` | Админ-панель (dashboard, tenants, pricing) | ~8 |
| `(login)` | Авторизация (sign-in, sign-up) | ~2 |

**Вердикт:** ✅ Правильное разделение через Route Groups. Workspace защищён layout с sidebar и permissions.

---

## 3. Feature-модули

| Модуль | Компоненты | Хуки | Screens | Barrel (index.ts) |
|---|---|---|---|---|
| `projects` | 11 | 0 | 1 | ✅ |
| `materials` | 6 | 5 | 1 | ✅ |
| `works` | 6 | 3 | 1 | ✅ |
| `counterparties` | 2 | 1 | 1 | ✅ |
| `admin` | 4 | 0 | 0 | ✅ |
| `notifications` | 3 | 0 | 0 | ✅ |
| `permissions` | 1 | 0 | 0 | ✅ |

### Паттерн Screen

Все feature-модули используют паттерн **Screen Component**:
- Серверная `page.tsx` (RSC) загружает данные
- Передаёт `initialData` в клиентский `Screen`
- Screen управляет состоянием, фильтрацией, действиями

**Вердикт:** ✅ Правильный паттерн для App Router. Barrel-экспорты на месте.

---

## 4. Server vs Client Components

### Файлы с `'use client'`

| Слой | Файлы | Оценка |
|---|---|---|
| `features/*/screens/` | 4 | ✅ Ожидаемо — экраны интерактивны |
| `features/*/components/` | 2 | ✅ Ожидаемо — диалоги, тулбары |
| `app/` pages/layouts | 5 | ⚠️ Некоторые можно пересмотреть |

### Проблемные `'use client'` в app/

| Файл | Проблема |
|---|---|
| `app/(admin)/dashboard/general/page.tsx` | Вся страница — клиент. Можно вынести интерактивную часть в отдельный компонент |
| `app/(admin)/dashboard/security/page.tsx` | Аналогично |
| `app/(admin)/layout.tsx` | Layout как клиентский — блокирует серверные оптимизации для дочерних маршрутов |
| `app/(workspace)/app/page.tsx` | Главная страница workspace — клиент |

**Вердикт:** ⚠️ **4 файла в `app/`** используют `'use client'` на уровне page/layout. По канонам Next.js App Router это нежелательно — граница Server/Client должна быть максимально глубокой (leaf nodes).

---

## 5. Domain Layer (`lib/domain/`)

```
lib/domain/
  ├── admin/use-cases.ts
  ├── counterparties/use-cases.ts
  ├── materials/
  │   ├── materials.service.ts
  │   └── use-cases.ts
  ├── projects/use-cases.ts
  └── works/
      ├── works.service.ts
      └── use-cases.ts
```

**Вердикт:** ✅ Хорошая изоляция бизнес-логики. Наличие `service.ts` рядом с `use-cases.ts` у `materials` и `works` — это правильный подход для сложных доменов.

⚠️ Модуль `projects/use-cases.ts` содержит только 12 строк с минимальной валидацией — фактически транзитный слой. Стоит либо расширить бизнес-правилами, либо временно исключить.

---

## 6. Data Layer (`lib/data/`)

```
lib/data/
  ├── db/
  │   ├── schema.ts          ← Drizzle ORM schema (все таблицы)
  │   ├── queries.ts          ← Общие запросы (getTeamForUser, getCounterparties...)
  │   ├── drizzle.ts          ← Connection entrypoint
  │   ├── drizzle.node.ts     ← Node.js DR adapter
  │   ├── drizzle.server.ts   ← Server-side adapter
  │   ├── drizzle.shared.ts   ← Shared config
  │   └── seed.ts + setup.ts
  ├── projects/repo.ts        ← Projects repository
  ├── counterparties/repository.ts
  ├── admin/impersonation.repository.ts
  └── projects.ts             ← ⚠️ MOCK DATA (не репозиторий!)
```

### Проблемы

| # | Проблема | Серьёзность |
|---|---|---|
| 1 | **Два `ProjectCard` компонента** — `features/projects/components/project-card.tsx` и `app/(workspace)/app/projects/_components/ProjectCard.tsx` | 🔴 Высокая |
| 2 | **Два типа `ProjectStatus`** — `features/projects/types.ts` (`'active'\|'completed'\|'planned'\|'paused'`) vs `lib/data/projects.ts` (`'in_progress'\|'planning'\|'paused'\|'completed'`) с **разными значениями!** | 🔴 Высокая |
| 3 | **`lib/data/projects.ts`** содержит 226 строк MOCK-данных, живущих рядом с реальными репозиториями | 🟡 Средняя |
| 4 | **`queries.ts` — «god file»** — содержит более 500 строк с разнородными запросами | 🟡 Средняя |
| 5 | **Два `use-mobile` хука** — `hooks/use-mobile.ts` и `hooks/use-mobile.tsx` | 🟡 Средняя |

**Вердикт:** 🔴 Есть серьёзная рассинхронизация типов `ProjectStatus` между feature-модулем и mock-данными. Два дублирующихся `ProjectCard` с разным API — потенциальная путаница.

---

## 7. Server Actions

```
app/actions/
  ├── projects/    create.ts, update.ts, delete.ts     ← 3 отдельных файла
  ├── materials/   crud.ts, embeddings.ts, import-export.ts, search.ts, search-ai.ts  ← 5 файлов + index.ts
  ├── works/       crud.ts, import-export.ts, search.ts, search-ai.ts, maintenance.ts ← 5 файлов + index.ts
  ├── counterparties/ crud.ts ← 1 файл + index.ts
  └── admin/       impersonation.ts
```

### Несогласованность структуры

| Домен | Структура | Barrel | Проблема |
|---|---|---|---|
| projects | 3 отдельных файла | ❌ Нет | Нет barrel-экспорта, нет общего `index.ts` |
| materials | 5 файлов | ✅ `index.ts` | Хорошо структурировано |
| works | 5 файлов | ✅ `index.ts` | Хорошо структурировано |
| counterparties | 1 файл | ✅ `index.ts` | OK |

**Вердикт:** ⚠️ `projects` actions не имеют barrel-файла и организованы иначе (по одному действию на файл без index), в то время как `materials`/`works` используют группированную структуру с `index.ts`.

---

## 8. Shared Components (`components/`)

### Статистика
- **59 UI-компонентов** в `components/ui/`
- Shadcn/UI как основа ✅
- Дополнительные подсистемы:
  - `components/ui/states/` — EmptyState, ErrorState, ForbiddenState (✅ хорошо)
  - `components/ui/minimal-tiptap/` — Rich text editor (большой модуль, ~30 файлов)
  - `components/ui/ui-builder/` — Visual page builder (огромный модуль, ~50 файлов)

### Неотслеживаемые компоненты (untracked)

**26+ UI-компонентов** существуют локально, но НЕ добавлены в git:

```
accordion, alert(!), aspect-ratio, button-group, carousel, chart, chart-demos,
checkbox, collapsible, context-menu, drawer, empty, field, hover-card,
input-group, input-otp, item, kbd, menubar, navigation-menu, pagination,
progress, resizable, slider, spinner, table, textarea, toggle, toggle-group
```

**Вердикт:** ⚠️ Большое количество untracked-файлов. Если они нужны — добавить в git. Если нет — добавить в `.gitignore` или удалить.

---

## 9. Hooks

| Хук | Назначение | Область |
|---|---|---|
| `use-data-table-editor` | CRUD для табличных данных | Shared (materials, works) |
| `use-data-table-state` | Состояние DataTable | Shared |
| `use-guide-table-search` | Поиск в справочниках | Shared |
| `use-permissions` | RBAC проверки | Global |
| `use-sidebar-state` | Sidebar toggle | Global |
| `use-page-title` | Document title | Global |
| `use-mobile` (.ts + .tsx) | Mobile detection | ⚠️ Дубликат |
| `use-debounce` | Debounce | Utility |
| `use-copy-to-clipboard` | Clipboard API | Utility |
| `use-keyboard-shortcuts` | Keyboard shortcuts | Utility |
| `use-store` | Zustand store | Utility |

**Вердикт:** ✅ Хуки хорошо организованы. Feature-specific хуки живут внутри feature-модулей, shared — в `hooks/`. ⚠️ Дубликат `use-mobile`.

---

## 10. Infrastructure Layer

```
lib/infrastructure/
  ├── auth/           ← access, middleware, rate-limit, rbac, session
  ├── email/          ← email service
  ├── notifications/  ← notify service
  ├── payments/       ← Stripe integration
  └── swagger.ts      ← API docs
```

**Вердикт:** ✅ Хорошее разделение инфраструктуры. Auth-модуль полноценный (RBAC, rate limiting, sessions).

---

## 11. Типизация

| Проверка | Результат |
|---|---|
| `strict: true` | ✅ |
| Использование `any` | ✅ Минимальное (1 вхождение в `counterparties/crud.ts` catch block) |
| Props interfaces | ✅ На всех компонентах |
| Feature types | ✅ Каждый модуль имеет свой `types.ts` |

**Вердикт:** ✅ Строгая типизация соблюдается.

⚠️ Но: `page.tsx` проектов использует `as any` при маппинге `status` и `counterpartyName`, что нужно типизировать строго.

---

## 12. Сводная таблица проблем

| # | Проблема | Серьёзность | Тип |
|---|---|---|---|
| 1 | Два `ProjectCard` с разным API | 🔴 Критическая | Дублирование |
| 2 | Два `ProjectStatus` типа с разными значениями | 🔴 Критическая | Рассинхронизация типов |
| 3 | `'use client'` на admin layout и page-уровне | 🟡 Средняя | Оптимизация |
| 4 | `queries.ts` — god file (500+ строк) | 🟡 Средняя | Архитектура |
| 5 | 26+ untracked UI-компонентов | 🟡 Средняя | Гигиена репозитория |
| 6 | Дубликат `use-mobile.ts` / `.tsx` | 🟡 Средняя | Дублирование |
| 7 | `lib/data/projects.ts` — mock данные в production-коде | 🟡 Средняя | Код-гигиена |
| 8 | `projects/` actions без barrel `index.ts` | 🟢 Низкая | Согласованность |
| 9 | `projects/use-cases.ts` — транзитный слой | 🟢 Низкая | Архитектура |
| 10 | `as any` в `projects/page.tsx` маппинге | 🟢 Низкая | Типизация |

---

## 13. Сильные стороны ✅

1. **Feature-first организация** — каждый домен (projects, materials, works) полностью инкапсулирован
2. **Правильный RSC/Client boundary** — в feature-модулях граница проходит на уровне screens (leaf nodes)
3. **Barrel-экспорты** — все модули имеют `index.ts`
4. **Shadcn/UI** — единая дизайн-система с кастомизацией
5. **Domain Layer** — бизнес-логика отделена от data access
6. **Infrastructure isolation** — auth, payments, notifications изолированы
7. **Строгая типизация** — TypeScript strict, минимум `any`
8. **Screen Pattern** — правильное разделение data-fetching (server) и state management (client)

---

## 14. Рекомендации (приоритет)

### 🔴 Критические (неделя)
1. **Унифицировать `ProjectStatus`** — привести к единому типу
2. **Удалить дубликат `ProjectCard`** — решить, какой из двух является каноническим

### 🟡 Средние (спринт)
3. **Разделить `queries.ts`** на domain-specific файлы (projects-queries, counterparties-queries)
4. **Перенести mock-данные** из `lib/data/projects.ts` в `__fixtures__/` или `__mocks__/`
5. **Убрать дубликат** `use-mobile.ts` / `use-mobile.tsx`
6. **Решить судьбу untracked UI-компонентов** — git add или удалить

### 🟢 Низкие (бэклог)
7. Вынести `'use client'` из admin layout/pages на уровень leaf компонентов
8. Добавить `index.ts` barrel для `app/actions/projects/`
9. Типизировать маппинг в `projects/page.tsx` без `as any`
