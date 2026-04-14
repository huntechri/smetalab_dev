-- ============================================
-- ОПТИМИЗАЦИЯ ПРОИЗВОДИТЕЛЬНОСТИ БД Smetalab (Neon)
-- ============================================

SET search_path = public;

\echo 'Начало оптимизации Neon...'

-- 1. Индексы для teams
CREATE INDEX IF NOT EXISTS teams_id_idx ON teams(id);

-- 2. Индексы для users
CREATE INDEX IF NOT EXISTS users_id_idx ON users(id);
CREATE INDEX IF NOT EXISTS users_deleted_at_null_idx ON users(deleted_at) WHERE deleted_at IS NULL;

-- 3. Индексы для team_members
CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);
CREATE INDEX IF NOT EXISTS team_members_team_user_active_idx 
ON team_members(team_id, user_id) WHERE left_at IS NULL;

-- 4. Индексы для RBAC
CREATE INDEX IF NOT EXISTS permissions_code_idx ON permissions(code);
CREATE INDEX IF NOT EXISTS role_permissions_role_idx ON role_permissions(role);
CREATE INDEX IF NOT EXISTS role_permissions_permission_id_idx ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS platform_role_permissions_role_idx ON platform_role_permissions(platform_role);

-- 5. Индексы для materials
CREATE INDEX IF NOT EXISTS materials_tenant_code_active_idx 
ON materials(tenant_id, code) WHERE deleted_at IS NULL AND status = 'active';

-- 6. VACUUM (если нужно)
VACUUM ANALYZE materials;
VACUUM ANALYZE teams;
VACUUM ANALYZE users;
VACUUM ANALYZE team_members;

-- 7. Обновление статистики
ANALYZE materials;
ANALYZE works;
ANALYZE teams;
ANALYZE users;
ANALYZE team_members;

\echo 'Оптимизация Neon завершена!'
