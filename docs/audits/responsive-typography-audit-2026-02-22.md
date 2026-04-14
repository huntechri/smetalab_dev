# Аудит адаптивности типографики и соответствия shadcn/ui

**Дата:** 2026-02-22  
**Область аудита:** все экранные маршруты (`app/**/page.tsx`) + системные экраны (`app/not-found.tsx`, `app/global-error.tsx`, `app/(login)/login.tsx`) + ключевые экранные компоненты в `features/**/screens` и связанных UI-узлах.  
**Всего проверено экранов:** 32 маршрута + 3 системных экрана.

---

## Методика

1. Просканированы все `page.tsx` в `app/` и сопоставлены с экранными компонентами (`features/*/screens/*`).
2. Поиск проблем адаптивной типографики:
   - заголовки/подзаголовки: `h1..h6`, `text-*`, breakpoint-классы (`sm:`, `md:`, `lg:`);
   - кнопки, поисковые строки, диалоги, таблицы, табы.
3. Проверка соответствия shadcn/ui:
   - выявлены места с raw-элементами (`<button>`, `<input>`, `<table>`) вне `components/ui/*`.
4. Проверка на «божественные компоненты» (god components): крупные файлы с высокой UI/logic-сцепленностью и избыточным объёмом.

---

## Executive summary

- В проекте много корректного использования shadcn (`Button`, `Input`, `Dialog`, `Tabs`, `Table`) и общая база построена на Tailwind + токенах темы.
- При этом типографика **не стандартизована через единую шкалу**: встречаются локальные размеры (`text-[10px]`, `text-xs`, `text-sm`, `text-4xl`, `text-5xl`) без единой системы fluid/responsive токенов.
- Найдены компоненты, **частично выходящие за shadcn-паттерн** (raw `<table>` и raw `<button>` в production-коде).
- Выявлены выраженные god components (>500 строк), где смешаны бизнес-правила, состояние, табличная логика и визуал.

---

## Результаты по объектам аудита

### 1) Заголовки

**Наблюдения:**
- На лендинге и login-экране используются крупные размеры (`text-4xl`, `sm:text-5xl`), но без общей шкалы для внутренних экранов.
- На части внутренних экранов заголовки сделаны как `text-xl`/`text-2xl`, но без консистентной иерархии для mobile/tablet/desktop.
- Есть экраны-обёртки (`page.tsx`), где заголовки вообще делегированы в дочерние большие компоненты — это затрудняет контроль типографики на уровне маршрута.

**Риск:** средний (UX-консистентность и визуальная иерархия).

### 2) Подзаголовки

**Наблюдения:**
- Широко используются подписи `text-xs`, `uppercase`, `tracking-*`; местами это приводит к слишком мелкому тексту на мобильных (особенно `text-[10px]`).
- В таблицах/toolbars иногда подписи стилистически тяжелее основного текста (избыток uppercasing + tight tracking).

**Риск:** средний-высокий (читабельность и доступность).

### 3) Кнопки

**Плюсы:**
- В большинстве экранов применяется shadcn `Button`.

**Проблемы (не shadcn-паттерн):**
- `features/permissions/components/permissions-matrix.tsx` — несколько raw `<button>`.
- `features/projects/estimates/components/table/cells/EditableCell.tsx` — raw `<button>` для режима редактирования.
- `features/admin/components/admin-user-menu.tsx` — raw `<button>` внутри меню sign out.
- `app/(admin)/terminal.tsx` — raw `<button>` (декоративный экран терминала).

**Риск:** средний (единообразие поведения focus/disabled/size).

### 4) Строки поиска

**Плюсы:**
- В рабочих экранах поиска (материалы/работы/проекты) преобладает shadcn `Input` и composable toolbar-подход.

**Проблемы:**
- Часть инпутов остаётся raw (в основном скрытые или служебные `type="hidden"`/`type="file"`, что допустимо).
- Не везде явно задана единая высота/контраст placeholder для мобильных брейкпоинтов.

**Риск:** низкий-средний.

### 5) Диалоговые окна

**Плюсы:**
- Основной паттерн — shadcn `Dialog`/`Sheet`.

