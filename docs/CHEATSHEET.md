# 📋 Шпаргалка: Работа с 2 ПК

## ⏰ Утро (начало работы)

```bash
git pull
pnpm db:pull-cloud
pnpm dev
```

**Что это делает:**
1. Получить код с другого ПК
2. Получить БД с другого ПК (через Neon)
3. Запустить приложение

---

## 🌙 Вечер (конец работы)

```bash
pnpm db:push-cloud
git add .
git commit -m "описание изменений"
git push
```

**Что это делает:**
1. Отправить БД в Neon (для другого ПК)
2. Закоммитить код
3. Отправить код в GitHub

---

## 📝 Первая настройка ПК1

```bash
pnpm install
cp .env.example .env
# Заполнить .env (LOCAL_DATABASE_URL, REMOTE_DATABASE_URL)
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm db:push-cloud  ← Первая отправка в Neon
git push
```

---

## 📝 Первая настройка ПК2

```bash
git clone https://github.com/azap026/smetalabv3.git
cd smetalabv3
pnpm install
cp .env.example .env
# Заполнить .env (те же данные что и на ПК1!)
docker compose up -d
pnpm db:pull-cloud  ← Получить БД от ПК1
pnpm dev
```

---

## ⚠️ Важно помнить

✅ **Всегда** делай `db:pull-cloud` утром  
✅ **Всегда** делай `db:push-cloud` вечером  
❌ **Никогда** не работай одновременно с двух ПК  
❌ **Никогда** не пуши код без `db:push-cloud`

---

## 🆘 Если что-то пошло не так

| Проблема | Решение |
|----------|---------|
| Docker не запускается | `docker compose up -d` |
| "relation does not exist" | `pnpm db:migrate` |
| Забыл сделать pull | `pnpm db:pull-cloud --force` |
| Забыл сделать push | `pnpm db:push-cloud` перед git push |

---

## 📚 Документация

- [README.md](../README.md) — основная документация
- [database-2pc-workflow.md](database-2pc-workflow.md) — подробные диаграммы
- [database-quick-reference.md](database-quick-reference.md) — быстрый справочник
- [database-commands.md](database-commands.md) — полное руководство

---

**Распечатай и повесь над монитором!** 🖨️
