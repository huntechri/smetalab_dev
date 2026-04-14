import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or TEST_DATABASE_URL environment variable is not set');
}

export default {
  schema: './lib/data/db/schema.ts',
  out: './lib/data/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
    ssl:
      databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false },
  },
} satisfies Config;
