-- ============================================
-- PostgreSQL Query Monitoring
-- Requires: pg_stat_statements enabled
-- ============================================

\echo ''
\echo '================================================'
\echo 'TOP 10 SLOWEST QUERIES (by total time)'
\echo '================================================'
SELECT 
    LEFT(query, 100) as query_preview,
    calls,
    ROUND(total_exec_time::numeric, 2) as total_ms,
    ROUND(mean_exec_time::numeric, 2) as mean_ms,
    ROUND((100 * total_exec_time / NULLIF(SUM(total_exec_time) OVER (), 0))::numeric, 2) AS pct
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_%'
  AND query NOT LIKE '%pg_settings%'
ORDER BY total_exec_time DESC
LIMIT 10;

\echo ''
\echo '================================================'
\echo 'TOP 10 SLOWEST QUERIES (by mean time)'
\echo '================================================'
SELECT 
    LEFT(query, 100) as query_preview,
    calls,
    ROUND(mean_exec_time::numeric, 2) as mean_ms,
    rows
FROM pg_stat_statements
WHERE calls > 5 
  AND query NOT LIKE '%pg_stat_%'
ORDER BY mean_exec_time DESC
LIMIT 10;

\echo ''
\echo '================================================'
\echo 'MOST FREQUENT QUERIES'
\echo '================================================'
SELECT 
    LEFT(query, 100) as query_preview,
    calls,
    ROUND(total_exec_time::numeric, 2) as total_ms,
    ROUND(mean_exec_time::numeric, 2) as mean_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_%'
ORDER BY calls DESC
LIMIT 10;

\echo ''
\echo '================================================'
\echo 'QUERIES WITH HIGH I/O'
\echo '================================================'
SELECT 
    LEFT(query, 100) as query_preview,
    calls,
    ROUND(mean_exec_time::numeric, 2) as mean_ms,
    shared_blks_hit,
    shared_blks_read,
    ROUND((100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0))::numeric, 2) AS cache_hit_pct
FROM pg_stat_statements
WHERE shared_blks_read + shared_blks_hit > 100
  AND query NOT LIKE '%pg_stat_%'
ORDER BY shared_blks_read DESC
LIMIT 10;

\echo ''
\echo '================================================'
\echo 'MATERIALS/WORKS QUERIES PERFORMANCE'
\echo '================================================'
SELECT 
    LEFT(query, 120) as query_preview,
    calls,
    ROUND(mean_exec_time::numeric, 2) as mean_ms,
    ROUND(total_exec_time::numeric, 2) as total_ms
FROM pg_stat_statements
WHERE (query ILIKE '%materials%' OR query ILIKE '%works%')
  AND query NOT LIKE '%pg_stat_%'
ORDER BY total_exec_time DESC
LIMIT 10;

\echo ''
\echo '================================================'
\echo 'STATISTICS SUMMARY'
\echo '================================================'
SELECT 
    COUNT(*) as total_queries,
    SUM(calls) as total_calls,
    ROUND(SUM(total_exec_time)::numeric, 2) as total_exec_time_ms,
    ROUND(AVG(mean_exec_time)::numeric, 2) as avg_mean_time_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_%';

\echo ''
\echo '================================================'
\echo 'RESET STATS (optional)'
\echo '================================================'
\echo 'To reset statistics, run: SELECT pg_stat_statements_reset();'
