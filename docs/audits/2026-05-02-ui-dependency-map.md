# 🗺 UI Dependency Map — Smetalab

> **Полная карта:** откуда берутся UI-элементы, куда импортятся, что дублируется, что не используется.
> Дата: 2026-05-02

---

## 🔑 Легенда

| Метка | Значение |
|-------|----------|
| ✅ | Единый источник. Все импортят из одного места |
| ⚠️ | Несколько источников. Могут быть расхождения |
| ❌ | Зоопарк. Разные компоненты для одной сущности |
| 🔴 | Мёртвый код. Компонент в shared/ui, но никем не используется |

---

## 1. Компоненты — один хозяин

### ✅ Button
**Мастер:** `shared/ui/button.tsx` (98 строк)
**Мост-мусор:** `components/ui/button.tsx` (2 строки, реэкспорт из shared — удалить)
**Используется:** 64 файла по всему проекту
**Проблема:** default size = `xs` (h-7). DESIGN_SYSTEM говорит h-9 для тулбаров

### ✅ Input
**Мастер:** `shared/ui/input.tsx`
**Мост-мусор:** `components/ui/input.tsx` (2 строки, реэкспорт)
**Используется:** 20 файлов

### ✅ Form / Field / Label
**Мастер:** `shared/ui/form.tsx` + `shared/ui/label.tsx`
**Используется:** 10 файлов
**Проблема:** `form.tsx` — мёртвый null guard (`useFormField` вне `<FormField>` не падает с ошибкой)

### ✅ Toolbar + ToolbarButton
**Мастер:** `shared/ui/toolbar.tsx` + `shared/ui/toolbar-button.tsx`
**Используется:** 10 + 7 файлов

### ✅ DataTable + TableShell
**Мастер:** `shared/ui/data-table.tsx` + `shared/ui/data-table-shell.tsx`
**Используется:** 7 + файлы

### ✅ Dialog / Sheet / Drawer
**Мастер:** `shared/ui/dialog.tsx`, `shared/ui/sheet.tsx`, `shared/ui/drawer.tsx`
**Используется:** 8 + 4 + 0 файлов (Drawer — 0, мёртвый)

### ✅ DropdownMenu / Popover / Tooltip
**Мастер:** `shared/ui/`
**Используется:** 9 + 8 + 9 файлов

### ✅ Sidebar
**Мастер:** `shared/ui/sidebar.tsx` (692 строки)
**Используется:** 6 файлов (layout + components)

---

## 2. Компоненты с проблемами

### ❌ CARD — зоопарк из 5+ реализаций

| Файл | Стиль | Используется |
|------|-------|-------------|
| `shared/ui/card.tsx` | rounded-xl, border, shadow-sm, py-6, gap-6 | 18 файлов |
| `shared/ui/card-shell.tsx` | Через Surface, 3 плотности | 5 файлов |
| `shared/ui/dense-card.tsx` | rounded-md→lg, shadow хардкодом | 1 файл |
| `shared/ui/kpi-card.tsx` | Через card-shell + свои тона | 4 файла |
| `shared/ui/admin-surface.tsx` (AdminMetricCard) | Свой Card, свой CardHeader | 13 файлов (в админке) |
| `features/projects/list/components/project-card.tsx` | Свой стиль | 1 файл |
| `features/global-purchases/components/cards/GlobalPurchaseCard.tsx` | Через DenseCard | 1 файл |
| `features/projects/estimates/components/table/EstimateCardsTable.tsx` | Свой рендер | 1 файл |
| `features/projects/dashboard/components/ProjectEstimatesCards.tsx` | Свой компонент | 1 файл |

**Итог:** 9+ точек определения карточки. Должно быть: 1.

### ⚠️ BADGE — два разных компонента

| Компонент | Файл | Используется |
|-----------|------|-------------|
| `Badge` (shadcn) | `shared/ui/badge.tsx` | 6 файлов |
| `StatusBadge` (тонированный) | `shared/ui/status-badge.tsx` | 11 файлов |

