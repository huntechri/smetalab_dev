# Аудит UI-архитектуры — апрель 2026

> Документ фиксирует найденные нарушения архитектурных границ UI-слоя
> на момент аудита. **Код приложения этим PR не правится.**
> Цель — согласовать с командой список проблем и порядок их устранения.

## Скоуп

Проанализированы все элементы интерфейса, используемые в `app/`,
`features/`, `entities/`, `components/`: кнопки, инпуты, формы, таблицы,
модалки, шиты, дроверы, бейджи, дропдауны и обёртки вокруг них.
В качестве источников правды использовались `ARCHITECTURE.md`,
`replit.md` и `eslint.config.mjs`.

## Условные обозначения

| Уровень | Что означает |
|---|---|
| 🔴 Critical | Нарушает заявленный архитектурный барьер, легко регрессирует, влияет на много файлов. |
| 🟠 High | Нарушает изоляцию или дизайн-систему, но локально. |
| 🟡 Medium | Несогласованность/дублирование, не ломает архитектуру, но ухудшает поддержку. |
| 🟢 Low | Технический долг, чистка. |

---

## 1. 🔴 «Фиктивный» барьер `@repo/ui` → реэкспорт из легаси `@/components/ui/*`

`replit.md` декларирует `@repo/ui` как единый слой дизайн-системы,
а `eslint.config.mjs` запрещает прямые импорты `@/components/ui/*` из
`app/**`, `features/**`, `entities/**`. Но сам `shared/ui/*` (через
который `@repo/ui` реэкспортит компоненты) импортирует примитивы как
раз из `@/components/ui/*`. В итоге у нас **две точки правды** для
`Button` и `Input`, и формальный барьер не выполняет своей роли.

**Свидетельства:**
- `shared/ui/button.tsx:1` — `export { Button, buttonVariants } from "@/components/ui/button"`
- `shared/ui/input.tsx:1` — `export { Input, inputVariants } from "@/components/ui/input"`
- `shared/ui/sidebar.tsx:11` — `import { Button } from "@/components/ui/button"`
- `shared/ui/calendar.tsx:16` — `import { Button, buttonVariants } from "@/components/ui/button"`
- `shared/ui/dialog.tsx:8` — `import { Button } from "@/components/ui/button"`
- `shared/ui/alert-dialog.tsx`, `shared/ui/pagination.tsx`,
  `shared/ui/date-picker.tsx`, `shared/ui/carousel.tsx`,
  `shared/ui/input-group.tsx` — аналогично.

**В `components/ui/` сейчас остались только** `button.tsx` и
`input.tsx` — два «осколка» старой структуры, которые продолжают
жить параллельно с `shared/ui/`.

**Что делать:**
1. Перенести содержимое `components/ui/button.tsx` и
   `components/ui/input.tsx` физически в `shared/ui/button.tsx` и
   `shared/ui/input.tsx`.
2. Заменить все `@/components/ui/*` импорты внутри `shared/ui/*` на
   относительные.
3. Удалить директорию `components/ui/`.
4. Расширить ESLint-правило `no-restricted-imports` для `shared/ui/**`
   так, чтобы запретить и `@/components/ui/*`, и пути на самих себя
   (`@/components/ui/button`).

---

## 2. 🟠 Кросс-фичевые импорты (нарушение изоляции `features/**`)

`ARCHITECTURE.md` явно требует, чтобы фичи не зависели друг от друга
напрямую. Сейчас несколько фич импортируют публичные API соседних
фич — это нарушает границы и ведёт к скрытой связности.

**Свидетельства:**
- `features/global-purchases/components/global-purchases-columns.tsx` →
  `@/features/projects/estimates`
- `features/global-purchases/components/GlobalPurchasesTable.client.tsx` →
  `@/features/catalog/components/MaterialCatalogDialog.client`
- `features/patterns/screens/PatternsScreen.tsx` →
  `@/features/projects/estimates`
- `features/projects/estimates/components/table/EstimateTable.client.tsx` →
  `@/features/catalog/components/WorkCatalogPicker.client`
- `features/projects/estimates/components/tabs/EstimateFinance.tsx` →
  `@/features/projects/dashboard/components/ProjectReceiptsSection`

**Что делать:**
1. Поднять переиспользуемые UI/типы в `entities/<entity>/ui` или
   `shared/ui/` (например, `MaterialCatalogDialog`, `WorkCatalogPicker`
   — это не фича, а сущность каталога).
2. Где переиспользование оправдано на уровне фич — оформить публичный
   контракт через barrel `features/<feature>/index.ts` и явно его
   задокументировать.
3. Добавить в `eslint.config.mjs` для `features/**` правило
   `no-restricted-imports` с паттерном `@/features/*` и whitelist
   разрешённых публичных API (если такие будут).

---

## 3. 🟠 Сырые HTML-элементы в коде приложения

ESLint-правило `no-restricted-syntax` в `eslint.config.mjs` ловит
только `<button>` и `<table>`. Сырые `<form>`, `<input>`, `<select>`,
`<textarea>` не запрещены вовсе, и они активно используются в формах.

