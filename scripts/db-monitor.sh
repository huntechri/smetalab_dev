#!/bin/bash
# Database Monitoring Helper Script
# Usage: ./db-monitor.sh [diagnostics|queries|optimize]

CONTAINER="smetalab-db"
DB_USER="postgres"
DB_NAME="smetalab"

case "$1" in
    diagnostics)
        echo "Running database diagnostics..."
        docker exec -i $CONTAINER psql -U $DB_USER -d $DB_NAME < scripts/db-diagnostics.sql
        ;;
    queries)
        echo "Analyzing query performance..."
        docker exec -i $CONTAINER psql -U $DB_USER -d $DB_NAME < scripts/db-monitor-queries.sql
        ;;
    optimize)
        echo "Applying optimizations..."
        docker exec -i $CONTAINER psql -U $DB_USER -d $DB_NAME < scripts/db-optimize.sql
        ;;
    vacuum)
        echo "Running VACUUM ANALYZE..."
        docker exec -i $CONTAINER psql -U $DB_USER -d $DB_NAME -c "VACUUM ANALYZE;"
        ;;
    size)
        echo "Database size report..."
        docker exec -i $CONTAINER psql -U $DB_USER -d $DB_NAME -c "
            SELECT 
                tablename,
                pg_size_pretty(pg_total_relation_size('public.'||tablename)) as total_size,
                pg_size_pretty(pg_table_size('public.'||tablename)) as table_size,
                pg_size_pretty(pg_indexes_size('public.'||tablename)) as indexes_size
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size('public.'||tablename) DESC;
        "
        ;;
    *)
        echo "Usage: $0 {diagnostics|queries|optimize|vacuum|size}"
        echo ""
        echo "Commands:"
        echo "  diagnostics  - Run full database diagnostics"
        echo "  queries      - Show slow and frequent queries (requires pg_stat_statements)"
        echo "  optimize     - Apply performance optimizations"
        echo "  vacuum       - Run VACUUM ANALYZE on all tables"
        echo "  size         - Show table and index sizes"
        exit 1
        ;;
esac