**Проблема:** StatusBadge использует **хардкод Tailwind-цветов** (не CSS-переменные):
```
success → bg-emerald-500/40
info    → bg-blue-500/60
warning → bg-amber-500/50
danger  → bg-rose-500/50
paused  → bg-violet-500/40
```
В globals.css уже есть `--color-success`, `--color-brand` — но StatusBadge их игнорирует.

### ❌ admin-surface.tsx — "чёрная дыра"

**Файл:** `shared/ui/admin-surface.tsx` (340 строк)
**Используется:** 13 файлов (все админские страницы)

**Содержит собственные версии:**
```
AdminPageShell        ← мог быть card-shell с variant="admin"
AdminPageHeader       ← мог быть обычный заголовок
AdminPageHeading      ← мог быть обычный h1
AdminMetricCard        ← собственный Card/CardHeader/CardTitle
AdminSectionCard       ← собственный Card
AdminTenantCard        ← собственный Card
AdminPricingCard       ← собственный Card
AdminListCard          ← собственный Card
AdminStatusBadge       ← копия StatusBadge (с другими цветами)
AdminIconFrame         ← уникальный компонент
AdminMetricGrid        ← Grid
AdminCardGrid          ← Grid
AdminList              ← список
```

**Итог:** Админка — отдельная вселенная со своими стилями, не совпадающими с основной DS.

---

## 3. Мёртвые компоненты в shared/ui (26 штук)

Лежат в `shared/ui/`, но **ни один файл проекта их не импортирует:**

```
accordion       aspect-ratio    breadcrumb      button-group
carousel        chart           checkbox        collapsible
context-menu    drawer          field           hover-card
input-group     input-otp       item            kbd
menubar         navigation-menu pagination      primitive-density
resizable       slider          spinner         surface
toggle          toggle-group
```

> 💡 `field.tsx` и `surface.tsx` — вероятно, устаревшие. spinner дублирует loading-indicator. Остальные — стандартный shadcn, могут пригодиться.

---

## 4. packages/ui — мёртвый пакет

**Файл:** `packages/ui/src/index.ts`

- Экспортирует 63 компонента через `../../../shared/ui/*`
- **Никто в проекте** не импортирует из `packages/ui/`
- Пути — относительные `../../../shared/ui/`, сломаются при реструктуризации

---

## 5. Постраничный map

### Workspace (основные экраны)

#### 📄 app/(workspace)/app/page.tsx — Dashboard
```
→ features/dashboard/screens/AppHomeScreen
  HomeKpiCards          → kpi-card, card-shell
  TodayFocusSection     → badge, status-badge
  TeamWidgetSection     → button, avatar, card-shell, status-badge
  ProjectEstimatesCards → alert-dialog, button
```

#### 📄 app/(workspace)/app/projects/page.tsx — Список проектов
```
→ features/projects/list/screens/ProjectListScreen
  ProjectListScreen     → data-table
  project-card          → card, badge
  projects-toolbar      → button, toolbar-button
  create-project-dialog → dialog, button, input, form
```

#### 📄 app/(workspace)/app/projects/[projectId]/estimates/[estimateId]/page.tsx — Смета
```
→ features/projects/estimates/screens/
  EstimateTable          → button, data-table, action-menu
  EstimateTableToolbar   → toolbar, toolbar-button, button, input
  EstimateCardsTable     → card, dense-list
  EstimateHeader         → button, status-badge, alert-dialog
```

#### 📄 app/(workspace)/app/global-purchases/page.tsx — Закупки
```
→ features/global-purchases/screens/GlobalPurchasesScreen
  GlobalPurchasesView     → dense-card
  GlobalPurchasesToolbar  → toolbar-button, tooltip, button
  GlobalPurchasesCardsList→ GlobalPurchaseCard → dense-card
  global-purchases-columns→ button, tooltip, alert-dialog
```

