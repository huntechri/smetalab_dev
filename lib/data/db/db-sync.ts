import { spawn } from 'node:child_process';

export type DbSyncOptions = {
  skipGenerate: boolean;
  allowProduction: boolean;
};

export function resolveDbSyncOptions(argv: string[]): DbSyncOptions {
  return {
    skipGenerate: argv.includes('--skip-generate'),
    allowProduction: argv.includes('--allow-production'),
  };
}

export function buildDbSyncCommands(options: DbSyncOptions): string[][] {
  const commands: string[][] = [];

  if (!options.skipGenerate) {
    commands.push(['pnpm', 'db:generate']);
  }

  commands.push(['pnpm', 'db:migrate']);

  return commands;
}

export async function runDbSync(options: DbSyncOptions): Promise<void> {
  assertDbSyncSafety(options, process.env.DATABASE_URL, process.env.TEST_DATABASE_URL);

  const commands = buildDbSyncCommands(options);

  for (const [command, ...args] of commands) {
    await runCommand(command, args);
  }
}

export function assertDbSyncSafety(
  options: DbSyncOptions,
  databaseUrl: string | undefined,
  testDatabaseUrl: string | undefined,
): void {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined.');
  }

  if (options.allowProduction) {
    return;
  }

  const normalizedDatabaseUrl = databaseUrl.trim();
  const normalizedTestDatabaseUrl = testDatabaseUrl?.trim();

  const isLocalDatabase = /(localhost|127\.0\.0\.1)/i.test(normalizedDatabaseUrl);
  const isExplicitTestDb = /(test|staging|preview|dev)/i.test(normalizedDatabaseUrl);
  const matchesTestDatabase = normalizedTestDatabaseUrl === normalizedDatabaseUrl;

  if (isLocalDatabase || isExplicitTestDb || matchesTestDatabase) {
    return;
  }

  throw new Error(
    'Safety abort: db:sync is blocked for non-test DATABASE_URL. This command is for local/test sync only. Production schema updates must go through committed migrations via `pnpm release` (or `pnpm db:migrate -- --allow-production` when intentional).',
  );
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
    });
  });
}