**Проблемы:**
- Несколько диалогов функционально перегружены (большое число полей, таблиц, стейтов), что ухудшает адаптивность текста и перегружает mobile layout.

**Риск:** средний.

### 6) Таблицы

**Плюсы:**
- Есть системные table-компоненты в `components/ui/table.tsx` и data-table abstractions.

**Проблемы (не shadcn):**
- `features/permissions/components/permissions-matrix.tsx` использует raw `<table>` (2 шт.), отдельные стили и свою визуальную систему.
- Это ведёт к расхождению типографики и поведения скролла/плотности с остальными таблицами приложения.

**Риск:** высокий (консистентность + поддерживаемость).

### 7) Табы

**Плюсы:**
- Во многих местах используются shadcn `Tabs`.

**Проблемы:**
- Для `TabsTrigger` местами применяются сильно кастомные шрифтовые правила (`text-xs`, `font-black`, `uppercase`), что выбивается из базовой UI-типографики.

**Риск:** средний.

### 8) Шрифты (глобально)

**Наблюдения:**
- Глобальная база шрифта задана в `app/globals.css` через `var(--font-manrope)`.
- Но отсутствует единая **типографическая дизайн-система** уровня utility tokens (`text-display`, `text-title`, `text-body-sm` и т.п.) с адаптивными правилами.
- Много локальных one-off размеров в компонентах, из-за чего трудно обеспечить единое поведение на всех экранах.

**Риск:** высокий (масштабирование UI и скорость разработки).

---

## Несоответствия shadcn/ui (приоритет на исправление)

1. `features/permissions/components/permissions-matrix.tsx`
   - raw `<table>` и raw `<button>`;
   - очень кастомная типографика и стили, не унифицированные с `components/ui/*`.

2. `features/projects/estimates/components/table/cells/EditableCell.tsx`
   - raw `<button>` вместо `Button`/`buttonVariants` или унифицированного cell-trigger.

3. `features/admin/components/admin-user-menu.tsx`
   - raw `<button>` в форме выхода.

4. `app/(admin)/terminal.tsx`
   - raw `<button>` (допустимо для демо-экрана, но лучше привести к единой кнопочной системе).

---

## God components (божественные компоненты)

Кандидаты по размеру/сцепленности:

- `features/projects/estimates/components/table/EstimateTable.client.tsx` — **1018 строк**.
- `features/projects/dashboard/components/DashboardDataTable.tsx` — **598 строк**.
- `features/counterparties/components/CreateCounterpartySheet.tsx` — **534 строки**.
- `features/settings/components/user-settings-page.tsx` — **508 строк**.
- `app/(workspace)/app/team/client-page.tsx` — **387 строк**.

**Почему это проблема:**
- трудно удерживать консистентную типографику;
- сложно масштабировать адаптивность (одно изменение размера шрифта затрагивает много логики);
- риск регрессий при правках таблиц/форм/диалогов.

---

## Полный список экранов (маршрутов) и статус аудита

> Статусы: **OK** — критичных отклонений не найдено на уровне маршрута; **DELEGATED** — экран делегирует основную UI в feature-компоненты; **ATTN** — есть заметные проблемы/риски типографики или shadcn-консистентности.

