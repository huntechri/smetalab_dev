import { db } from './drizzle';
import { sql } from 'drizzle-orm';

export async function resetDatabase() {
    // 🛡️ CRITICAL SAFETY CHECK: Prevent accidental wipe of production/dev database
    const dbUrl = process.env.DATABASE_URL || '';
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true' || process.env.CI === 'true';
    const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') || dbUrl.includes('postgres');
    const isNeonTest = dbUrl.includes('test') || dbUrl.includes('agrelo53') || dbUrl.includes('db_test');

    // Safety check: must be a test environment AND (be a local DB OR a dedicated test branch)
    if (!isTestEnv || (!isLocal && !isNeonTest)) {
        console.error('❌ SAFETY ABORT: resetDatabase() blocked!');
        console.error('This tool is designed to WIPE the database. For safety, it only runs if:');
        console.error('1. NODE_ENV is "test" or CI=true');
        console.error('2. DATABASE_URL points to localhost or a known test branch');
        console.error('---');
        console.error('Current Environment:', process.env.NODE_ENV || 'development');
        console.error('CI detected:', process.env.CI || 'false');
        console.error('Database Host:', dbUrl ? new URL(dbUrl).hostname : 'unknown');
        throw new Error('Safety abort: Database reset is only allowed on the TEST database in TEST environment. Please check your DATABASE_URL.');
    }

    const tables = [
        'notifications',
        'activity_logs',
        'invitations',
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
