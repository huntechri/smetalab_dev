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

### 3.1 Размеры (из `buttonVariants`)

| Size prop | Высота | Использование |
|---|---|---|
| `xs` | `h-6` (24px) | Микро-действия, inline-теги |
| `sm` | `h-7` (28px) | Компактные элементы (внутри таблиц, дропдаунов) |
| `default` | `h-8` (32px) | Стандартный размер компонента shadcn |
| `lg` | `h-8` (32px) | С увеличенным padding |
| `icon` | `size-8` (32px) | Квадратные иконки |
| `icon-xs` | `size-6` (24px) | Маленькие иконки |
| `icon-sm` | `size-7` (28px) | Средние иконки |

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

| Variant | Используется для |
|---|---|
| `default` / `primary` | Главное действие (Сохранить, Создать) |
| `outline` | Вторичные действия (Импорт, Экспорт, Добавить, Загрузить ещё) |
| `ghost` | Иконки в хедерах, меню-действия |
| `destructive` | Удаление (Удалить всё, Удалить) |
| `secondary` | Фильтры, переключатели, второстепенные кнопки |
| `link` | Текстовые ссылки без обрамления |

---

## 4. Поля ввода (Input)

| Свойство | Значение |
|---|---|
| **Базовая высота** | `h-8` (32px) — shadcn default |
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

### Стандартный бейдж для счётчиков записей:

```tsx
<Badge variant="secondary" className="h-7 px-3 text-xs font-semibold shadow-sm">
  {count.toLocaleString('ru-RU')} записей
</Badge>
```

| Свойство | Значение |
|---|---|
| **Позиция** | Рядом с хлебными крошками (справа на desktop, снизу на mobile) |
| **Высота** | `h-7` (28px) |
| **Тень** | `shadow-sm` |

> **Примечание:** Используется только на страницах с большими таблицами (Работы, Материалы). Не обязательно для справочников с малым количеством записей (Контрагенты, Поставщики).

---

## 6. Card

| Свойство | Значение |
|---|---|
| **Стиль** | `border-border/70 shadow-sm overflow-hidden` |
| **Границы округления** | `rounded-xl` (по умолчанию от shadcn) |
| **Header-подложка** | `bg-muted/20 border-b border-border/50` — для зон с действиями |

### Структура Card для страниц:

```tsx
<Card className="border-border/70 shadow-sm overflow-hidden">
  {/* Header zone */}
  <div className="bg-muted/20 border-b border-border/50 px-4 py-3">
    <ToolbarContent />
  </div>

  {/* Content zone */}
  <div className="p-4">
    <MainContent />
  </div>
</Card>
```

> **Правило:** Если внутри Card есть DataTable — **не оборачивай таблицу** в дополнительный Card. Таблица использует свои собственные границы.

---

## 7. Layout страниц справочников

### Стандартная структура:

```tsx
<div className="space-y-4">
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
  <h1 className="sr-only">Заголовок</h1>

  {/* DataTable с тулбаром */}
  <DataTable
    columns={columns}
    data={data}
    actions={<ToolbarButtons />}
  />
</div>
```

### Ключевые правила:

| Правило | Значение |
|---|---|
| **Отступы между секциями** | `space-y-4` |
| **Padding хлебных крошек** | `px-1 md:px-0` |
| **Заголовок страницы** | `sr-only` (скрытый, для доступности) |
| **Пустые блоки** | **Запрещены** — не создавать div-обёртки без контента |

---

## 8. Таблицы (DataTable)

| Свойство | Значение |
|---|---|
| **Тулбар-зона** | Встроена через prop `actions` |
| **Кнопка «Загрузить ещё»** | `variant="outline" className="h-9 ... shadow-sm"` |
| **Поиск** | `h-9 shadow-sm` |
| **Размер текста в ячейках** | `text-sm` (14px) |

---

## 9. Отступы и spacing

| Контекст | Значение |
|---|---|
| **Между секциями страницы** | `space-y-4` (16px) |
| **Внутри Card** | `p-4` (16px) или `px-4 py-3` (для compact header) |
| **Gap между кнопками** | `gap-2` (8px) |
| **Gap между bread + badge** | `gap-2` (8px) |

---

## 10. Адаптивность (Responsiveness)

### 10.1 Breakpoints

| Breakpoint | Ширина | Tailwind-префикс | Использование |
|---|---|---|---|
| Mobile | `< 640px` | (без префикса) | Базовый стиль, mobile-first |
| Small | `≥ 640px` | `sm:` | Планшет-портрет, переход к горизонтальным layout |
| Medium | `≥ 768px` | `md:` | Планшет-ландшафт, появление sidebar |
| Large | `≥ 1024px` | `lg:` | Desktop, sidebar раскрыт полностью |
| XL | `≥ 1280px` | `xl:` | Широкий desktop |

