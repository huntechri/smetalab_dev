import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl =
  process.env.DATABASE_URL || 'postgres://dummy:dummy@localhost:5432/dummy';

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
