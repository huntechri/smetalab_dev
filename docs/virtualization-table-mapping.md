# Аудит виртуализации таблиц (UI)

Дата: 2026-04-21

## Где включается виртуализация

- Базовый компонент `DataTable` использует `TableVirtuoso` из `react-virtuoso`.
- Виртуализация активна во всех местах, где используется `DataTable` и есть строки (`rows.length > 0`).
- Явного флага отключения виртуализации в `DataTableProps` сейчас нет.

## Таблицы/экраны, подключенные к виртуализации через `shared/ui/data-table`

1. **Справочник материалов**
   - Компонент: `MaterialsTableWrapper` → `CatalogFeatureTableWrapper` → `CatalogTableWrapper` → `DataTableShell` → `DataTable`.
   - Экран: `features/materials/screens/MaterialsScreen.tsx`.

2. **Справочник работ**
   - Компонент: `WorksTableWrapper` → `CatalogFeatureTableWrapper` → `CatalogTableWrapper` → `DataTableShell` → `DataTable`.
   - Экран: `features/works/screens/WorksScreen.tsx`.

3. **Справочник поставщиков**
   - Компонент: `MaterialSuppliersScreen` использует `DirectoryListScreen` → `DataTableShell` → `DataTable`.

4. **Справочник контрагентов**
   - Компонент: `CounterpartiesScreen` использует `DirectoryListScreen` → `DataTableShell` → `DataTable`.

5. **Глобальные закупки**
   - Компонент: `GlobalPurchasesTable` напрямую использует `DataTable`.

6. **Таблица сметы (редактирование строк сметы)**
   - Компонент: `EstimateTable` напрямую использует `DataTable`.

## Дополнительно: где еще используется `react-virtuoso` (не табличная виртуализация DataTable)

1. `MaterialCatalogPicker.client.tsx` — список в каталоге материалов (`Virtuoso`).
2. `WorkCatalogPicker.client.tsx` — список в каталоге работ (`Virtuoso`).

## Важно для UI

- Так как виртуализация «зашита» в базовый `DataTable`, любое изменение поведения/стилей в `shared/ui/data-table.tsx` затрагивает сразу несколько ключевых экранов.
- Для анализа проблем UI в таблицах логично начинать с:
  1) `shared/ui/data-table.tsx`,
  2) `shared/ui/shells/data-table-shell.tsx`,
  3) конкретного feature-wrapper экрана.
