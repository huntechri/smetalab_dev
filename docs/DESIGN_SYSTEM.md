# Smetalab Design System

> Справочник по UI/UX стандартам проекта.
> Агент **обязан** использовать этот документ при создании/изменении любых компонентов и страниц.

---

## 1. Шрифт

| Параметр | Значение |
|---|---|
| **Семейство** | `Manrope` (Google Fonts) |
| **Подмножества** | `latin`, `cyrillic` |
| **CSS-переменная** | `--font-manrope` |
| **Fallback** | `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| **Рендеринг** | `antialiased` (`font-smooth`) |

---

## 2. Типографика (утилити-классы)

| Класс | Стиль | Использование |
|---|---|---|
| `.text-display` | `text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight` | Заголовки лендингов, Hero-секции |
| `.text-title` | `text-xl sm:text-2xl font-semibold tracking-tight leading-snug` | Заголовки страниц, Card-заголовки |
| `.text-subtitle` | `text-sm sm:text-base font-medium text-muted-foreground leading-6` | Подзаголовки, описания |
| `.text-body` | `text-sm sm:text-base leading-6` | Основной текст |
| `.text-caption` | `text-xs text-muted-foreground leading-5` | Подписи, метаданные |

---

## 3. Кнопки (Button)

### 3.1 Размеры (из `primitiveButtonSizeClassNames`)

| Size prop | Классы | Примечание |
|---|---|---|
| `default` | `h-9 px-4 py-2 has-[>svg]:px-3` | Стандартный |
| `xs` | `h-7 px-2 py-1 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3` | Микро-действия, inline |
| `sm` | `h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5` | Компактный |
| `lg` | `h-10 rounded-md px-6 has-[>svg]:px-4` | Крупный |
| `xl` | `h-12 rounded-xl px-8 text-base has-[>svg]:px-6` | XL |
| `icon` | `size-9` | Квадратная иконка |
| `icon-xs` | `size-7 rounded-md [&_svg:not([class*='size-'])]:size-3` | Маленькая иконка |
| `icon-sm` | `size-8` | Средняя иконка |
| `icon-lg` | `size-10` | Большая иконка |

### 3.2 Стандарт для тулбаров и действий на страницах

> **Все кнопки тулбаров, хедеров и экшен-зон страниц** используют следующий стиль:

```tsx
<Button
  variant="outline"
  className="h-9 text-xs md:text-sm font-semibold tracking-tight transition-all active:scale-95 shadow-sm"
>
  Действие
</Button>
```

| Свойство | Значение | Зачем |
|---|---|---|
| **Высота** | `h-9` (36px) | Единый стандарт для всех интерактивных элементов в тулбарах |
| **Шрифт** | `font-semibold` | Читаемость и акцент |
| **Трекинг** | `tracking-tight` | Компактный буквенный интервал |
| **Тень** | `shadow-sm` | Визуальная глубина, отделение от фона |
| **Анимация** | `transition-all active:scale-95` | Тактильная обратная связь при нажатии |
| **Текст** | `text-xs md:text-sm` | Адаптивный размер: мелкий на мобильных |

### 3.3 Варианты (variants)

| Variant | Реальные классы | Используется для |
|---|---|---|
| `default` | `bg-background text-foreground border border-border/70 shadow-sm hover:bg-secondary/80` | Стандартная кнопка |
| `primary` | `bg-primary text-primary-foreground shadow hover:bg-primary/90` | Главное действие (Сохранить, Создать) |
| `outline` | `border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground` | Вторичные действия (Импорт, Экспорт, Добавить, Загрузить ещё) |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` | Иконки в хедерах, меню-действия |
| `destructive` | `bg-destructive text-destructive-foreground shadow-sm ...` | Удаление (Удалить всё, Удалить) |
| `secondary` | `bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80` | Фильтры, переключатели, второстепенные кнопки |
| `link` | `text-primary underline-offset-4 hover:underline` | Текстовые ссылки без обрамления |
| `brand` | `bg-brand text-brand-foreground shadow-sm hover:bg-brand/90 focus-visible:ring-brand/50` | Брендовые CTA-кнопки |

---

## 4. Поля ввода (Input)

### 4.1 Размеры (из `primitiveInputSizeClassNames`)

