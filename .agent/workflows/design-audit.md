---
description: Аудит и исправление UI-компонентов по DESIGN_SYSTEM.md. Проверка кнопок, инпутов, теней, отступов и адаптивности.
---

# Design System Audit

Аудит существующих компонентов на соответствие `docs/DESIGN_SYSTEM.md`.

## Подготовка

// turbo-all

1. Прочитай файл `docs/DESIGN_SYSTEM.md` полностью
2. Загрузи скилл `.agent/skills/ui-ux-pro-max/SKILL.md`

## Шаг 1: Поиск нарушений

Выполни grep-поиск по всем компонентам в `features/` и `components/`:

// turbo
3. Найди все `size="sm"` на кнопках:
```bash
grep -rn 'size="sm"' features/ components/ --include="*.tsx" | grep -i button
```

// turbo
4. Найди все `shadow-xs` (должен быть `shadow-sm`):
```bash
grep -rn 'shadow-xs' features/ components/ --include="*.tsx"
```

// turbo
5. Найди все `h-8` на кнопках тулбаров (должен быть `h-9`):
```bash
grep -rn 'h-8' features/ --include="*.tsx" | grep -i -E '(button|btn|toolbar|action)'
```

// turbo
6. Найди все `space-y-6` (должен быть `space-y-4`):
```bash
grep -rn 'space-y-6' features/ --include="*.tsx"
```

// turbo
7. Найди пустые div-обёртки:
```bash
grep -rn 'className="hidden"' features/ --include="*.tsx"
```

## Шаг 2: Анализ

8. Для каждого найденного файла:
   - Открой файл и определи контекст использования
   - Если это кнопка тулбара/хедера → исправь на `h-9 shadow-sm font-semibold tracking-tight transition-all active:scale-95`
   - Если это `shadow-xs` в тулбаре → замени на `shadow-sm`
   - Если это `space-y-6` → замени на `space-y-4`
   - Если это пустой div → удали

## Шаг 3: Визуальная проверка

9. Для каждой изменённой страницы:
   - Открой в браузере
   - Сделай скриншот desktop (1440x900)
   - Сделай скриншот mobile (375x812)
   - Убедись что нет горизонтального overflow на 375px

## Шаг 4: Отчёт

10. Создай отчёт в формате:

```
### Design Audit Report

| Файл | Проблема | Исправление | Статус |
|---|---|---|---|
| file.tsx | `size="sm"` на кнопке | → `className="h-9"` | ✅ |
```

## Правила аудита

- **НЕ трогай** кнопки внутри таблиц (action cells) — они могут быть `size="sm"` / `icon-sm`
- **НЕ трогай** кнопки в диалогах/формах — у них свой контекст
- **Фокус** на тулбарах, хедерах и экшен-зонах страниц
- Всегда проверяй адаптивность после изменений
