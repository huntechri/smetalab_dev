import { db } from './drizzle.node';
import { sql } from 'drizzle-orm';

export async function resetDatabase() {
    // 🛡️ CRITICAL SAFETY CHECK: Prevent accidental wipe of production/dev database
    const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || '';
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true' || process.env.CI === 'true';
    let hostname = '';
    let database = '';

    try {
        const parsedUrl = new URL(dbUrl);
        hostname = parsedUrl.hostname.toLowerCase();
        database = parsedUrl.pathname.replace(/^\//, '').toLowerCase();
    } catch {
        // Keep defaults, safety check below will fail closed
    }

    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
    const hasTestDatabaseName = database.includes('test') || database.endsWith('_ci');
    const hasExplicitTestMarker = dbUrl.toLowerCase().includes('test');
    const hasDedicatedTestUrl = Boolean(process.env.TEST_DATABASE_URL);

    // Safety check: must be test env AND explicitly target a safe DB for destructive reset.
    // We allow either dedicated TEST_DATABASE_URL, explicit test DB naming, or localhost+test marker.
    if (!isTestEnv || !(hasDedicatedTestUrl || hasTestDatabaseName || (isLocalHost && hasExplicitTestMarker))) {
        console.error('❌ SAFETY ABORT: resetDatabase() blocked!');
        console.error('This tool is designed to WIPE the database. For safety, it only runs if:');
        console.error('1. NODE_ENV is "test" or CI=true');
        console.error('2. TEST_DATABASE_URL is set OR DATABASE_URL explicitly points to test DB');
        console.error('---');
        console.error('Current Environment:', process.env.NODE_ENV || 'development');
        console.error('CI detected:', process.env.CI || 'false');
        console.error('Database Host:', hostname || 'unknown');
        console.error('Database Name:', database || 'unknown');
        throw new Error('Safety abort: Database reset is only allowed on the TEST database in TEST environment. Please check your DATABASE_URL.');
    }

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