| Size prop | Классы |
|---|---|
| `default` | `h-9 py-1 file:h-5` |
| `sm` | `h-8 py-1 text-xs file:h-4` |
| `xs` | `h-7 px-2 py-0.5 text-xs file:h-4` |

### 4.2 Общие свойства

| Свойство | Значение |
|---|---|
| **Базовая высота** | `h-9` (36px) |
| **В тулбарах** | `h-9` (36px) — для визуального выравнивания с кнопками |
| **Тень** | `shadow-sm` |
| **Border** | `border-input` (стандартный) |
| **Focus** | `focus-visible:border-ring focus-visible:ring-ring/25 focus-visible:ring-[1.5px]` |
| **Плейсхолдер** | `text-muted-foreground` |

### Пример поля поиска в тулбаре:

```tsx
<Input
  placeholder="Поиск..."
  className="h-9 shadow-sm"
/>
```

---

## 5. Бейдж (Badge)

### 5.1 Размеры (из `primitiveBadgeSizeClassNames`)

| Size prop | Классы |
|---|---|
| `default` | `px-2 py-0.5 text-xs` |
| `xs` | `px-1.5 py-0 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide` |
| `count` | `size-5 p-0 text-xs` |

### 5.2 Стандартный бейдж для счётчиков записей:

```tsx
<Badge variant="secondary" className="px-2 py-0.5 text-xs font-semibold shadow-sm">
  {count.toLocaleString('ru-RU')} записей
</Badge>
```

| Свойство | Значение |
|---|---|
| **Позиция** | Рядом с хлебными крошками (справа на desktop, снизу на mobile) |
| **Тень** | `shadow-sm` |

> **Примечание:** Используется только на страницах с большими таблицами (Работы, Материалы). Не обязательно для справочников с малым количеством записей (Контрагенты, Поставщики).

---

## 6. Card

| Свойство | Значение |
|---|---|
| **Стиль** | `bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm` |
| **Подкомпоненты** | `<CardHeader>`, `<CardContent>`, `<CardFooter>` — используют `px-6` |
| **Header-подложка** | `@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6` — для зон с действиями |

### Структура Card для страниц:

```tsx
<Card>
  {/* Header zone */}
  <CardHeader>
    <ToolbarContent />
  </CardHeader>

  {/* Content zone */}
  <CardContent>
    <MainContent />
  </CardContent>
</Card>
```

> **Правило:** Если внутри Card есть DataTable — **не оборачивай таблицу** в дополнительный Card. Таблица использует свои собственные границы.

---

## 7. Layout-компоненты

Проект использует модульные layout-компоненты из `shared/ui/page-shell.tsx` и `shared/ui/admin-surface.tsx`.

### 7.1 PageShell

Основной контейнер страницы. Управляет отступами, шириной и заголовком.

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `density` | `compact` \| `default` \| `comfortable` | `default` | Вертикальные отступы между дочерними элементами |
| `title` | `React.ReactNode` | — | Заголовок страницы |
| `description` | `React.ReactNode` | — | Описание под заголовком |
| `actions` | `React.ReactNode` | — | Блок экшенов (кнопки справа) |
| `width` | `default` \| `wide` \| `full` | `wide` | Максимальная ширина контейнера |
| `spacing` | `default` \| `compact` \| `flush-bottom` | `default` | Отступы контейнера |
| `titleAs` | `'h1'` \| `'h2'` | `'h1'` | Тег заголовка |
| `visuallyHiddenTitle` | `boolean` | `false` | Скрыть заголовок визуально (доступность) |

```tsx
<PageShell
  title="Материалы"
  description="Управление справочником материалов"
  actions={<Button>Создать</Button>}
>
  <DataTable columns={columns} data={data} />
</PageShell>
```

### 7.2 ContentContainer

Центрированный контейнер с ограничением по ширине.

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `width` | `default` \| `wide` \| `full` | `default` | `default` = `max-w-7xl`, `wide` = `max-w-[1600px]`, `full` = `max-w-none` |

```tsx
<ContentContainer width="wide">
  <Content />
</ContentContainer>
```

### 7.3 WorkspaceMain

Обёртка `<main>` для контента после sidebar. Устанавливает padding.

