# Быстрый Справочник по Командам БД

## Основные Команды

| Команда | Цель БД | Описание |
|---------|---------|----------|
| `pnpm db:migrate` | Локальная | Применить миграции |
| `pnpm db:seed` | Локальная | Заполнить тестовыми данными |
| `pnpm db:studio` | Локальная | Открыть Drizzle Studio |
| `pnpm db:push-cloud` | Локальная → Neon | Синхронизация вверх |
| `pnpm db:pull-cloud` | Neon → Локальная | Синхронизация вниз |

## Что используется по умолчанию?

```
📍 Все команды работают с локальной БД, КРОМЕ:
   - db:push-cloud (отправка в Neon)
   - db:pull-cloud (получение из Neon)

📍 Neon используется ТОЛЬКО как транзитный хаб для синхронизации между ПК
```

## Переменные Окружения

```bash
# .env
LOCAL_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smetalab  # ← Основная БД
REMOTE_DATABASE_URL=postgresql://...neon.tech/...                         # ← Только для sync
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smetalab        # ← Приложение
```

## Первый Запуск (Новый ПК)

```bash
# 1. Установка
pnpm install

# 2. Настройка
cp .env.example .env

# 3. Запуск Docker
docker compose up -d

# 4. Инициализация БД
pnpm db:migrate
pnpm db:seed

# 5. Запуск приложения
pnpm dev
```

## Ежедневный Workflow

### ПК1: Сделал изменения

```bash
# Работа
git add .
git commit -m "feat: ..."

# Отправка
pnpm db:push-cloud  # ← Отправить БД в Neon
git push
```

### ПК2: Получение изменений

```bash
# Получение
git pull
pnpm db:pull-cloud  # ← Получить БД из Neon

# Работа
pnpm dev
```

## Диагностика

```bash
# Проверка контейнера
docker ps | grep smetalab-db

# Проверка подключения
docker exec smetalab-db psql -U postgres -d smetalab -c "SELECT version();"

# Список таблиц
docker exec smetalab-db psql -U postgres -d smetalab -c "\dt"

# Размер БД
docker exec smetalab-db psql -U postgres -d smetalab -c "SELECT pg_size_pretty(pg_database_size('smetalab'));"
```

## Устранение Проблем

| Проблема | Решение |
|----------|---------|
| `connection refused` | `docker compose up -d` |
| `relation does not exist` | `pnpm db:migrate` |
| `permission denied` | Проверь `LOCAL_DATABASE_URL` в `.env` |
| Neon limit exceeded | Обнови план или используй селективный sync |

## Важные Заметки

⚠️ **Никогда не используй Neon напрямую для разработки**
   - Медленнее из-за сетевых задержек
   - Ограничение 512MB на бесплатном плане
   - Может создать конфликты при работе с нескольких ПК

✅ **Всегда работай с локальной БД**
   - Быстрее
   - Офлайн режим
   - Неограниченный размер
   - Полный контроль

📚 **Подробная документация**: [docs/database-commands.md](database-commands.md)
