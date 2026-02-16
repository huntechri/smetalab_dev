# Глобальные закупки: детальный план оптимизации и архитектурный аудит

## 1) Что было проанализировано

Компонент «Глобальные закупки» реализован как связка:

- страница App Router: `app/(workspace)/app/global-purchases/page.tsx`;
- экран: `features/global-purchases/screens/GlobalPurchasesScreen.tsx`;
- клиентская таблица: `features/global-purchases/components/GlobalPurchasesTable.client.tsx`;
- хук состояния и операций: `features/global-purchases/hooks/useGlobalPurchasesTable.ts`;
- колонки таблицы: `features/global-purchases/components/global-purchases-columns.tsx`;
- репозиторий client→server actions: `features/global-purchases/repository/global-purchases.actions.ts`;
- server actions: `app/actions/global-purchases.ts`;
- service слой: `lib/services/global-purchases.service.ts`.

## 2) Ключевые узкие места (производительность, надежность, корректность)

### A. Риски гонок состояния в клиентском хуке

1. `updateRow` опирается на `rows` из замыкания, делает optimistic update и в `catch` откатывает через `setRows(rows)`.
   - При нескольких параллельных изменениях/медленной сети это может откатить неактуальное состояние и «затереть» свежие правки.
2. `removeRow` хранит `prevRows = rows` из замыкания и в `catch` откатывает его целиком.
   - При конкурентных удалениях/изменениях — тот же риск потери актуальных данных.

**Влияние:** периодические «пропадающие» правки и нестабильное поведение UI под нагрузкой.

### B. Ошибки работы с датой/таймзоной

1. В `copyRowsToNextDay` используется `new Date(sourceDate)` и далее `toISOString().slice(0, 10)`.
   - Для ISO-строки `YYYY-MM-DD` JS создает дату в UTC, и в ряде TZ возможен сдвиг суток.
2. На серверной странице и в create используются `new Date().toISOString().slice(0, 10)`.
   - Это тоже UTC-дата; для локального бизнес-дня пользователя возможен рассинхрон.

**Влияние:** «следующий день» и «сегодня» могут определяться неверно в некоторых часовых поясах.

### C. Неполная транзакционная целостность в `create`

В `GlobalPurchasesService.create` чтение проекта (`resolveProject`) выполняется через глобальный `db`, а не через `tx` текущей транзакции.

**Влияние:** потенциальная неконсистентность snapshot-а (особенно при высокой конкурентности и изменениях проекта в параллели).

### D. Избыточные перерендеры/микро-неэффективности на клиенте

1. Создание `Intl.NumberFormat` прямо в рендере (итог и ячейки суммы).
2. Нет защиты от лавины запросов при частом изменении диапазона дат.
3. Нет флага in-flight для блокировки повторных действий (double click: «создать на след. день», «добавить строку» и т.д.).

**Влияние:** лишняя нагрузка на UI и backend, рост вероятности дубликатов и конфликтов.

### E. Пробелы в тестовом покрытии критических сценариев

Есть unit-тесты репозитория actions, но нет целевых тестов на:

- конкурентные optimistic update/rollback в `useGlobalPurchasesTable`;
- TZ edge-cases для вычисления дат;
- интеграционные сценарии `GlobalPurchasesService` (`create/patch/createNextDayList/remove/list`) с проверкой ошибок и конфликтов.

**Влияние:** регрессии в самой рискованной логике не ловятся заранее.

## 3) Архитектурный аудит относительно правил проекта

### Соответствия

- Разделение server/client в целом корректно: страница серверная, интерактивная таблица в client-компоненте.
- Бизнес-логика вынесена в service-слой (`lib/services/global-purchases.service.ts`).
- В запросах по multi-tenant таблицам используется `withActiveTenant`.
- Валидация входа присутствует через `zod` в сервисе.
- Многошаговые операции (`create`, `createNextDayList`) обернуты в `db.transaction()`.

### Нарушения/зоны риска

1. **Транзакционная консистентность (архитектурный риск):** внутри транзакции используется helper чтения через глобальный `db`, а не `tx`.
2. **Надежность клиентского state-management:** optimistic update реализован уязвимо к гонкам.
3. **Тестовый стандарт (CRITICAL):** ключевая новая/сложная логика покрыта частично; отсутствуют тесты на сценарии высокой вероятности регрессий.

## 4) Детальный план оптимизации (по приоритетам)

## Фаза 0 — Безопасный baseline (день 0)