**Свидетельства (`<form>` без shadcn `Form`):**
- `features/works/components/WorksEditDialog.tsx:45`
- `features/team/components/InviteTeamMemberCard.tsx:38`
- `features/settings/components/user-settings-page.tsx:137,271`
- `features/projects/list/components/create-project-dialog.tsx:136`
- `features/projects/estimates/components/CreateEstimateDialog.tsx:97`
- `features/materials/components/MaterialsEditDialog.tsx:43`
- `features/material-suppliers/components/CreateMaterialSupplierSheet.tsx:124`
- `features/counterparties/components/CreateCounterpartySheet.tsx:177`
- `features/auth/components/ResetPasswordForm.tsx:22`
- `features/auth/components/LoginForm.tsx:122`
- `features/auth/components/ForgotPasswordForm.tsx:22`
- `features/admin/components/impersonate-button.tsx:25`
- `features/admin/components/admin-user-menu.tsx:69`
- `app/(admin)/pricing/page.tsx:88`
- `app/(admin)/dashboard/security/page.tsx:46,126`
- `app/(admin)/dashboard/general/page.tsx:92`

**Свидетельства (`<input type="hidden">`):**
- `features/auth/components/LoginForm.tsx:123-125`
- `features/auth/components/ResetPasswordForm.tsx:23`
- `features/admin/components/impersonate-button.tsx:26`
- `app/(admin)/pricing/page.tsx:89`

`<input type="hidden">` — допустимое исключение для server actions,
но правило сейчас не различает «hidden» и «обычный input».

**Что делать:**
1. Расширить `no-restricted-syntax` для `app/**`, `features/**`,
   `components/**`, `entities/**`: добавить селекторы для
   `<form>`, `<input>` (с исключением `type="hidden"`),
   `<select>`, `<textarea>`.
2. Перевести формы на `Form` из shadcn (`@repo/ui`) либо на
   `react-hook-form` + `Field` из дизайн-системы.
3. Для `<form action={serverAction}>`-кейсов оформить тонкую обёртку
   `ServerActionForm` в `shared/ui/` и разрешить её исключением.

---

## 4. 🟡 Несогласованность модальных паттернов CRUD

Создание/редактирование сущностей реализовано разными примитивами
без единого правила, когда применять что.

| Действие | Файл | Примитив |
|---|---|---|
| Создание | `features/counterparties/components/CreateCounterpartySheet.tsx` | Sheet |
| Создание | `features/material-suppliers/components/CreateMaterialSupplierSheet.tsx` | Sheet |
| Создание | `features/projects/list/components/create-project-dialog.tsx` | Dialog |
| Создание | `features/projects/estimates/components/CreateEstimateDialog.tsx` | Dialog |
| Редактирование | `features/materials/components/MaterialsEditDialog.tsx` | Dialog |
| Редактирование | `features/works/components/WorksEditDialog.tsx` | Dialog |
| Удаление | `features/materials/components/MaterialsDeleteDialog.tsx` | AlertDialog |
| Удаление | `features/works/components/WorksDeleteDialog.tsx` | AlertDialog |
| Удаление | `features/projects/estimates/components/EstimateHeader.tsx` | AlertDialog |
| Удаление | `features/projects/list/components/project-actions.tsx` | AlertDialog |

**Что делать:**
1. Зафиксировать в `ARCHITECTURE.md` правило: «короткая форма → Dialog,
   длинная форма / много полей / контекст редактирования с превью →
   Sheet, подтверждение деструктивного действия → AlertDialog».
2. Сделать в `shared/ui/` две обёртки: `CrudFormDialog` и
   `CrudFormSheet`, инкапсулирующие header/description/footer/loading,
   чтобы фичи не повторяли разметку.

---

## 5. 🟡 Дублирование «обёрток таблиц» по фичам

Несколько фич реализуют практически идентичный паттерн «toolbar +
DataTable + empty state» собственными компонентами.

**Свидетельства:**
- `features/guide-catalog/components/CatalogTableWrapper.tsx`
- `features/materials/components/MaterialsTableWrapper.tsx`
- `features/works/components/WorksTableWrapper.tsx`
- `features/projects/estimates/components/table/EstimateTable.client.tsx`
  (наиболее тяжёлая собственная реализация)

**Что делать:**
1. Вынести общий `EntityTable` (slot для toolbar, slot для пустого
   состояния, обёртка над `DataTable` + `TableEmptyState`) в
   `shared/ui/entity-table.tsx`.
2. Все три `*TableWrapper.tsx` свести к тонким адаптерам.
3. `EstimateTable.client.tsx` оставить как специальный кейс с
   inline-редактированием, но вынести его примитивы (`EditableCell`
   и т.п.) в `entities/estimate/ui/`.

---

## 6. 🟡 Стилевые токены Badge утекли в фичи

Варианты Badge не описаны через CVA в `shared/ui/badge.tsx`, а
расползлись строковыми картами по фичам.