| Экран | Статус | Примечание |
|---|---|---|
| `/` | ATTN | Маркетинговая типографика крупная и сильно кастомная; нужна унификация с app-scale. |
| `/sign-in` | DELEGATED | Рендерит общий `login.tsx`. |
| `/sign-up` | DELEGATED | Рендерит общий `login.tsx`. |
| `/invitations` | OK | Структура простая, низкий риск. |
| `/api-docs` | OK | Документационный экран (динамический рендер). |
| `/admin` | OK | Использует shadcn-карточки/кнопки. |
| `/admin/pricing` | OK | Есть raw `input` (служебный hidden/file), в целом допустимо. |
| `/admin/dashboard` | OK | Лэндинг dashboard. |
| `/admin/dashboard/activity` | OK | Преимущественно card-based. |
| `/admin/dashboard/general` | OK | shadcn-форма. |
| `/admin/dashboard/security` | OK | shadcn-форма. |
| `/admin/dashboard/permissions` | ATTN | Делегирует в permissions matrix с raw table/button. |
| `/admin/dashboard/tenants` | OK | Списки/карточки. |
| `/admin/dashboard/tenants/[tenantId]` | OK | shadcn tabs + badges/cards. |
| `/app` | ATTN | Набор карточек/типографики, полезна унификация шкалы. |
| `/app/projects` | DELEGATED | `ProjectsScreen`. |
| `/app/projects/[projectId]` | DELEGATED | `ProjectDashboard`. |
| `/app/projects/[projectId]/estimates` | DELEGATED | `ProjectEstimatesSection`. |
| `/app/projects/[projectId]/estimates/[estimateId]` | DELEGATED | `EstimateDetailsShell`/табличные вкладки. |
| `/app/projects/[projectId]/estimates/[estimateId]/parameters` | OK | Вкладка-роут, низкая нагрузка. |
| `/app/projects/[projectId]/estimates/[estimateId]/purchases` | OK | Вкладка-роут, низкая нагрузка. |
| `/app/projects/[projectId]/estimates/[estimateId]/docs` | OK | Вкладка-роут, низкая нагрузка. |
| `/app/projects/[projectId]/estimates/[estimateId]/accomplishment` | OK | Вкладка-роут, низкая нагрузка. |
| `/app/guide` | OK | Навигационный экран. |
| `/app/guide/materials` | DELEGATED | `MaterialsScreen`. |
| `/app/guide/works` | DELEGATED | `WorksScreen`. |
| `/app/guide/counterparties` | DELEGATED | `CounterpartiesScreen`. |
| `/app/guide/material-suppliers` | DELEGATED | `MaterialSuppliersScreen`. |
| `/app/global-purchases` | DELEGATED | `GlobalPurchasesScreen`. |
| `/app/patterns` | DELEGATED | `PatternsScreen`. |
| `/app/team` | ATTN | Крупный client component (387 строк), риск перегруженной типографики. |
| `/app/settings` | DELEGATED | `user-settings-page` (крупный компонент). |

**Системные экраны:**
- `app/(login)/login.tsx` — **ATTN** (кастомная marketing-типографика, много локальных размеров).
- `app/not-found.tsx` — **OK**.
- `app/global-error.tsx` — **OK**.

---

## Рекомендации (по приоритету)

### P0 (обязательно)
1. Привести `permissions-matrix` к shadcn table/button паттернам:
   - заменить raw `<table>` на `Table`, `TableHeader`, `TableRow`, `TableCell`;
   - заменить raw `<button>` на `Button`/`buttonVariants`.
2. Убрать raw `<button>` в критичных интеракциях (`EditableCell`, `admin-user-menu`) или обернуть через единый button API.

### P1 (высокий)
3. Ввести единый типографический слой:
   - utility-классы уровня `text-display`, `text-title`, `text-subtitle`, `text-body`, `text-caption`;
   - responsive-правила (mobile-first) и ограничение для `text-[10px]`/`text-xs` в контентных блоках.
4. Определить стандарт для tab/button typography (без `font-black` + aggressive uppercase по умолчанию).

### P2 (средний)
5. Декомпозировать god components:
   - разделить таблицы на: toolbar, grid, row-actions, dialogs, hooks;
   - типографику вынести в атомарные presentation-компоненты.
6. Добавить визуальные regression checks (storybook snapshots/playwright) для key breakpoints: 375, 768, 1024, 1440.

### P3 (улучшения)
7. Ввести lint-правило (или custom eslint check) на raw `<button>/<table>` вне `components/ui/*`, кроме whitelist-случаев.
8. Сформировать «Typography & Density Guide» в docs с конкретными примерами для заголовков, таблиц, табов, диалогов и поиска.

---

## Итог

Система уже имеет хороший фундамент shadcn/ui, но для реальной консистентности «на всех экранах» нужны:
- унификация typography scale,
- устранение точечных raw-элементов,
- декомпозиция крупных экранных компонентов,
- и автоматизированная проверка адаптивности на брейкпоинтах.