1. Зафиксировать метрики до изменений:
   - p50/p95 latency для list/patch/create/copy;
   - количество ошибок 4xx/5xx и конфликтов;
   - среднее число запросов на пользователя в рамках страницы.
2. Добавить feature-flag на новую клиентскую стратегию optimistic update.

**Критерий готовности:** есть baseline-отчет, флаг включается точечно.

## Фаза 1 — Исправление корректности и надежности (день 1–2)

1. Переписать optimistic update/remove на функциональные обновления состояния:
   - хранить pending operations по `rowId`;
   - откатывать только затронутую строку, а не весь snapshot из замыкания.
2. Добавить in-flight guard для кнопок мутаций (disable + визуальная индикация).
3. Нормализовать работу с датами:
   - перейти на детерминированный helper (`addDaysISO`, `todayISOByTenantTZ`);
   - убрать зависимость от `new Date('YYYY-MM-DD')` и прямого UTC slice.

**Критерий готовности:** нет расхождений в датах и потери правок в тестах конкурентности.

## Фаза 2 — Транзакционная и доменная целостность (день 2–3)

1. Сделать `resolveProject`-вариант, принимающий `tx`, и использовать его в транзакционных блоках.
2. Усилить доменные инварианты на сервере:
   - в `patch` явно запретить пустой payload;
   - проверять допустимость диапазона (`from <= to`) в list.
3. Добавить idempotency-key для операций создания (минимум для copy day), либо серверную защиту от дублей на повторный клик.

**Критерий готовности:** race-safe и transaction-safe сервисные операции.

## Фаза 3 — Производительность UI и API (день 3–4)

1. Мемоизировать форматтеры (`Intl.NumberFormat`) и тяжелые вычисления.
2. Дебаунс/батч загрузок при смене диапазона дат.
3. Оптимизировать повторные загрузки:
   - кэш по диапазону в клиенте (SWR/React Query или локальный map-cache);
   - revalidate стратегии для server-side initial fetch.
4. Проверить индексы БД под частые фильтры/сортировки и планы выполнения.

**Критерий готовности:** снижение p95 и количества лишних запросов.

## Фаза 4 — Полноценное тестовое покрытие (день 4–5)

1. Unit (hook):
   - optimistic update success/failure;
   - конкурирующие patch/remove;
   - copyNextDay TZ edge-cases.
2. Unit (date helpers):
   - переход месяца/года, DST, разные TZ.
3. Integration (service):
   - list/create/patch/remove/createNextDayList happy path;
   - `TARGET_EXISTS`, `PROJECT_NOT_FOUND`, validation errors;
   - tenant isolation.
4. E2E smoke (по возможности):
   - сценарий оператора на день: загрузка → правка → копирование → удаление.

**Критерий готовности:** покрыты критические ветки, регрессии воспроизводимы тестами.

## 5) Технические задачи (backlog, готово к реализации)

1. `feat(global-purchases): add deterministic date helpers and replace UTC slicing`.
2. `fix(global-purchases): race-safe optimistic updates with per-row rollback`.
3. `fix(global-purchases-service): use transaction-scoped project resolver`.
4. `perf(global-purchases): memoize formatters and debounce range reload`.
5. `test(global-purchases): add hook concurrency and timezone edge coverage`.
6. `test(global-purchases-service): add integration suite for create/patch/copy/remove/list`.

## 6) Нефункциональные требования и SLO

Целевые значения после оптимизации:

- UI-операции редактирования: perceived latency < 150ms (optimistic path).
- API `list`: p95 < 300ms при типичном дневном объеме.
- Ошибки мутаций из-за конкуренции/дублей: < 0.1% операций.
- Отсутствие timezone-дефектов в тестовом наборе edge-cases.

## 7) Риски внедрения и как их снизить

1. Риск регрессии UX при изменении optimistic логики.
   - Митигировать feature-flag + A/B на внутренней группе.
2. Риск изменения бизнес-даты для части пользователей.
   - Миграционный период: сравнение старого/нового вычисления дат в логах.
3. Риск роста сложности клиента.
   - Ограничить новые абстракции: 1 hook для state-машины + 1 модуль date helpers.

## 8) Порядок внедрения (рекомендация)

1. Фаза 1 (корректность) → 2 (целостность) → 4 (тесты) → 3 (доп. перф).
2. После каждого шага: lint + type-check + test + smoke сценарий страницы.
3. Выкатка по feature-flag с постепенным расширением.