**Свидетельства:**
- `features/projects/shared/ui/project-badge-styles.ts`
- `features/projects/estimates/components/estimate-badge-styles.ts`

**Что делать:**
1. Описать варианты статусов проекта/сметы как `variants` в CVA
   `Badge` в `shared/ui/badge.tsx`.
2. Удалить `*-badge-styles.ts`, заменить вызовы на `<Badge variant=…>`.
3. Если статусов слишком много (домен-специфично), оставить тонкие
   доменные обёртки в `entities/project/ui/ProjectStatusBadge.tsx` и
   `entities/estimate/ui/EstimateStatusBadge.tsx` поверх `Badge`.

---

## 7. 🟢 Незавершённая миграция `@/shared/ui/*` → `@repo/ui`

`replit.md` пишет: «All app files import UI primitives from `@repo/ui`
instead of `@/shared/ui/*`». Фактически ~26 файлов всё ещё импортируют
напрямую из `@/shared/ui/*`. Большая часть — внутри самой дизайн-системы
(`shared/ui/*` и `shared/ui/auto-form/*`), что нормально, но есть и
обычные потребители.

**Свидетельства (выборка):**
- `shared/ui/data-table.tsx` (6 импортов из `@/shared/ui/*`)
- `shared/ui/sidebar.tsx` (5)
- `shared/ui/auto-form/index.tsx` и поля `auto-form/fields/*`
- `shared/ui/search-input.tsx`, `input-group.tsx`, `toggle-group.tsx`,
  `kpi-card.tsx`, `item.tsx`, `form.tsx`, `field.tsx`, `date-picker.tsx`,
  `command.tsx`, `button-group.tsx`, `table-empty-state.tsx`

**Что делать:**
1. Внутри `shared/ui/*` перейти с `@/shared/ui/*` на относительные
   пути (`./input`, `./separator`) — это убирает зацикленность с
   `@repo/ui` и ускоряет сборку.
2. Добавить ESLint-правило для `shared/ui/**`, запрещающее
   `@/shared/ui/*` (только относительные пути).
3. Для `app/**`/`features/**`/`entities/**` добавить запрет на
   `@/shared/ui/*` (импортировать только из `@repo/ui`), сейчас
   запрещён только `@/components/ui/*`.

---

## 8. 🟢 Inline-стили перебивают варианты примитивов

Точечный пример: `features/catalog/components/MaterialCatalogDialog.client.tsx`
передаёт в `DialogContent` массивный `className` с inline-сайзингом
(`h-[100dvh] w-screen max-w-[1024px]…`), фактически переопределяя
дефолтный размер диалога. То же самое периодически встречается у
`Sheet`/`Drawer`.

**Что делать:**
1. Добавить в `Dialog` и `Sheet` варианты `size` (`sm` / `md` / `lg`
   / `full`) через CVA.
2. Запретить ESLint-правилом передачу tailwind-токенов сайзинга в
   `className` для shadcn-примитивов (на уровне soft-warn).

---

## Дорожная карта

Порядок выбран так, чтобы сначала закрыть «утечки» в
дизайн-системе и поставить ESLint-сетку (профилактика регрессий),
а уже потом чистить дублирование.

| Приоритет | Категория | Предлагаемое действие | Будущая задача |
|---|---|---|---|
| P0 | §1 Фиктивный `@repo/ui` барьер | Перенести `Button`/`Input` в `shared/ui/`, удалить `components/ui/`, обновить ESLint | TBD |
| P0 | §3 Сырые HTML-элементы | Расширить `no-restricted-syntax` (form/input/select/textarea), перевести формы на shadcn `Form` | TBD |
| P0 | §7 Незавершённая миграция | Запретить `@/shared/ui/*` в `app/features/entities`, перевести `shared/ui/*` на относительные пути | TBD |
| P1 | §2 Кросс-фичевые импорты | Поднять общие компоненты в `entities/`/`shared/ui/`, добавить ESLint-запрет на `@/features/*` между фичами | TBD |
| P1 | §4 Несогласованные модалки | Принять правило Dialog vs Sheet vs AlertDialog, добавить `CrudFormDialog`/`CrudFormSheet` | TBD |
| P2 | §5 Дублирование таблиц | Завести `EntityTable` в `shared/ui/`, свести `*TableWrapper.tsx` к адаптерам | TBD |
| P2 | §6 Badge-стили в фичах | Перевести варианты в CVA `Badge`, удалить `*-badge-styles.ts` | TBD |
| P3 | §8 Inline-стили в `DialogContent` | Добавить варианты `size` в `Dialog`/`Sheet`, soft-warn на токены сайзинга | TBD |

Колонка **«Будущая задача»** заполняется командой по мере планирования
работ.

## Что НЕ входит в этот PR

- Любые правки кода приложения, ESLint-конфига, компонентов, тестов.
- Конкретные шаги рефакторинга — они оформятся отдельными задачами по
  результатам ревью этого документа.
