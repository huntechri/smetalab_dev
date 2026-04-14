# Аудит незавершённого рефакторинга (последний merge)

Дата аудита: 2026-03-01  
Проверенный merge-коммит: `00c8b5c` (PR #8)

## Что проверено

- Диапазон изменений merge: `bfb7051..00c8b5c`.
- Поиск хвостов миграции UI-примитивов (`components/ui` → `shared/ui`).
- Поиск артефактов незавершённого рефакторинга (`TODO`, `FIXME`, неиспользуемые промежуточные обёртки).
- Точечная проверка модулей, добавленных в рамках entity-рефакторинга статусов.

## Найдено

### 1) Неконсистентный реэкспорт в `features/projects/shared/utils/status-view.ts`

В файле был реэкспорт `getEstimateStatusLabel` из `entities/estimate/model/status`,
хотя модуль расположен в `features/projects/shared/**` и должен обслуживать project-domain.

Это выглядело как остаток незавершённого рефакторинга после выделения project/estimate entities.

## Исправление

- Исправлен реэкспорт на `getProjectStatusLabel` из `entities/project/model/status`.
- Добавлен unit-тест, который фиксирует корректный публичный контракт модуля
  `features/projects/shared/utils/status-view`.

## Результат

- Признак незавершённого рефакторинга устранён.
- Добавлен регрессионный тест, чтобы ошибка не вернулась в следующих merge.


## Follow-up cleanup

- Удалены неиспользуемые thin-wrapper модули в `features/projects/shared/**`:
  - `components/project-status-dot.tsx`
  - `utils/status-view.ts`
- Удалён связанный unit-тест wrapper-контракта: `__tests__/unit/features/projects/shared/status-view.test.ts`.
- В `shared/ui/data-table.tsx` убраны неиспользуемые импорты и закрыты lint-warning по иконкам сортировки.
