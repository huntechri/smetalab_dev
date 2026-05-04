# 🏗️ Smetalab — Agent Architecture Guide

## UI Ownership Model (обязательно для всех агентов)

После Epic #275 весь UI следует строгой модели владения классами.

### 🔑 Главное правило

> **Feature выбирает СМЫСЛ (semantic props). Shared/ui владеет КЛАССАМИ (Tailwind/CSS).**

Никаких прямых Tailwind классов в `features/` и `app/` для визуального стиля. Используй shared-компоненты с semantic props.

### 📦 Как это работает

```tsx
// ❌ ПЛОХО — локальные классы в feature
<div className="rounded-xl border bg-card shadow-sm p-4">
  <h2 className="text-lg font-semibold">Заголовок</h2>
</div>

// ✅ ХОРОШО — shared-контракт с semantic props
<CardShell variant="card" shadow="sm">
  <CardShellHeader>
    <h2 className="text-lg font-semibold">Заголовок</h2>
  </CardShellHeader>
</CardShell>
```

### 🧩 Основные shared-контракты

| Компонент | Semantic props | Где |
|-----------|---------------|-----|
| `CardShell` | `variant`, `shadow`, `density` | `shared/ui/card-shell.tsx` |
| `Surface` | `variant`, `tone`, `density`, `radius`, `shadow`, `border` | `shared/ui/surface.tsx` |
| `Badge` | `variant`, `size` | `shared/ui/badge.tsx` |
| `StatusBadge` | `tone`, `size` | `shared/ui/status-badge.tsx` |
| `AuthShell` / `AuthPanel` | — | `shared/ui/auth-shell.tsx` |
| `MarketingShell` (hero, section, card, CTA) | `variant` | `shared/ui/marketing-shell.tsx` |
| `AppHeaderShell` | — | `shared/ui/app-header.tsx` |
| `SidebarNavItem` | `isActive` | `shared/ui/sidebar-nav-item.tsx` |
| `CatalogListItem` | `isSelected` | `shared/ui/catalog-list-item.tsx` |
| `DashboardPageStack` / `DashboardSectionStack` | — | `shared/ui/dashboard-layout.tsx` |
| `KPICard` | `valueTone`, `density` | `shared/ui/kpi-card.tsx` |

### 📐 Token-файлы (примитивы)

11 domain-файлов в `shared/ui/primitive-*.ts`:
- `badge`, `chart`, `controls`, `density`, `form`, `marketing`, `navigation`, `overlay`, `spacing`, `surface`, `table`

Не добавляй всё в `primitive-density.ts` — используй доменный файл.

### 📋 Чек-лист перед созданием UI

1. Есть ли подходящий shared-компонент? → Используй его с semantic props
2. Есть ли подходящий token? → Используй из `shared/ui/primitive-*.ts`
3. Нужен новый компонент? → Создай в `shared/ui/`, не в `features/`
4. `variant`, `density`, `tone` → в props, не в className
5. `radius`, `shadow`, `overflow` → в className, не в props (guardrail)

### 🛡️ Guardrail

Скрипт `scripts/audit-ui-changed-visual-ownership.ts` проверяет новый код. Запускается в CI. Если упал — не мержить.

**Пропускает** approved shared-контракты: `Surface`, `CardShell`, `PageShell`, `Section`, `Badge`, `StatusBadge`, `Toolbar`, `FilterBar` и т.д.

### 📚 Документация

- `docs/ui/UI_GOVERNANCE.md` — полные правила ownership (839 строк)
- `docs/ui/REFACTOR_AUDIT.md` — аудит проделанного рефакторинга
- `docs/ui/REFACTOR_PLAN_UPDATED.md` — план фаз
- `docs/DESIGN_SYSTEM.md` — дизайн-система (устаревает, приоритет shared-контрактов)