| Класс | Значение |
|---|---|
| **База** | `min-w-0 flex-1` |
| **Padding** | `p-4 md:p-6 lg:p-8` |

```tsx
<WorkspaceMain>
  <PageShell title="Работы">
    <DataTable />
  </PageShell>
</WorkspaceMain>
```

### 7.4 PageHeader

Заголовок страницы с заголовком, описанием и блоком действий.

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `title` | `React.ReactNode` | — | Заголовок |
| `description` | `React.ReactNode` | — | Описание |
| `actions` | `React.ReactNode` | — | Кнопки справа |
| `titleAs` | `'h1'` \| `'h2'` | `'h1'` | Тег заголовка |

> **Примечание:** PageHeader не рендерит ничего, если не передан ни title, ни description, ни actions.

### 7.5 AdminPageShell / AdminPageHeader (из `admin-surface.tsx`)

Аналоги PageShell/PageHeader для админ-панели. Используются в `app/(admin)/*`.

---

## 8. Layout страниц справочников

### Стандартная структура:

```tsx
<WorkspaceMain>
  <PageShell
    title="Материалы"
    actions={<ToolbarActions />}
  >
    {/* Хлебные крошки */}
    <Breadcrumb className="px-1 md:px-0">
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="/app">Главная</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbLink>Раздел</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbPage>Страница</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    {/* DataTable с тулбаром */}
    <DataTable
      columns={columns}
      data={data}
      actions={<ToolbarButtons />}
    />
  </PageShell>
</WorkspaceMain>
```

### Ключевые правила:

| Правило | Значение |
|---|---|
| **Отступы между секциями** | `space-y-4` (через `density="comfortable"` в PageShell) |
| **Padding хлебных крошек** | `px-1 md:px-0` |
| **Заголовок страницы** | `sr-only` (скрытый, для доступности) или через `title` PageShell |
| **Пустые блоки** | **Запрещены** — не создавать div-обёртки без контента |

---

## 9. Таблицы (DataTable)

| Свойство | Значение |
|---|---|
| **Тулбар-зона** | Встроена через prop `actions` |
| **Кнопка «Загрузить ещё»** | `variant="outline" className="h-9 ... shadow-sm"` |
| **Поиск** | `h-9 shadow-sm` |
| **Размер текста в ячейках** | `text-sm` (14px) |

---

## 10. Отступы и spacing

| Контекст | Значение |
|---|---|
| **Между секциями страницы** | `space-y-4` (16px) |
| **Внутри Card** | `py-6` / `px-6` (через CardContent / CardHeader) |
| **Gap между кнопками** | `gap-2` (8px) |
| **Gap между bread + badge** | `gap-2` (8px) |

---

## 11. Адаптивность (Responsiveness)

### 11.1 Breakpoints

| Breakpoint | Ширина | Tailwind-префикс | Использование |
|---|---|---|---|
| Mobile | `< 640px` | (без префикса) | Базовый стиль, mobile-first |
| Small | `≥ 640px` | `sm:` | Планшет-портрет, переход к горизонтальным layout |
| Medium | `≥ 768px` | `md:` | Планшет-ландшафт, появление sidebar |
| Large | `≥ 1024px` | `lg:` | Desktop, sidebar раскрыт полностью |
| XL | `≥ 1280px` | `xl:` | Широкий desktop |

### 11.2 Общие принципы

1. **Mobile-first** — базовые стили пишутся для мобилки, расширяются через `sm:`, `md:`, `lg:`
2. **Запрещено** скрывать функционал на мобиле — только перестраивать layout
3. **Текст кнопок** можно сокращать, но кнопка должна остаться доступной
4. **Минимальный touch-target** — `h-9` (36px) для кнопок и инпутов на мобиле

### 11.3 Тулбары и экшен-зоны

```tsx
{/* Mobile: колонка, Desktop: строка */}
<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
  <LeftContent />
  <RightActions />
</div>
```

**Сокращение текста кнопок на мобильных:**

```tsx
<Button className="h-9 ...">
  <Plus className="h-4 w-4 mr-1" />
  <span className="hidden sm:inline">Загрузить ещё</span>
  <span className="sm:hidden">Ещё</span>
</Button>
```

### 11.4 Хлебные крошки

