# Vercel Deployment Setup

## Architecture Overview

- **Local Development**: PostgreSQL в Docker (localhost:5432)
- **Staging/Production**: Neon PostgreSQL (облачная БД)
- **Vercel**: Подключается к Neon, не к локальной БД

## 1. Настройка Neon Database

### Создание проектов в Neon:

1. Зайти в [Neon Console](https://console.neon.tech)
2. Создать два проекта:
   - `smetalab-preview` (для preview deployments)
   - `smetalab-production` (для production)
3. Получить connection strings:
   ```
   Preview:     postgresql://user:pass@ep-xxx.neon.tech/smetalabv3?sslmode=require
   Production:  postgresql://user:pass@ep-yyy.neon.tech/smetalabv3?sslmode=require
   ```

### Миграции на Neon:

```bash
# Preview БД
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/smetalabv3?sslmode=require" pnpm db:migrate

# Production БД
DATABASE_URL="postgresql://user:pass@ep-yyy.neon.tech/smetalabv3?sslmode=require" pnpm db:migrate
```

## 2. Настройка Vercel Project

### 2.1. Связать проект с Vercel:

```bash
# Установить Vercel CLI
pnpm add -g vercel

# Войти в Vercel
vercel login

# Связать проект (выбрать существующий или создать новый)
vercel link
```

После `vercel link` создастся `.vercel/project.json`:
```json
{
  "orgId": "team_xxxxx",
  "projectId": "prj_xxxxx"
}
```

### 2.2. Настроить Environment Variables в Vercel Dashboard:

**Vercel Dashboard → Project → Settings → Environment Variables**

#### Preview Environment:
```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/smetalabv3?sslmode=require
POSTGRES_URL=postgresql://user:pass@ep-xxx.neon.tech/smetalabv3?sslmode=require
AUTH_SECRET=<generate-random-256bit>
STRIPE_SECRET_KEY=<stripe-test-key>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe-publishable-key>
RESEND_API_KEY=<resend-api-key>
BASE_URL=https://smetalabv3-preview.vercel.app
AUTH_TRUST_HOST=true
```

#### Production Environment:
```bash
DATABASE_URL=postgresql://user:pass@ep-yyy.neon.tech/smetalabv3?sslmode=require
POSTGRES_URL=postgresql://user:pass@ep-yyy.neon.tech/smetalabv3?sslmode=require
AUTH_SECRET=<production-secret-256bit>
STRIPE_SECRET_KEY=<stripe-live-key>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe-publishable-key>
RESEND_API_KEY=<resend-api-key>
BASE_URL=https://smetalab.vercel.app
AUTH_TRUST_HOST=true
```

### 2.3. Генерация AUTH_SECRET:

```bash
# В Node.js REPL или в отдельном скрипте
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Настройка GitHub Secrets

**GitHub → Settings → Secrets and variables → Actions → New repository secret**

```bash
VERCEL_TOKEN          # Создать в Vercel: Settings → Tokens → Create Token
VERCEL_ORG_ID         # Из .vercel/project.json (orgId)
VERCEL_PROJECT_ID     # Из .vercel/project.json (projectId)
```

### Создание VERCEL_TOKEN:

```bash
# Через CLI (рекомендуется)
vercel token create github-actions

# Или через Dashboard:
# Vercel → Settings → Tokens → Create Token
# Scope: Full Access to целевому проекту
```

## 4. Workflow процесс

### Pull Request (Preview):
1. PR открыт → `vercel-preview.yml` запускается
2. CI job проверяет код (использует локальную Docker БД для тестов)
3. После успеха CI → `deploy-preview` job
4. Vercel собирает проект с env vars из Preview окружения
5. Vercel деплоит preview → комментарий в PR с URL

### Merge to Main (Production):
1. Push в main → `deploy.yml` запускается
2. CI job проверяет код (локальная БД)
3. После успеха CI → `deploy-production` job
4. Vercel собирает с Production env vars
5. Vercel деплоит в production

## 5. Database Migration Strategy

### Опция 1: Manual Migrations (Рекомендуется для старта)

```bash
# Перед деплоем запускать миграции вручную
DATABASE_URL="<neon-url>" pnpm db:migrate
```

### Опция 2: Автоматические миграции при деплое

Добавить в `package.json`:
```json
{
  "scripts": {
    "vercel-build": "pnpm db:migrate && next build"
  }
}
```

⚠️ **Осторожно**: Автомиграции могут сломать production при откате деплоя.

### Опция 3: Separate Migration Workflow (Production-ready)

Создать `.github/workflows/migrate-neon.yml`:
```yaml
name: Migrate Neon Database

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to migrate'
        required: true
        type: choice
        options:
          - preview
          - production

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:migrate
        env:
          DATABASE_URL: ${{ secrets[format('DATABASE_URL_{0}', inputs.environment)] }}
```

## 6. Проверка настройки

### Чеклист перед первым деплоем:

- [ ] Neon БД созданы (preview + production)
- [ ] Миграции применены к Neon БД
- [ ] Vercel env vars настроены (preview + production)
- [ ] GitHub secrets добавлены (VERCEL_TOKEN, ORG_ID, PROJECT_ID)
- [ ] `.vercel/` добавлен в `.gitignore`
- [ ] Тестовый PR создан для проверки preview

### Проверка подключения к Neon:

```bash
# Локально проверить подключение к Neon
DATABASE_URL="<neon-preview-url>" pnpm db:migrate

# Должно выполниться без ошибок
```

## 7. Troubleshooting

### Ошибка "Connection timeout" при деплое:

**Причина**: Neon database в режиме "suspend" (автоматический sleep после неактивности).

**Решение**: 
1. Зайти в Neon Console → Database → Operations → Wake
2. Или настроить "Always-On" для production БД

### Ошибка "SSL required":

**Причина**: Neon требует SSL подключение.

**Решение**: Добавить `?sslmode=require` в конец DATABASE_URL.

### Миграции не применяются:

**Причина**: Vercel не запускает миграции автоматически.

**Решение**: Применить миграции вручную перед деплоем или использовать `vercel-build` script.

## 8. Production Checklist

Перед переключением на production:

- [ ] Neon Production БД протестирована
- [ ] Все миграции применены
- [ ] Production secrets правильно настроены
- [ ] Stripe webhooks настроены на production URL
- [ ] Custom domain добавлен в Vercel
- [ ] SSL сертификат активен
- [ ] Monitoring настроен (Sentry + Vercel Analytics)
- [ ] Backup strategy для Neon БД

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
