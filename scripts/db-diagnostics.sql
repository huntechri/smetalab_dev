-- ============================================
-- ДИАГНОСТИКА ПРОИЗВОДИТЕЛЬНОСТИ PostgreSQL
-- Smetalab Database Performance Analysis
-- ============================================

\echo ''
\echo '================================================'
\echo '1. ТОП-10 медленных запросов (total time)'
\echo '================================================'
SELECT 
    LEFT(query, 100) as query_preview,
    calls,
    ROUND(total_exec_time::numeric, 2) as total_ms,
    ROUND(mean_exec_time::numeric, 2) as mean_ms,
    ROUND((100 * total_exec_time / NULLIF(SUM(total_exec_time) OVER (), 0))::numeric, 2) AS pct
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_%'
ORDER BY total_exec_time DESC
LIMIT 10;

\echo ''
\echo '================================================'
\echo '2. ТОП-10 по среднему времени (mean time)'
\echo '================================================'
SELECT 
    LEFT(query, 100) as query_preview,
    calls,
    ROUND(mean_exec_time::numeric, 2) as mean_ms,
    rows
FROM pg_stat_statements
WHERE calls > 5 AND query NOT LIKE '%pg_stat_%'
ORDER BY mean_exec_time DESC
LIMIT 10;

\echo ''
\echo '================================================'
\echo '3. Запросы с materials/works/embeddings'
\echo '================================================'
SELECT 
    LEFT(query, 120) as query_preview,
    calls,
    ROUND(mean_exec_time::numeric, 2) as mean_ms,
    rows
FROM pg_stat_statements
WHERE (query ILIKE '%materials%' OR query ILIKE '%works%' OR query ILIKE '%embedding%')
  AND query NOT LIKE '%pg_stat_%'
ORDER BY mean_exec_time DESC
LIMIT 10;

\echo ''
\echo '================================================'
\echo '4. Неиспользуемые индексы (idx_scan = 0)'
\echo '================================================'
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

\echo ''
\echo '================================================'
\echo '5. Таблицы с Seq Scans (требуют индексы)'
\echo '================================================'
SELECT 
    schemaname,
    tablename,
    seq_scan,
    idx_scan,
    n_live_tup as rows,
    ROUND((100.0 * seq_scan / NULLIF(seq_scan + idx_scan, 0))::numeric, 2) as seq_pct
FROM pg_stat_user_tables
WHERE seq_scan > 100
ORDER BY seq_scan DESC
LIMIT 10;

\echo ''
\echo '================================================'
\echo '6. Размеры таблиц и индексов'
\echo '================================================'
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) as total_size,
    pg_size_pretty(pg_table_size('public.'||tablename)) as table_size,
    pg_size_pretty(pg_indexes_size('public.'||tablename)) as indexes_size,
    ROUND((100.0 * pg_indexes_size('public.'||tablename) / 
           NULLIF(pg_total_relation_size('public.'||tablename), 0))::numeric, 2) as idx_pct
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC
LIMIT 10;

\echo ''
\echo '================================================'
\echo '7. Bloat - мертвые строки (VACUUM needed)'
\echo '================================================'
SELECT 
    tablename,
    n_live_tup as live,
    n_dead_tup as dead,
    ROUND((100.0 * n_dead_tup / NULLIF(n_live_tup, 0))::numeric, 2) as dead_pct,
    last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 50
ORDER BY n_dead_tup DESC
LIMIT 10;

\echo ''
\echo '================================================'
\echo '8. Активные/долгие запросы (блокировки)'
\echo '================================================'
SELECT 
    pid,
    state,
    wait_event_type,
    wait_event,
    query_start,
    NOW() - query_start as duration,
    LEFT(query, 100) as query_preview
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT ILIKE '%pg_stat_activity%'
ORDER BY query_start ASC;

\echo ''
\echo '================================================'
\echo '9. Индексы для materials'
\echo '================================================'
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'materials'
ORDER BY indexname;

\echo ''
\echo '================================================'
\echo '10. Индексы для works'
\echo '================================================'
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'works'
ORDER BY indexname;

\echo ''
\echo '================================================'
\echo '11. Статистика использования индексов'
\echo '================================================'
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public' 
  AND tablename IN ('materials', 'works')
ORDER BY tablename, idx_scan DESC;

\echo ''
\echo '================================================'
\echo 'ДИАГНОСТИКА ЗАВЕРШЕНА'
\echo '================================================'
