# PR #363 Review (analysis)

## Scope and method
- Compared `origin/main...pr-363-full`.
- Reviewed changed files in 4 zones: documentation, package scripts, migration artifacts, and Neon automation code/tests.
- Validation commands used:
  - `git diff --name-only origin/main...pr-363-full`
  - `git diff origin/main...pr-363-full -- README.md package.json`
  - `git show pr-363-full:lib/data/db/migrations/meta/_journal.json`
  - `git show origin/main:lib/data/db/migrations/meta/_journal.json`

## Findings (with severity)

### 1) ❗ Blocking: README announces baseline commands that do not exist in scripts
**Evidence**
- README in PR introduces:
  - `pnpm db:migrate:baseline`
  - `pnpm db:generate:baseline`
- `package.json` in PR adds only `db:neon:branch` and does not add any baseline scripts.

**Risk**
- Team members following README get immediate `Missing script` errors.
- Baseline flow is documented as available but not executable.

**Recommendation**
- Keep docs and scripts in parity in the same PR:
  1. Add missing scripts + implementations, **or**
  2. Remove baseline sections from README until shipped.

---

### 2) ❗ Blocking: migration history rewritten in-place for all environments
**Evidence**
- PR deletes legacy migration chain `0000..0029` from `lib/data/db/migrations/*`.
- PR replaces Drizzle journal entries with a single entry `0000_baseline` in `lib/data/db/migrations/meta/_journal.json`.

**Risk**
- Existing deployed DBs may try to apply `0000_baseline` as a new migration.
- High probability of migration failures on non-empty databases (`already exists`, duplicate objects, failed constraints).

**Recommendation**
- Do not replace legacy chain for active environments.
- Preferred rollout:
  1. Keep existing migration folder/journal intact for `db:migrate`.
  2. Add separate baseline folder/runner only for fresh DB bootstrap.
  3. Gate baseline command with explicit non-empty migration table check.

---

### 3) ❗ Blocking: documented baseline safety guard is not present in final PR state
**Evidence**
- README claims `db:migrate:baseline` includes a guard (`abort if drizzle.__drizzle_migrations has entries`).
- Final PR state contains no baseline script/runner where this guard is implemented.

**Risk**
- Operators rely on documented protection that is absent.
- Unsafe execution path becomes more likely in CI and manual ops.

**Recommendation**
- Implement guard in code (not only docs):
  - Query `drizzle.__drizzle_migrations` count before applying baseline.
  - Abort with explicit actionable error when count > 0.
  - Add integration test for both empty/non-empty cases.

---

### 4) ⚠️ Major: Neon automation tests cover only helpers, not network behavior
**Evidence**
- Added test `__tests__/unit/lib/data/db/neon-branch.test.ts` covers only:
  - branch name normalization
  - env parsing/defaults
- No tests for `createNeonBranch()` request/response/error behavior.

**Risk**
- API contract regressions can ship silently (wrong parent selection, URI extraction, error handling).

**Recommendation**
- Add unit tests with mocked `fetch` for:
  1. `parent_id` precedence over `parent_name`.
  2. Non-OK responses include status/body in thrown message.
  3. URI selection precedence: non-pooled first, fallback to first available.

## Merge decision
- **Request changes** before merge.
- **Blocking before merge**: findings #1, #2, #3.
- Finding #4 should be addressed in this PR or immediately in a follow-up PR with clear owner/deadline.

## Concrete acceptance checklist for PR #363 author
- [ ] README and `package.json` scripts are fully consistent.
- [ ] Legacy incremental migration path remains safe for existing environments.
- [ ] Baseline path is isolated to fresh DB bootstrap only.
- [ ] Baseline guard exists in executable code and is tested.
- [ ] Neon branch automation has API behavior tests (request body, error path, URI selection).

## Проверка именно кода (не только документации)
Да — дополнительно проверен код в изменённых файлах PR #363, а не только README/план:
- `lib/data/db/neon-branch.ts`: проверена логика сборки payload (`parent_id` vs `parent_name`), обработка non-2xx ответов и выбор `connection_uri`.
- `scripts/create-neon-branch.ts`: проверен CLI-парсинг (`--suffix`, `--parent`) и прокидывание env/CLI в `createNeonBranch`.
- `lib/data/db/migrations/meta/_journal.json`: проверен факт сброса истории миграций к единственной записи `0000_baseline` (ключевой риск для существующих БД).
- `package.json` + `README.md`: подтверждён рассинхрон по baseline-скриптам (`db:migrate:baseline`, `db:generate:baseline`).

Вывод: замечания в разделе **Blocking** основаны на проверке исполняемого кода и миграционных артефактов, а не только текста документации.
