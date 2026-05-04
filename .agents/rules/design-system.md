---
description: Дизайн-система Smetalab. UI ownership model — shared contracts с semantic props. Обязательно прочитай .agents/AGENTS.md перед созданием UI.
---

# Smetalab UI Ownership Model

После Epic #275 весь UI использует **shared-контракты с semantic props**. Локальные Tailwind-классы в features/app запрещены для визуального стиля.

## Перед началом работы

**ОБЯЗАТЕЛЬНО прочитай:** `.agents/AGENTS.md` — полный гайд по UI ownership model

Дополнительно: `docs/ui/UI_GOVERNANCE.md`, `docs/DESIGN_SYSTEM.md`

## Ключевые правила

1. **Feature выбирает СМЫСЛ** (variant, tone, density). **Shared/ui владеет классами**.
2. **CardShell** для карточек (не Surface напрямую, не div с классами)
3. **Badge / StatusBadge** для бейджей и статусов
4. **AuthShell / AuthPanel** для страниц логина
5. **MarketingHero / MarketingSection / MarketingCard** для лендинга
6. **DashboardPageStack / KPICard** для дашбордов
7. **Button, Input, Select** — все через shared/ui (не raw HTML)
8. **Иконки**: `lucide-react`, стандартный размер `h-4 w-4` (через shared, не inline)
9. **Шрифт**: `Manrope` (наследуется, не задавай локально)
10. **Не создавать** пустые div-обёртки без контента
11. **Не писать** raw `<form>/<input>/<button>` в features — используй shared-контракты
12. **Не использовать** `variant`/`radius`/`shadow`/`overflow` как props на shared-компонентах — передавай через `className`

## Token-файлы

Визуальные примитивы в `shared/ui/primitive-*.ts` (11 доменов). Не добавляй всё в `primitive-density.ts`.
