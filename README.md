# Smetalab v1.0.3

Профессиональная SaaS-платформа на **Next.js**, с продвинутой мультиарендностью, гибридным AI-поиском и системой управления командой.

**Репозиторий: [https://github.com/azap026/smetalabv3](https://github.com/azap026/smetalabv3)**

---

## 🏛 Архитектура и Правила Разработки (Важно!)

Этот раздел описывает новый стандарт кода после рефакторинга. Пожалуйста, следуйте этим правилам, чтобы проект оставался чистым и надежным.

### 1. Безопасность и Multi-tenancy (Слой БД)
**Проблема:** Опасно вручную прописывать `where(eq(table.tenantId, ...))` в каждом запросе. Можно забыть и «слить» данные другой команде.

**Решение:** Использовать хелпер `withActiveTenant` из `lib/data/db/queries.ts`.
- ✅ **Как НУЖНО:**
  ```typescript
  // Хелпер автоматически добавит: .where(and(eq(tenantId, ...), isNull(deletedAt)))
  const data = await db.select().from(materials).where(withActiveTenant(materials, teamId));
  ```
- ❌ **Как НЕЛЬЗЯ:**
  ```typescript
  // Не пишите фильтры вручную, если есть tenantId и deletedAt
  .where(and(eq(materials.tenantId, id), isNull(materials.deletedAt))) 
  ```

### 2. Оптимизация SQL и Индексация
**Принцип:** Запросы должны быть быстрыми даже при миллионах записей.
- **Индексы:** Все поля, используемые в `WHERE`, `JOIN` и `ORDER BY`, должны быть проиндексированы. 
- **Поиск:** Для текстового поиска используйте GIN-индексы с `gin_trgm_ops`.
- **AI-поиск материалов и работ:** Используется двухфазный пайплайн (кандидаты по FTS/trgm + векторный top-K, затем re-rank), чтобы задействовать индексы и ускорить поиск на больших справочниках.
- **Защита от дублей:** В справочниках работ и материалов реализована визуальная индикация и блокировка при попытке добавить позицию, которая уже присутствует в текущей смете.
- **Импорт/экспорт справочников:** Порядок строк сохраняется через `sortOrder`: экспорт идет в текущем UI-порядке, а импорт пересобирает его по фактическому порядку строк в Excel.
- **Кэширование поиска:** Для повторных одинаковых запросов используется короткий TTL-кэш на серверном сервис-слое.
- **Soft Delete:** Для полей `deleted_at` установлены индексы, так как они участвуют в каждом запросе.

### 3. Целостность данных и Транзакции (Слой Сервисов)
**Принцип:** Все массовые операции или сложные цепочки записей должны быть в **транзакции**.
- ✅ **Как НУЖНО:**
  ```typescript
  await db.transaction(async (tx) => {
    await tx.insert(materials).values(rows);
    await tx.insert(logs).values(logEntry);
  });
  ```
- ⚠️ **Правило:** Бизнес-логика живет в `lib/services/`. Server Actions лишь вызывают эти сервисы.

### 4. Чистый Фронтенд (Декомпозиция)
**Решение:** Разделяйте код на 3 уровня:
1.  **Хуки (hooks/):** Вся «черная работа» — запросы к API, стейты.
2.  **Компоненты (components/):** Только UI.
3.  **Контейнер (client.tsx):** Собирает хуки и компоненты вместе.

---

## 🧭 Подробная архитектура (уровни и потоки)

Ниже — детальное описание слоёв и взаимодействий в приложении. Цель — сохранить предсказуемую структуру и упростить поддержку.

### 1) Общий поток запроса (Request Flow)
1. **UI-компонент** инициирует действие (клик, сабмит формы, выбор в таблице).
2. **Feature-хук** обрабатывает событие: проверяет состояние, готовит данные, вызывает серверные экшены.
3. **Server Action** (`app/actions/**`) выполняет валидацию и авторизацию через `safeAction`, затем вызывает сервис.
4. **Сервис** (`lib/services/**.service.ts`) реализует бизнес-логику и обращения к БД.
5. **DB-слой** (`lib/data/db/**`) выполняет запросы с `withActiveTenant`.
6. **Клиент** обновляет состояние, ререндерит UI и показывает результат (toast/диалог).

### 2) Фронтенд-слой (App Router)
**Цель:** route-файлы остаются тонкими, а сложная UI-оркестрация изолируется в feature-модулях. Используются **человекопонятные URL (slugs)** для проектов и смет.

- **Route-страницы** (`app/**/page.tsx`, `loading.tsx`, `layout.tsx`)
  - Получают серверные данные (поиск по `slug` вместо UUID) и передают их в feature-экраны.
  - Параметры в путях `[projectId]` и `[estimateId]` теперь принимают текстовые слаги.
  - Не содержат клиентской бизнес-логики таблиц, импорта, поиска и модалок.
- **Глобальная навигация** (`components/providers/breadcrumb-provider.tsx`)
  - Хлебные крошки управляются через `BreadcrumbProvider` и хук `useBreadcrumbs`.
  - Путь автоматически отображается в `AppHeader` с поддержкой адаптивного сокращения (ellipsis) для мобильных устройств.
- **Entities-слой (переиспользуемый доменный UI)** (`entities/<entity>/{ui,model}`)
  - Содержит доменно-ориентированные UI-блоки и модели (например, `entities/project/ui/ProjectStatusDot.tsx`, `entities/estimate/ui/EstimateStatusBadge.tsx`), которые используются в нескольких фичах.
  - Не импортирует `features/**`, чтобы сохранить однонаправленные зависимости.
- **Feature-экраны и оркестрация** (`features/**/screens`, `features/**/hooks`, `features/**/components`)
  - Экраны (`*Screen`) собирают страницу из атомарных компонент и специализированных хуков.
  - Хуки управляют состояниями таблиц (поиск, вставка, редактирование, удаление, пагинация, AI-поиск).
  - Общие сценарии выносятся в shared-хуки (например, `hooks/use-guide-table-search.ts`).
- **UI-примитивы** (`shared/ui/**`)
  - Содержат только переиспользуемые shadcn/Radix примитивы и общие паттерны состояний (`shared/ui/states/**`).
  - Не должны тянуть бизнес-логику домена или запросы к БД.
- **UI-дедупликация справочников** (`features/guide-catalog/**`, `features/directories/**`)
  - Для `materials/works` используется единый shell-слой (`CatalogScreenShell`, `CatalogTableWrapper`, `CatalogToolbar`) с модульными адаптерами.
  - Для `counterparties/material-suppliers` используется общий `DirectoryListScreen` + типизированные адаптеры.
- **DTO и клиентские типы** (`shared/types/**`, `features/**/types/**`)
  - Клиентские компоненты используют UI DTO-типы и не импортируют DB-типы напрямую из `lib/data/db/schema` или сервисные типы из `lib/services/**`.

Текущая практическая схема для экранов workspace (`dashboard/works/materials/counterparties/projects`):
1. `app/(workspace)/app/guide/**/page.tsx` загружает initial data на сервере.
2. Передаёт данные в `features/**/screens/*Screen.tsx`.
3. Экран использует `features/**/hooks/*` и `hooks/*` для поведения.
4. Переиспользуемые доменные блоки берутся из `entities/**`, а таблицы/диалоги собираются в `features/**/components/*` на базе `shared/ui/*`.
5. Формы аутентификации (`sign-in`/`sign-up`/`forgot-password`/`reset-password`) хранятся в `features/auth/components/*`, а страницы в `app/(login)` выступают thin wrappers.

**Пример реализации (Projects):**
- `app/(workspace)/app/projects/page.tsx` — серверная загрузка списка проектов.
- `app/(workspace)/app/projects/[projectId]/page.tsx` — дашборд проекта, доступный по слэгу (например, `/app/projects/north-park`).
- `features/projects/list/screens/ProjectsScreen.tsx` — композиция экрана без низкоуровневой логики URL-параметров.
- `features/projects/list/hooks/use-projects-screen.ts` — управление фильтрами, сортировкой, режимом отображения и действиями списка.

### 3) Server Actions
**Файл-локатор:** `app/actions/**`.

- Всегда обёрнуты в `safeAction` и проверяют `allowedRoles`.
- Не содержат бизнес-правил. Делегируют работу сервисам.
- Отвечают за кеш-инвалидацию (`revalidatePath`) и простую оркестрацию.

### 4) Сервисный слой
**Файл-локатор:** `lib/services/**.service.ts`.

- Бизнес-правила и изменения данных живут здесь.
- Массовые операции выполняются в `db.transaction()`.
- Вся работа с tenant-данными проходит через `withActiveTenant`.
- Сервисы — единственная точка, где допускаются сложные операции над БД.

### 5) Доступ к БД
**Файл-локатор:** `lib/data/db/**`.

- `schema.ts` описывает структуру таблиц (Drizzle).
- `queries.ts` содержит `withActiveTenant` и общие утилиты.
- Миграции в `drizzle/*.sql` должны соответствовать `schema.ts`.

### 6) RBAC и безопасность
- Роли (`owner`, `admin`, `member`, `estimator`, `manager`) проверяются в `safeAction`.
- Админские функции размещаются под `/admin/**`.
- Для admin dashboard действует server-side gate: доступ только для platform-ролей `superadmin`/`support`; дополнительная проверка выполняется также в `lib/data/db/admin-queries.ts`.
- Actions проектов (`create/update/delete`) унифицированы через `safeAction` и возвращают единый `Result`-контракт с Zod-валидацией.
- Любые мутации должны предваряться проверкой прав и валидацией данных (Zod).

### 7) Интеграции
- **Платежи**: `lib/infrastructure/payments/` (Stripe).
- **Email**: Resend.
- **AI-поиск**: `lib/ai/` + embeddings. Для батчей — `generateEmbeddingsBatch`.

### 8) Тестовая архитектура
- **Unit** (`__tests__/unit/`) — hooks, utils, маленькие UI-компоненты.
- **Integration** (`__tests__/integration/`) — server actions, сервисы, БД/tenant-логика.
- **UI** (`__tests__/ui/`) — тестирование визуальных компонентов и страниц.
- `pnpm test` запускает только unit/isolated набор и не требует БД/сети.
- Интеграционные тесты (`pnpm test:integration`) запускаются отдельно и требуют валидный `DATABASE_URL`.

## 📂 Структура Проекта

Подробные правила слоев и зависимостей: `ARCHITECTURE.md`.


- `app/(workspace)/app/`: Основные страницы рабочего пространства.
- `app/(workspace)/app/page.tsx`: Консолидированный home-дашборд по всем проектам команды (KPI + график "Динамика проекта").
- `app/actions/`: Server Actions (обертки `safeAction` с проверкой ролей).
- `lib/data/db/`: Схема Drizzle и миграции.
- `lib/domain/`: Контракты и доменные сервисы (в некоторых модулях остаются use-cases, в `materials/works` CRUD-оркестрация идёт через `lib/services/*-catalog.service.ts` → `lib/domain/*/*.service.ts`).
- `lib/infrastructure/auth/`: Логика RBAC и контроля доступа.
- `shared/ui/`: Библиотека Shadcn/UI (базовые блоки).
- `shared/types/`: UI DTO-типы для client-слоя.
- `features/guide-catalog/`: Единый каркас справочников `materials/works`.
- `features/directories/`: Единый каркас списочных экранов справочников.
- `features/projects/estimates/`: UI-first модуль «Сметы» в контексте проекта (registry + details) с server actions для строк сметы и иерархией Work -> Materials.
- В деталях сметы вкладка **«Выполнение»** хранит факт работ в отдельной таблице `estimate_execution_rows`, не изменяя плановые строки сметы; при отсутствии таблицы сервис один раз запускает `drizzle`-миграции программно и повторно проверяет структуру.

## 🛠 Технологии

- **Framework**: Next.js 15+ (App Router)
- **Database**: Postgres (Neon) + Drizzle ORM
- **AI**: OpenAI (модель `text-embedding-3-small`) для умного поиска.
- **UI**: Tailwind CSS 4 + Shadcn/UI. Включает премиальный Dashboard для управления проектами.
- **Monitoring**: Sentry (Error tracking & Performance)

## 🚦 Быстрый Старт

1. `pnpm install` — установка зависимостей.
2. `cp .env.example .env` — настройка переменных.
3. **Настройка БД**: Укажите `DATABASE_URL` и `TEST_DATABASE_URL` (оба Neon).
4. `pnpm db:migrate` — накат схемы на БД Neon.
5. `pnpm db:seed` — заполнение базовыми данными.
6. `pnpm dev` — запуск сервера (использует `TEST_DATABASE_URL` если он задан, затем автоматически выполняет `db:sync`).

## 🧪 Команды проверки

```bash
pnpm type-check    # Проверка типов (обязательно перед коммитом)
pnpm lint          # Проверка стиля кода
pnpm test                # Только unit/isolated тесты (без БД/сети)
pnpm test:integration    # Интеграционные тесты (требуют DATABASE_URL)
```

**Важно:** `pnpm test` должен проходить без `.env.test` и без `DATABASE_URL`. Для `pnpm test:integration` нужен валидный `DATABASE_URL` (обычно тестовая ветка Neon).

- Локально используйте `pnpm test:integration`: это обёртка с preflight-проверкой TCP (IPv4 + retry), и она может сделать **skip** при временной недоступности БД, чтобы не блокировать разработку.
- В CI `pnpm test:integration` автоматически переходит в strict-режим (без skip), но рекомендуемая команда для явности — `pnpm test:integration:force`.

## 🚀 CI/CD и Preview Deploys

- CI запускается на `pull_request` в `main`, на `push` в `main` и по расписанию.
- Integration Tests (optional) теперь запускается и на внутренних PR (не из форков), чтобы не было ложного статуса skipped в обычном review-потоке.
- Production деплой в Vercel выполняется только после успешного CI на `push` в `main`.
- Для каждого внутреннего PR (из этого же репозитория) создается Vercel Preview Deploy и ссылка автоматически публикуется комментарием в PR.
- Для работы деплоев в GitHub Secrets должны быть заданы: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## 💾 Команды работы с БД

Проект работает **исключительно с Neon DB** для обеспечения консистентности данных между разработчиками.

```bash
pnpm db:sync       # Синхронизировать код и БД (generate + migrate) c защитой от запуска на production URL
pnpm db:migrate    # Применить миграции к Neon (обычно в текущую DATABASE_URL)
pnpm db:seed       # Заполнить Neon начальными данными
pnpm db:studio     # Открыть графический интерфейс (Drizzle Studio) для Neon
pnpm db:generate   # Генерация новых файлов миграций после изменения схемы
pnpm db:migrate:prod # Явный алиас для наката миграций в production (через production DATABASE_URL)
```

Если нужно накатить только уже существующие миграции без генерации, используйте `pnpm db:sync -- --skip-generate`. 

Если нужно осознанно применить миграции к production URL, используйте `pnpm db:sync -- --allow-production`.


### Как новые колонки попадают в production
1. Меняете `schema.ts` и выполняете `pnpm db:generate` (получаете SQL-миграцию в репозитории).
2. Коммитите миграцию вместе с кодом.
3. На production используется `pnpm release` (или `pnpm db:migrate:prod`) с production `DATABASE_URL` — именно этот шаг накатывает новые колонки в прод.
4. `pnpm db:sync` нужен для локальной/тестовой синхронизации и по умолчанию блокирует не-тестовые URL.

## 🌳 Стратегия веток и БД (Schema Drift)

**Критически важно:**
*   **`main`** — это Production. Схема данных в этой ветке **обязана** совпадать с реальной структурой продакшн-базы.
*   **Feature-ветки** — для разработки. Если вы меняете схему, вы должны создать миграцию.

**Правила избегания "Schema Drift" (расхождений):**
1.  Перед началом работы всегда делайте `git pull origin main`, чтобы получить актуальную `schema.ts`.
2.  Если при накате миграций (`pnpm db:migrate`) вы видите ошибки вида "column "X" does not exist" или наоборот "already exists", но в коде этого нет — значит, схема в базе отличается от кода.
3.  **Не правьте базу руками!** Используйте только Drizzle миграции.
4.  Если база "убежала" вперед (в ней есть колонки, которых нет в коде), нужно синхронизировать `schema.ts` с реальностью и закоммитить это в `main`.

---

## ⚠️ Важные Правила

1. **Никакой локальной БД**: Все изменения вносятся прямо в облачную базу Neon.
2. **Изоляция тестов**: Тесты автоматически переключаются на `TEST_DATABASE_URL`. Никогда не используйте одну и ту же базу для разработки и тестов.
3. **Безопасность**: Следите за тем, чтобы `.env` не попадал в репозиторий.

📚 **Дополнительно**: 
- [Быстрый справочник](docs/database-quick-reference.md)
- [Полное руководство](docs/database-commands.md)
