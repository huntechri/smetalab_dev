---
description: Дизайн-система Smetalab. Справочник по UI-стандартам: кнопки, инпуты, шрифты, тени, layout. Обязательно применять при создании или изменении компонентов и страниц.
---

# Smetalab Design System Rules

При работе с UI компонентами, **обязательно прочитай** полный гайд дизайн-системы:

📖 **`docs/DESIGN_SYSTEM.md`**

## Ключевые правила

1. **Кнопки тулбаров**: `h-9 font-semibold tracking-tight shadow-sm transition-all active:scale-95`
2. **Поля ввода**: `h-9 shadow-sm` в тулбарах
3. **Отступы**: `space-y-4` между секциями
4. **Тени**: `shadow-sm` (не `shadow-xs`) для всех интерактивных тулбар-элементов
5. **Шрифт**: `Manrope` (Google Fonts, `--font-manrope`)
6. **Иконки**: `lucide-react`, стандартный размер `h-4 w-4`
7. **Адаптивность**: `flex-col → sm:flex-row`, `text-xs md:text-sm`
8. **Не создавать** пустые div-обёртки без контента
9. **Не использовать** `size="sm"` на кнопках тулбаров — прямой `className="h-9"`
