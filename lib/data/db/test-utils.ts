import { db } from './drizzle.node';
import { sql } from 'drizzle-orm';
import { assertSafeTestCleanupConnection, getSanitizedDatabaseTarget } from '@/lib/testing/assert-test-db';

export async function resetDatabase() {
    // Safety-critical: block TRUNCATE unless active connection is exactly TEST_DATABASE_URL.
    const connectionUrl = assertSafeTestCleanupConnection(process.env.DATABASE_URL);
    const target = getSanitizedDatabaseTarget(connectionUrl);
    console.info(`resetDatabase() target: host=${target.host} db=${target.database}`);

    const tables = [
        'notifications',
        'activity_logs',
        'invitations',
        'estimate_rows',
        'estimates',
        'estimate_shares',
        'impersonation_sessions',
        'team_members',
        'role_permissions',
        'platform_role_permissions',
        'works',
        'materials',
        'permissions',
        'teams',
        'users',
        'counterparties',
    ];

    try {
        // TRUNCATE RESTART IDENTITY CASCADE is the most robust way to clear tables and reset sequences
        await db.execute(sql.raw(`TRUNCATE TABLE ${tables.map(t => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`));
        await db.execute(sql.raw(`
            CREATE OR REPLACE FUNCTION get_user_team_id(target_user_id integer)
            RETURNS integer
            LANGUAGE sql
            STABLE
            SECURITY DEFINER
            SET search_path = public
            AS $$
              SELECT team_id
              FROM team_members
              WHERE user_id = target_user_id
              ORDER BY joined_at
              LIMIT 1;
            $$;
        `));
    } catch (error) {
        console.error('Failed to reset database:', error);
        // Fallback to individual deletes if TRUNCATE fails (though CASCADE should make it work)
        throw error;
    }
}
export async function syncTableSequence(tableName: string, column: string = 'id') {
    await db.execute(sql.raw(`SELECT setval('${tableName}_${column}_seq', (SELECT MAX("${column}") FROM "${tableName}"))`));
}
