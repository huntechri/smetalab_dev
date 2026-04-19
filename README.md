# Smetalab v1.0.3

Профессиональная SaaS-платформа на **Next.js**, с продвинутой мультиарендностью, гибридным AI-поиском и системой управления командой.

**Репозиторий: [https://github.com/huntechri/smetalab_dev](https://github.com/huntechri/smetalab_dev)**

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

## 🚀 CI/CD и Preview Deploys (с изолированными БД Neon)

- CI запускается на `pull_request` в `main`, на `push` в `main` и по расписанию.
- Integration Tests теперь запускаются и на внутренних PR, чтобы гарантировать рабочую базу до слияния.
- **Изолированные превью для PR:** При открытии или обновлении Pull Request 자동으로 создаётся отдельная ветка базы данных в Neon (1 PR = 1 ветка).
- **Автоматические миграции и сиды**: GitHub Actions (`deploy.yml`) самостоятельно накатывает зависимости, схему (migrations) и права доступа (`pnpm db:seed:permissions`) на эту изолированную ветку БД перед сборкой приложения.
- Для каждого внутреннего PR создается Vercel Preview Deploy, который **напрямую подключается** (через внедренные env-переменные) к этой временной ветке БД, и ссылка публикуется комментарием в PR.
- **Уборка мусора**: При закрытии или мердже PR временная ветка в базе данных Neon автоматически удаляется.
- Production деплой в Vercel выполняется только после успешного завершения всего CI пайплайна на `push` в `main`.
- Для работы деплоев в GitHub Secrets должны быть заданы: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `NEON_API_KEY`.

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

## 🔒 CI и Защита веток

### Как работает CI

Каждый pull request проходит три обязательных проверки в GitHub Actions (`.github/workflows/ci.yml`):

| Проверка | Команда |
|---|---|
| Линтинг (ESLint) | `pnpm lint` |
| Проверка типов (TypeScript) | `pnpm type-check` |
| Тесты (Vitest) | `pnpm test` |

Финальный агрегирующий job **`ci`** (отображается в GitHub как **"All Checks Passed"**) завершается успешно только если все три проверки прошли. Именно этот статус используется как required status check на ветке `main`.

### Настройка защиты ветки (для администратора репозитория)

Правило задано декларативно в **`.github/rulesets/main-protection.json`** и применяется одним из трёх способов — выберите любой удобный.

> **Обязательный ревью:** Помимо прохождения CI-проверок, каждый pull request должен получить **не менее 1 подтверждающего ревью** (approving review) от другого участника команды — автор не может смержить свой PR самостоятельно. Это правило задано в ruleset через `required_approving_review_count: 1`.

#### Способ 1 — скрипт из командной строки (рекомендуется для новых форков)

Требования: установленный [GitHub CLI](https://cli.github.com/) и токен с правом `administration:write`.

```bash
# Аутентификация (если ещё не выполнена)
gh auth login

# Применить ruleset к текущему репозиторию
./scripts/setup-branch-protection.sh

# Или явно указать репозиторий:
./scripts/setup-branch-protection.sh owner/repo
```

Скрипт создаёт (или обновляет) Ruleset **`main-protection`** через GitHub Rulesets API.  
При повторном запуске на уже защищённом репозитории он просто обновит существующее правило — настройки не задвоятся.

#### Способ 2 — GitHub Actions workflow (без локального окружения)

1. Перейдите в **Actions → Setup Branch Protection** в репозитории.
2. Нажмите **Run workflow**, выберите ветку (`main` или `master`) и запустите.
3. Workflow применит защиту через классический Branch Protection API, добавив **`All Checks Passed`** как required status check.

> **Важно:** Способ 2 использует классический Branch Protection API и настраивает только требование прохождения CI-статуса. Он **не применяет правило обязательного ревью** (`required_approving_review_count: 1`). Для полной защиты (CI + ревью) используйте **Способ 1** (скрипт) или **Способ 3** (UI), которые работают через Rulesets API и применяют весь файл `.github/rulesets/main-protection.json`.

> Файл workflow: `.github/workflows/setup-branch-protection.yml`

#### Способ 3 — ручная настройка через GitHub UI

1. Перейдите в **Settings → Rules → Rulesets** репозитория.
2. Нажмите **New ruleset → Import a ruleset** и загрузите `.github/rulesets/main-protection.json`.  
   Либо создайте вручную: **New branch ruleset**, target `main`/`master`, добавьте правило **Require a pull request before merging** (1 approving review) и **Require status checks → All Checks Passed**.
3. Сохраните.

После применения любого из способов GitHub блокирует кнопку "Merge" на любом PR, где хотя бы одна из проверок (lint, type-check, test) завершилась с ошибкой или не получено хотя бы одно approving review.

---

### Автоматическая защита при форке: org-level vs repo-level rulesets

> **Рекомендуемая стратегия:**
> - **Организации на GitHub Team/Enterprise** → используйте **Способ 4** (org-level ruleset). Защита применяется ко всем репозиториям автоматически — никаких действий после форка не нужно.
> - **Индивидуальные аккаунты / бесплатный план** → используйте **Способы 1–3** (repo-level, вручную) или **Способ 5** (GitHub App webhook) для автоматизации.

#### Разница между org-level и repo-level rulesets

| | Repo-level ruleset | Org-level ruleset |
|---|---|---|
| **Область действия** | Один конкретный репозиторий | Все репозитории организации (включая будущие форки) |
| **Где настраивается** | Settings → Rules → Rulesets репозитория | Organization Settings → Rules → Rulesets |
| **API endpoint** | `POST /repos/{owner}/{repo}/rulesets` | `POST /orgs/{org}/rulesets` |
| **Форки** | Требует ручной настройки в каждом новом форке | Применяется автоматически ко всем форкам |
| **Подходит для** | Индивидуальных репозиториев | Организаций, где нужна единая политика |

**Repo-level** (текущий способ — `.github/rulesets/main-protection.json`) требует, чтобы владелец нового форка вручную запустил скрипт или workflow. Это описано выше в Способах 1–3.

**Org-level** (файл `.github/rulesets/org-main-protection.json`) настраивается один раз на уровне организации и автоматически покрывает все существующие и будущие репозитории — никаких ручных действий после форка не требуется.

#### Способ 4 — org-level ruleset (нулевое касание для форков)

Требования: токен с правом **`admin:org`** (не `administration:write`, как для repo-level).

```bash
# Применить org-level ruleset ко всей организации
./scripts/setup-org-branch-protection.sh my-org-name

# Или авто-определить организацию из git remote:
./scripts/setup-org-branch-protection.sh
```

Скрипт вызывает `POST /orgs/{org}/rulesets` и создаёт (или обновляет) правило **`org-main-protection`**, которое покрывает ветки `main`/`master` во ВСЕХ репозиториях организации. Конфигурация: `.github/rulesets/org-main-protection.json`.

> **Важно:** org-level rulesets требуют GitHub Team или Enterprise plan. На бесплатных личных аккаунтах используйте repo-level (Способы 1–3).

#### Способ 5 — автоматический webhook при создании репозитория (через GitHub App)

Этот способ — резервный вариант для окружений, где org-level rulesets недоступны (например, бесплатный план), или там, где нужно применять защиту к форкам вне организации.

> **Важно:** GitHub Organization Webhooks **не могут** напрямую вызывать GitHub REST API `/repos/{org}/{repo}/dispatches`, так как сами webhook-запросы не проходят аутентификацию как API-клиенты. Для этого паттерна **обязательно нужен** промежуточный аутентифицированный агент — GitHub App или внешний сервис.

**Рекомендуемая схема:**

1. Создайте **GitHub App** с разрешением `Contents: Read & Write` и подпиской на событие **`installation.repositories_added`** (или org webhook `repository → created`).
2. GitHub App получает webhook от GitHub при создании/форке репозитория.
3. App аутентифицируется как installation и вызывает:
   ```
   POST /repos/<org>/<this-repo>/dispatches
   {
     "event_type": "repository_created",
     "client_payload": { "repository": "owner/new-repo-name" }
   }
   ```
4. Workflow `.github/workflows/auto-branch-protection.yml` ловит событие и применяет защиту через `scripts/setup-branch-protection.sh`.
5. В секретах репозитория добавьте `BRANCH_PROTECTION_TOKEN` — токен с правом `administration:write` на целевой репозиторий.

**Примечание о стратегии:** workflow применяет repo-level защиту к конкретному указанному репозиторию — это намеренно, поскольку данный способ предназначен для случаев, когда org-level ruleset недоступен.

---

## ⚠️ Важные Правила

1. **Никакой локальной БД**: Все изменения вносятся прямо в облачную базу Neon.
2. **Изоляция тестов**: Тесты автоматически переключаются на `TEST_DATABASE_URL`. Никогда не используйте одну и ту же базу для разработки и тестов.
3. **Безопасность**: Следите за тем, чтобы `.env` не попадал в репозиторий.

📚 **Дополнительно**: 
- [Быстрый справочник](docs/database-quick-reference.md)
- [Полное руководство](docs/database-commands.md)
