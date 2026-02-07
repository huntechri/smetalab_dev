# База Данных - Руководство по Командам

## Концепция

Smetalab использует **двухуровневую архитектуру БД**:

1. **Локальная БД (Docker)** — основная рабочая база данных
   - Работает в Docker контейнере `smetalab-db`
   - PostgreSQL 17 с расширениями pgvector, pg_trgm
   - Все команды по умолчанию используют локальную БД

2. **Neon (Cloud)** — транзитный хаб для синхронизации
   - Используется только для обмена данными между ПК
   - **НЕ используется** для разработки напрямую
   - Синхронизация через `db:push-cloud` / `db:pull-cloud`

## Переменные Окружения

```bash
# Локальная БД (основная для разработки)
LOCAL_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smetalab

# Облачная БД (только для синхронизации)
REMOTE_DATABASE_URL=postgresql://neondb_owner:***@ep-***.neon.tech/neondb?sslmode=require

# Активная БД (по умолчанию = локальная)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smetalab
```

**Важно**: В продакшене `DATABASE_URL` будет указывать на облачную БД.

## Основные Команды

### Миграции

```bash
# Применить миграции к локальной БД
pnpm db:migrate

# Эквивалентно:
# DATABASE_URL=$LOCAL_DATABASE_URL drizzle-kit migrate
```

**Что делает**:
- Применяет все `.sql` файлы из `lib/db/migrations/` к локальной БД
- Автоматически использует `LOCAL_DATABASE_URL`

### Заполнение Данными (Seed)

```bash
# Заполнить локальную БД базовыми данными
pnpm db:seed

# Только permissions (если нужно отдельно)
pnpm db:seed:permissions
```

**Что создает**:
- Пользователей, команды, участников
- Permissions, role_permissions, platform_role_permissions
- Тестовые материалы (если в dev режиме)

### Drizzle Studio

```bash
# Открыть визуальный редактор БД
pnpm db:studio
```

**Что делает**:
- Запускает Drizzle Studio на http://127.0.0.1:4983
- Подключается к локальной БД
- Позволяет просматривать и редактировать данные

## Команды Синхронизации (Neon)

### Push (Локальная → Neon)

```bash
pnpm db:push-cloud
```

**Что делает**:
1. Создает dump локальной БД через `pg_dump`
2. Загружает dump в Neon через `pg_restore`
3. **Перезаписывает** все данные в Neon

**Когда использовать**:
- После изменения схемы (миграции)
- После добавления важных тестовых данных
- Перед переключением на другой ПК

### Pull (Neon → Локальная)

```bash
pnpm db:pull-cloud
```

**Что делает**:
1. Создает dump Neon БД через `pg_dump`
2. Загружает dump в локальную БД через `pg_restore`
3. **Перезаписывает** все данные локально

**Когда использовать**:
- После получения изменений от другого разработчика
- При переключении между ПК
- Для восстановления состояния БД

## Workflow: Работа на 2+ ПК

### ПК1: Сделал изменения

```bash
# 1. Изменил схему
pnpm db:migrate

# 2. Отправил в Neon
pnpm db:push-cloud

# 3. Закоммитил код
git add .
git commit -m "feat: add new table"
git push
```

### ПК2: Получение изменений

```bash
# 1. Получил код
git pull

# 2. Получил данные из Neon
pnpm db:pull-cloud

# 3. Запустил проект
pnpm dev
```

## Диагностика и Мониторинг

### Скрипты для анализа производительности

```bash
# Диагностика (медленные запросы, индексы, bloat)
docker exec -i smetalab-db psql -U postgres -d smetalab < scripts/db-diagnostics.sql

# Мониторинг запросов (требует pg_stat_statements)
docker exec -i smetalab-db psql -U postgres -d smetalab < scripts/db-monitor-queries.sql

# Оптимизация (создание индексов, VACUUM)
docker exec -i smetalab-db psql -U postgres -d smetalab < scripts/db-optimize.sql
```

### Bash-хелпер для мониторинга

```bash
# Интерактивный скрипт
./scripts/db-monitor.sh

# Опции:
# 1 - Список всех таблиц с размерами
# 2 - Топ-10 медленных запросов
# 3 - Неиспользуемые индексы
# 4 - Статистика sequential scans
# 5 - Bloat (раздутые таблицы)
# 6 - VACUUM ANALYZE всех таблиц
```

## Устранение Проблем

### Ошибка: "relation does not exist"

**Причина**: Миграции не применены

**Решение**:
```bash
pnpm db:migrate
```

### Ошибка: "search_path not set" (Neon)

**Причина**: Neon требует явного указания схемы

**Решение**: Используйте скрипты из `scripts/` (они уже содержат `SET search_path = public`)

### Ошибка: "connection refused" (локальная БД)

**Причина**: Docker контейнер не запущен

**Решение**:
```bash
docker compose up -d
docker ps  # проверка статуса
```

### Ошибка: Neon 512MB limit exceeded

**Причина**: Большие HNSW индексы (materials: 275MB, works: 4.3MB)

**Решение**:
1. Обновить Neon plan (Launch → Scale)
2. Использовать селективный sync (только схема + permissions, без materials)

## Технические Детали

### Используемые инструменты

- **drizzle-kit**: миграции, генерация схемы
- **pg_dump/pg_restore**: синхронизация данных
- **docker exec**: запуск команд внутри контейнера
- **tsx**: TypeScript скрипты (без компиляции)

### Формат Dump

- **Format**: Custom (`--format=custom`)
- **Flags**: `--no-owner --no-acl` (для переносимости)
- **Cleanup**: `--clean --if-exists` (безопасное удаление перед восстановлением)

### Автоматизация

Все скрипты в `scripts/`:
- `db-sync.ts` — push/pull с Neon
- `db-migrate-local.ts` — миграция + seed
- `db-run-with-local.ts` — обертка для drizzle-kit с LOCAL_DATABASE_URL
- `db-seed-local.ts` — seed с явным LOCAL_DATABASE_URL
- `neon-migrate.ts` — прямое применение миграций к Neon (обход search_path)

## Лучшие Практики

1. **Всегда работайте с локальной БД**
   - Быстрее (нет сетевых задержек)
   - Офлайн режим
   - Неограниченный размер

2. **Синхронизируйте через Neon**
   - Push: после важных изменений схемы
   - Pull: перед началом работы на новом ПК

3. **Коммитьте миграции в Git**
   - Все изменения схемы — через миграции
   - `lib/db/migrations/*.sql` всегда в репозитории

4. **Регулярно мониторьте производительность**
   - `scripts/db-diagnostics.sql` — раз в неделю
   - Оптимизируйте индексы по результатам

5. **Используйте транзакции**
   - Все массовые операции — в `db.transaction()`
   - Гарантия целостности данных