```tsx
{/* Отступ на мобиле, без отступа на desktop */}
<Breadcrumb className="px-1 md:px-0">
```

### 11.5 Card и контейнеры

```tsx
{/* Полная ширина на мобиле, ограниченная на desktop */}
<Card className="w-full mx-auto">
  <CardContent className="p-3 sm:p-4 md:p-6">
    <Content />
  </CardContent>
</Card>
```

### 11.6 Формы

```tsx
{/* Одна колонка на мобиле, 2 колонки на desktop */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <FormField />
  <FormField />
</div>

{/* Кнопки формы */}
<div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
  <Button variant="outline">Отмена</Button>
  <Button>Сохранить</Button>
</div>
```

### 11.7 Диалоги и Sheet

```tsx
{/* Диалог: на мобиле — на всю ширину */}
<DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)]">

{/* Sheet: на мобиле — полная высота */}
<SheetContent className="w-full sm:max-w-md overflow-y-auto">
```

### 11.8 Таблицы (DataTable)

| Подход | Реализация |
|---|---|
| **Горизонтальный скролл** | Контейнер таблицы с `overflow-x-auto` |
| **Скрытие колонок** | `className="hidden md:table-cell"` на менее важных колонках |
| **Размер текста** | `text-xs sm:text-sm` для ячеек |
| **Действия** | Шестерёнка `⚙` вместо развёрнутых кнопок |

```tsx
{/* Пример скрытия колонки на мобиле */}
{
  accessorKey: "email",
  header: "Email",
  cell: ({ row }) => <span>{row.original.email}</span>,
  meta: { className: "hidden md:table-cell" },
}
```

### 11.9 Навигация (Sidebar)

| Viewport | Поведение |
|---|---|
| Mobile (`< md`) | Sidebar скрыт, открывается как Sheet по нажатию hamburger-иконки |
| Desktop (`≥ md`) | Sidebar fixирован слева, всегда виден |

### 11.10 Изображения

```tsx
{/* Адаптивные размеры изображений */}
<div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
  <Image src={src} alt={alt} fill className="object-cover rounded-lg" />
</div>
```

### 11.11 Чеклист адаптивности

При создании любого компонента проверь:

- [ ] Базовый стиль — mobile-first (`flex-col`, `text-xs`, `p-3`)
- [ ] На `sm:` — переход к горизонтальном layout (`sm:flex-row`, `sm:text-sm`)
- [ ] На `md:` — padding увеличен (`md:px-0`, `md:p-6`), все колонки видны
- [ ] Кнопки и инпуты — не менее `h-9` (36px) на любом экране
- [ ] Touch-target — минимум 44×44 CSS-пикселей на мобиле
- [ ] Текст кнопок — сокращён через `hidden sm:inline` / `sm:hidden`
- [ ] Таблицы — `overflow-x-auto`, неважные колонки скрыты через `hidden md:table-cell`
- [ ] Диалоги — `w-[calc(100vw-2rem)]` на мобиле
- [ ] Formы — `grid-cols-1 sm:grid-cols-2`
- [ ] Нет горизонтального overflow на `375px` viewport

---

## 12. Цветовая палитра (CSS Variables)

### Light Mode

| Токен | HSL | Использование |
|---|---|---|
| `--background` | `0 0% 100%` | Основной фон |
| `--foreground` | `222.2 84% 4.9%` | Основной текст |
| `--primary` | `222.2 47.4% 11.2%` | Главные кнопки, акценты |
| `--secondary` | `210 40% 96.1%` | Вторичные бейджи, фоны |
| `--muted` | `210 40% 96.1%` | Приглушённые зоны |
| `--muted-foreground` | `215.4 25% 27%` | Подписи, плейсхолдеры |
| `--destructive` | `0 84.2% 60.2%` | Удаление, ошибки |
| `--border` | `214.3 31.8% 91.4%` | Границы элементов |
| `--ring` | `221.2 83.2% 53.3%` | Focus-кольцо |

### Фон приложения

```css
body { @apply bg-gray-50 dark:bg-gray-950; }
```

---

## 13. Тени

