# UI Refactor Plan v2 — Единый Ownership Классов

> **Цель:** Все UI-компоненты управляются из `shared/ui/`, все CSS-токены из `primitive-density.ts`, ни одного локального Tailwind-класса в `features/` и `app/`, у каждого класса ровно один хозяин.

## Текущее состояние (аудиты)

| Метрика | Значение |
|---|---|
| Shared UI компонентов | ✅ 24 каноничных |
| Visual расхождений | 1218 (281 medium, 937 low) |
| Raw HTML violations (features) | 17 — <form>/<input> в обход shared/ui |
| Bare Button/Input без size | 105 — получают xs (h-7) вместо default (h-9) |
| "Unknown" ownership стилей | 335 — классы без хозяина |
| UI entrypoints | 3 шт — components/ui vs shared/ui vs packages/ui |
| DESIGN_SYSTEM.md | Устарел на ~40% |
| ErrorState | Существует, импортится 0 раз |

---

## Этапы (с dependency-графом)

```
PR-A ──→ PR-B ──→ PR-C ──→ PR-D ──→ PR-E
                                     │
                          ┌──────────┘
                          ▼
                      PR-F ──→ PR-G
```

---

### PR-A: Устранить Raw HTML violations (17 шт)
**Owner:** Субагент UI Cleanup #1

Заменить нативные `<form>`, `<input>`, `<button>` в `features/` на каноничные компоненты из `shared/ui/`.

**Конкретно:**
- 10 `<form>` → заменить на `FormLayout` или `<form>` через shared/form
- 7 `<input>` → заменить на `<Input>` из `shared/ui/input.tsx`
- `<button>` в `data-table.tsx` и `sidebar.tsx` — оставить, они в shared/ui (allowed)

**Файлы:**
- `features/admin/components/admin-user-menu.tsx`
- `features/admin/components/impersonate-button.tsx`
- `features/auth/components/ForgotPasswordForm.tsx`
- `features/auth/components/LoginForm.tsx`
- `features/auth/components/ResetPasswordForm.tsx`
- `features/counterparties/components/CreateCounterpartySheet.tsx`
- `features/material-suppliers/components/CreateMaterialSupplierSheet.tsx`
- `features/projects/estimates/components/CreateEstimateDialog.tsx`
- `features/settings/screens/AdminGeneralSettingsScreen.tsx`
- `features/settings/screens/AdminSecuritySettingsScreen.tsx`
- `features/team/components/InviteTeamMemberCard.tsx`
- `features/global-purchases/components/GlobalPurchasesImportExportActions.tsx`
- `features/_shared/guide-catalog/components/CatalogScreenShell.tsx`

**Acceptance:**
- `pnpm audit:ui-inventory` — 0 Raw HTML violations в features/
- `pnpm lint && pnpm type-check`

---

### PR-B: Добавить size пропсы на 105 bare Button/Input
**Owner:** Субагент UI Cleanup #2

105 кнопок/инпутов без явного `size` получают `xs` (h-7) по умолчанию. Нужно проставить явный `size` согласно контексту:

| Контекст | Размер |
|---|---|
| toolbar-action | `size="default"` (h-9) |
| default-control (диалоги/формы) | `size="default"` (h-9) |
| table-cell (внутри таблиц) | `size="sm"` (h-8) |
| compact-candidate (календарь, sidebar) | `size="xs"` (h-7) — оставить |

**Acceptance:**
- Новый inventory покажет 0 bare
- `pnpm test` зелёный

---

### PR-C: Обновить DESIGN_SYSTEM.md
**Owner:** azap

Привести документ в соответствие с реальным кодом:
- Button sizes из `primitive-density.ts` (default=h-9, xs=h-7, sm=h-8, lg=h-10, xl=h-12)
- Input sizes (default=h-9, sm=h-8, xs=h-7)
- Добавить раздел про варфрейм (PageShell → ContentContainer → PageHeader)
- Добавить раздел про ownership — какие классы где должны жить
- Удалить/пометить мёртвым `docs/design-system/smetalab/MASTER.md`
- Удалить дубликат DESIGN_SYSTEM правил в `.agents/rules/design-system.md` (заменить ссылкой)

---

### PR-D: Деплоинг unknown ownership (335 → 0)
**Owner:** Субагент UI Visual Audit

Каждому из 335 "unknown" finding'ов в ui-visual-audit присвоить ownership:
- Если класс/токен уже есть в `primitive-density.ts` → `primitive-contract`
- Если класс/токен есть в shared/ui компоненте → `feature-family-contract`
- Если класс специфичен для фичи → вынести в shared/ui или явно задекларировать

**Acceptance:**
- Новый `pnpm audit:ui:visual` — 0 unknown
- Сгенерировать обновлённый canonical-spec

---

### PR-E: ErrorState — включить в импорты
**Owner:** Субагент UI Cleanup #3

`shared/ui/states/ErrorState.tsx` существует, но никем не импортится. Найти места где сейчас используется сырой error-handling и подключить ErrorState.

**Acceptance:**
- `pnpm audit:ui-inventory` покажет ErrorState как imported

---

### PR-F: Свести 3 UI entrypoint к одному (shared/ui)
**Owner:** Субагент Архитектор

Провести аудит:
- `components/ui/` — какие компоненты не дублируются в `shared/ui/`
- `packages/ui/` — какие экспорты не дублируются
- Перенести недостающие, удалить дубликаты
- Обновить все импорты в проекте

**Acceptance:**
- Все импорты `@/components/ui/*` → `@/shared/ui/*`
- `pnpm audit:ui-inventory` — 0 нарушений по entrypoint

---

### PR-G: Аудит локальных Tailwind-классов в features/
**Owner:** Субагент CSS Audit

Пробежаться по `features/` и `app/`:
- Найти все кастомные Tailwind-классы (не из `cn(primitive*)` и не из shared/ui)
- Вынести в `shared/ui/` или в `primitive-density.ts`
- Цель: 0 локальных стилей в features/

**Acceptance:**
- `pnpm audit:ui:visual` — 1218 → 0
- Все стили имеют владельца

---

## Приоритет

```
┌─────────┬──────────────────────────────────────┬──────────────┐
│ PR      │ Что                                 │ Зависит от   │
├─────────┼──────────────────────────────────────┼──────────────┤
│ PR-A    │ Raw HTML violations (17 шт)          │ —            │
│ PR-B    │ Bare Button/Input (105 шт)           │ —            │
│ PR-C    │ DESIGN_SYSTEM.md                     │ —            │
│ PR-D    │ Unknown ownership (335)              │ PR-C         │
│ PR-E    │ ErrorState импорты                   │ —            │
│ PR-F    │ 3 entrypoint → 1                     │ PR-A, PR-B   │
│ PR-G    │ Локальные классы → 0                │ PR-D, PR-F   │
└─────────┴──────────────────────────────────────┴──────────────┘
```

## Глобальная верификация

После каждого PR:
```bash
pnpm lint
pnpm type-check
pnpm audit:ui
```
