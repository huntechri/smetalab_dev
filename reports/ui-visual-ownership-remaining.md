# Оставшиеся 19 unknown — классификация ownership

## Итог классификации
- **`primitive-contract`:** 14
- **`feature-family-contract`:** 5

---

## Детальная таблица

| # | Файл | Токен | Новый ownership | Обоснование |
|---|---|---|---|---|
| 1 | `components/layout/active-team-indicator.tsx:37` | `max-w-[70px]` | `feature-family-contract` | Произвольное значение ширины, специфично для индикатора активной команды. Не является токеном дизайн-системы |
| 2 | `components/layout/app-header.tsx:15` | `px-3` | `primitive-contract` | Padding-токен используется в `primitive-density.ts` (кнопка sm). Layout должен потреблять примитив |
| 3 | `components/layout/app-header.tsx:15` | `px-4` | `primitive-contract` | Padding-токен используется в `primitive-density.ts` (кнопка default). Layout должен потреблять примитив |
| 4 | `components/layout/app-header.tsx:15` | `px-6` | `primitive-contract` | Padding-токен используется в `primitive-density.ts` (кнопка lg, card). Layout должен потреблять примитив |
| 5 | `components/layout/app-sidebar.tsx:93` | `px-2` | `primitive-contract` | Padding-токен используется в `primitive-density.ts` (badge, кнопка xs). Layout должен потреблять примитив |
| 6 | `components/layout/app-sidebar.tsx:93` | `py-4` | `primitive-contract` | Padding-токен используется в `primitive-density.ts` (accordion). Layout должен потреблять примитив |
| 7 | `components/layout/app-sidebar.tsx:99` | `px-4` | `primitive-contract` | Padding-токен используется в `primitive-density.ts`. Layout должен потреблять примитив |
| 8 | `components/layout/app-sidebar.tsx:99` | `py-6` | `primitive-contract` | Padding-токен используется в `primitive-density.ts` (`primitiveCardBasePaddingClassName`). Layout должен потреблять примитив |
| 9 | `components/layout/app-sidebar.tsx:135` | `px-3` | `primitive-contract` | Padding-токен используется в `primitive-density.ts` (кнопка sm, input). Layout должен потреблять примитив |
| 10 | `components/layout/app-sidebar.tsx:135` | `py-5` | `primitive-contract` | Кастомный padding в shared layout. Должен быть либо добавлен в `primitive-density.ts`, либо заменён на существующий токен |
| 11 | `components/layout/app-sidebar.tsx:136` | `items-center` | `feature-family-contract` | Часть кастомного badge-стилинга sidebar (строки 135–142). Feature-specific flex utility для оранжевого бейджа |
| 12 | `components/layout/app-sidebar.tsx:136` | `from-orange-500` | `feature-family-contract` | Кастомный градиентный цвет для бейджа статуса в sidebar. Feature-specific, не в primitives |
| 13 | `components/layout/app-sidebar.tsx:136` | `to-orange-600` | `feature-family-contract` | Кастомный градиентный цвет для бейджа статуса в sidebar. Feature-specific, не в primitives |
| 14 | `components/layout/app-sidebar.tsx:136` | `ring-orange-400/30` | `feature-family-contract` | Кастомный ring-цвет для бейджа статуса в sidebar. Feature-specific, не в primitives |
| 15 | `components/layout/app-sidebar.tsx:142` | `px-2` | `primitive-contract` | Padding-токен используется в `primitive-density.ts`. Layout должен потреблять примитив |
| 16 | `components/navigation/sidebar-nav.tsx:37` | `py-3` | `primitive-contract` | Padding-токен используется в `primitive-density.ts`. Layout должен потреблять примитив |
| 17 | `components/navigation/sidebar-nav.tsx:38` | `px-3` | `primitive-contract` | Padding-токен используется в `primitive-density.ts`. Layout должен потреблять примитив |
| 18 | `components/navigation/sidebar-nav.tsx:40` | `px-2` | `primitive-contract` | Padding-токен используется в `primitive-density.ts`. Layout должен потреблять примитив |
| 19 | `components/navigation/sidebar-nav.tsx:50` | `px-4` | `primitive-contract` | Padding-токен используется в `primitive-density.ts`. Layout должен потреблять примитив |

---

## Сводка по ownership

| Ownership | Количество | Описание |
|---|---|---|
| `primitive-contract` | 14 | Все padding-токены в shared layout-компонентах (app-header, app-sidebar, sidebar-nav). Должны потребляться через `primitive-density.ts` |
| `feature-family-contract` | 5 | Специфичные для фичи: `max-w-[70px]` (active-team-indicator), оранжевый градиентный бейдж (app-sidebar:136) |