| Класс | Использование |
|---|---|
| `shadow-xs` | Только для базовых outline-кнопок shadcn (не использовать в тулбарах) |
| `shadow-sm` | **Стандарт** для кнопок-тулбаров, полей ввода, бейджей, Card |
| `shadow-md` | Выпадающие меню, поповеры |
| `shadow-lg` | Диалоги, модальные окна |
| `shadow-xl` | Оверлеи загрузки, glass-card |

---

## 14. Анимации

| Эффект | Класс | Использование |
|---|---|---|
| **Нажатие кнопки** | `active:scale-95` | Все кнопки тулбаров |
| **Плавный переход** | `transition-all` | Кнопки, интерактивные элементы |
| **Длительность перехода** | `duration-300` | Sidebar-элементы |
| **Спиннер загрузки** | `animate-spin` | `<Loader2>` иконки |

---

## 15. Иконки

| Параметр | Значение |
|---|---|
| **Библиотека** | `lucide-react` |
| **Стандартный размер** | `h-4 w-4` (16px) |
| **В кнопках** | `h-4 w-4 mr-1` (с отступом от текста) |
| **Спиннер** | `<Loader2 className="h-4 w-4 animate-spin" />` |

---

## 16. Sidebar (Боковое меню)

| Свойство | Значение |
|---|---|
| **Элемент навигации** | `h-10 rounded-xl px-4 transition-all duration-300` |
| **Лейбл группы** | `text-[11px] uppercase tracking-wider text-muted-foreground font-semibold` |
| **Фон** | `--sidebar-background: 0 0% 98%` |

---

## 17. Glass-эффекты

| Класс | Стиль |
|---|---|
| `.glass-card` | `bg-background/40 backdrop-blur-md border border-border/40 shadow-xl shadow-black/5` |
| `.glass-morphism` | `bg-background/60 backdrop-blur-lg border border-border/50` |

---

## 18. Ownership — где какие классы должны жить

### Принцип: классы — это ответственность компонента, не страницы

| Что | Где определять | Комментарий |
|---|---|---|
| **Палитра, шрифт, радиусы** | `globals.css` — CSS-переменные | Никогда не дублировать в Tailwind-конфиге |
| **Размеры кнопок, инпутов, бейджей** | `primitive-density.ts` (классы-константы) | Импортировать через `cn()` в `button.tsx`, `input.tsx`, `badge.tsx` |
| **Варианты (variants)** | В файле компонента: `cva(...)` или `primitiveXxxVariantClassNames` | `buttonVariants`, `badgeVariants`, `inputVariants` |
| **Типографика** | `globals.css` или Tailwind-утилиты `.text-{display,title,...}` | Никогда `text-lg font-bold` вручную — используй утилиты |
| **Layout-компоненты** | `page-shell.tsx`, `admin-surface.tsx` | `PageShell`, `ContentContainer`, `WorkspaceMain`, `PageHeader` |
| **Страницы** | Файл страницы `app/**/page.tsx` | Использовать компоненты выше, не писать вручную `className="space-y-4"` |
| **Адаптивность** | На уровне layout-компонентов или в `page.tsx` | Mobile-first через `sm:`, `md:`, `lg:` |

### Что НЕЛЬЗЯ делать

- ❌ Писать хардкодные `h-9`, `px-4` на каждой странице — используй компоненты
- ❌ Дублировать variant-классы в `className` — используй prop `variant`
- ❌ Копировать размеры из `primitive-density.ts` в страницу — они принадлежат компоненту

---

## 19. Чеклист для агента

При создании или модификации любого компонента, проверь:

- [ ] Кнопки тулбаров: `h-9 font-semibold tracking-tight shadow-sm transition-all active:scale-95`
- [ ] Поля ввода в тулбарах: `h-9 shadow-sm`
- [ ] Отступы между секциями: через PageShell (`density`, `spacing`)
- [ ] Нет пустых div-обёрток без контента
- [ ] Хлебные крошки: `px-1 md:px-0`
- [ ] Адаптивность: `flex-col → sm:flex-row`, `text-xs md:text-sm`
- [ ] Тени: `shadow-sm` (а не `shadow-xs`) для тулбар-элементов
- [ ] Иконки: `h-4 w-4` из `lucide-react`
- [ ] Нет `size="sm"` на кнопках тулбаров — используй `className="h-9"` напрямую
- [ ] Шрифт: `Manrope` через `--font-manrope`