#### 📄 app/(workspace)/app/team/page.tsx — Команда
```
→ features/team/screens/TeamScreen
  TeamMembersCard       → button, avatar, action-menu, status-badge
  TeamHeaderCard        → card
  InviteTeamMemberCard  → button, input
```

#### 📄 app/(workspace)/app/patterns/page.tsx — Паттерны
```
→ features/patterns/screens/PatternsScreen
  → button, card, badge
```

#### 📄 app/(workspace)/app/settings/page.tsx — Настройки
```
→ features/settings/screens/user-settings-page
  → button, card
```

#### 📄 app/(workspace)/app/guide/* — Справочники (5 экранов)
```
→ features/_shared/guide-catalog/
  CatalogToolbar        → toolbar-button, alert-dialog, tooltip
  CatalogFilterSidebar  → button
  CatalogTableWrapper   → button, data-table
```

### Auth

| Страница | Компоненты |
|----------|-----------|
| sign-in | `LoginForm` → button, input, label |
| sign-up | `SignUpForm` → button, input, label |
| forgot-password | `ForgotPasswordForm` → button, input, label |
| reset-password | `ResetPasswordForm` → button, input, label |
| verify-email | `verifyEmail` server action + button |

**Общие проблемы auth:**
- Пароль возвращается в HTML при ошибке (LoginForm)
- maxLength=50 на email, а Zod ждёт 255
- Нет сверки паролей на клиенте (ResetPasswordForm)
- verify-email вызывает server action из server component (SSR)

### Admin

| Страница | Компоненты |
|----------|-----------|
| dashboard/general | всё через admin-surface |
| dashboard/activity | admin-surface |
| dashboard/permissions | admin-surface |
| dashboard/security | admin-surface |
| dashboard/tenants | admin-surface + button |
| dashboard/tenants/[id] | admin-surface + button + tabs |
| pricing | admin-surface (AdminPricingCard) |

---

## 6. Цвета — DS vs код

| Переменная | DESIGN_SYSTEM.md | globals.css (реальность) |
|-----------|-----------------|------------------------|
| `--primary` | 222.2 47.4% 11.2% | hsl(240 5.9% 10%) |
| `--foreground` | 222.2 84% 4.9% | hsl(240 10% 3.9%) |
| `--secondary` | 210 40% 96.1% | hsl(240 4.8% 95.9%) |
| `--muted-foreground` | 215.4 25% 27% | hsl(240 3.8% 46.1%) |

**Ни один HSL токен не совпадает.** DS описывает синеватый оттенок (hue ~222). Код использует нейтральный (hue 240).

**В коде есть, в DS нет:**
- `--color-brand` (оранжевый, hsl 14 100% 62%)
- `--color-success` (зелёный, hsl 142 71% 35%)
- `--color-chart-1..5` (цвета графиков)

---

## 7. Сводка

| Категория | Статус | Что делать |
|-----------|--------|-----------|
| **Button** | ✅ Единый источник | Удалить components/ui/button (мост) |
| **Input** | ✅ Единый источник | Удалить components/ui/input |
| **Form / Field** | ⚠️ form.tsx — баг | Починить null guard |
| **Toolbar** | ✅ Единый источник | Чисто |
| **DataTable** | ✅ Единый источник | Чисто |
| **Sidebar** | ✅ Единый источник | Чисто (но кука не читается) |
| **Card** | ❌ Зоопарк (9+) | Свести к 1-2 вариантам |
| **Badge** | ⚠️ 2 компонента | StatusBadge → CSS-переменные |
| **admin-surface** | ❌ Своя вселенная | Разобрать, перевести на CardShell |
| **packages/ui** | ❌ Мёртвый пакет | Удалить или переписать |
| **26 компонентов** | 🔴 Не используются | Оставить (shadcn) или удалить |
| **Шрифт** | ❌ Manrope не загружен | Добавить next/font |
| **Цвета** | ❌ DS vs код не совпадают | Синхронизировать |
| **error.tsx** | ❌ Нет в route-группах | Добавить |
| **lang** | ❌ "en" вместо "ru" | Исправить |