### 10.2 Общие принципы

1. **Mobile-first** — базовые стили пишутся для мобилки, расширяются через `sm:`, `md:`, `lg:`
2. **Запрещено** скрывать функционал на мобиле — только перестраивать layout
3. **Текст кнопок** можно сокращать, но кнопка должна остаться доступной
4. **Минимальный touch-target** — `h-9` (36px) для кнопок и инпутов на мобиле

### 10.3 Тулбары и экшен-зоны

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

### 10.4 Хлебные крошки

```tsx
{/* Отступ на мобиле, без отступа на desktop */}
<Breadcrumb className="px-1 md:px-0">
```

### 10.5 Card и контейнеры

```tsx
{/* Полная ширина на мобиле, ограниченная на desktop */}
<Card className="w-full mx-auto">
  {/* Padding уменьшен на мобиле */}
  <div className="p-3 sm:p-4 md:p-6">
    <Content />
  </div>
</Card>
```

### 10.6 Формы

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

### 10.7 Диалоги и Sheet

```tsx
{/* Диалог: на мобиле — на всю ширину */}
<DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)]">

{/* Sheet: на мобиле — полная высота */}
<SheetContent className="w-full sm:max-w-md overflow-y-auto">
```

### 10.8 Таблицы (DataTable)

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

### 10.9 Навигация (Sidebar)

| Viewport | Поведение |
|---|---|
| Mobile (`< md`) | Sidebar скрыт, открывается как Sheet по нажатию hamburger-иконки |
| Desktop (`≥ md`) | Sidebar fixирован слева, всегда виден |

### 10.10 Изображения

```tsx
{/* Адаптивные размеры изображений */}
<div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
  <Image src={src} alt={alt} fill className="object-cover rounded-lg" />
</div>
```

### 10.11 Чеклист адаптивности

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

## 11. Цветовая палитра (CSS Variables)

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

## 12. Тени

| Класс | Использование |
|---|---|
| `shadow-xs` | Только для базовых outline-кнопок shadcn (не использовать в тулбарах) |
| `shadow-sm` | **Стандарт** для кнопок-тулбаров, полей ввода, бейджей, Card |
| `shadow-md` | Выпадающие меню, поповеры |
| `shadow-lg` | Диалоги, модальные окна |
| `shadow-xl` | Оверлеи загрузки, glass-card |

---

## 13. Анимации

| Эффект | Класс | Использование |
|---|---|---|
| **Нажатие кнопки** | `active:scale-95` | Все кнопки тулбаров |
| **Плавный переход** | `transition-all` | Кнопки, интерактивные элементы |
| **Длительность перехода** | `duration-300` | Sidebar-элементы |
| **Спиннер загрузки** | `animate-spin` | `<Loader2>` иконки |

---

## 14. Иконки

| Параметр | Значение |
|---|---|
| **Библиотека** | `lucide-react` |
| **Стандартный размер** | `h-4 w-4` (16px) |
| **В кнопках** | `h-4 w-4 mr-1` (с отступом от текста) |
| **Спиннер** | `<Loader2 className="h-4 w-4 animate-spin" />` |

---

## 15. Sidebar (Боковое меню)

| Свойство | Значение |
|---|---|
| **Элемент навигации** | `h-10 rounded-xl px-4 transition-all duration-300` |
| **Лейбл группы** | `text-[11px] uppercase tracking-wider text-muted-foreground font-semibold` |
| **Фон** | `--sidebar-background: 0 0% 98%` |

---

## 16. Glass-эффекты

| Класс | Стиль |
|---|---|
| `.glass-card` | `bg-background/40 backdrop-blur-md border border-border/40 shadow-xl shadow-black/5` |
| `.glass-morphism` | `bg-background/60 backdrop-blur-lg border border-border/50` |

---

## 17. Чеклист для агента

При создании или модификации любого компонента, проверь:

- [ ] Кнопки тулбаров: `h-9 font-semibold tracking-tight shadow-sm transition-all active:scale-95`
- [ ] Поля ввода в тулбарах: `h-9 shadow-sm`
- [ ] Отступы между секциями: `space-y-4`
- [ ] Нет пустых div-обёрток без контента
- [ ] Хлебные крошки: `px-1 md:px-0`
- [ ] Адаптивность: `flex-col → sm:flex-row`, `text-xs md:text-sm`
- [ ] Тени: `shadow-sm` (а не `shadow-xs`) для тулбар-элементов
- [ ] Иконки: `h-4 w-4` из `lucide-react`
- [ ] Нет `size="sm"` на кнопках тулбаров — используй `className="h-9"` напрямую
- [ ] Шрифт: `Manrope` через `--font-manrope`
