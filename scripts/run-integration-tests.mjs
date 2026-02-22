#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import net from 'node:net';

const TEST_MARKER_REGEX = /(test|ci|integration)/i;

const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();

if (!testDatabaseUrl) {
  console.error('TEST_DATABASE_URL is required for integration tests. Refusing to use DATABASE_URL fallback.');
  process.exit(1);
}

let parsedUrl;
try {
  parsedUrl = new URL(testDatabaseUrl);
} catch (error) {
  console.error('TEST_DATABASE_URL is malformed. Expected a valid URL string.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const dbName = parsedUrl.pathname.replace(/^\//, '') || 'unknown';
const markerSource = `${parsedUrl.hostname} ${dbName} ${parsedUrl.searchParams.get('options') ?? ''}`;
if (!TEST_MARKER_REGEX.test(markerSource)) {
  console.error(
    `TEST_DATABASE_URL does not look like a test database (host="${parsedUrl.hostname}", db="${dbName}").`,
  );
  process.exit(1);
}

const runIntegrationVitest = () => {
  const result = spawnSync('pnpm', ['vitest', 'run', '--config', 'vitest.integration.config.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
  });

  if (typeof result.status === 'number') {
    process.exit(result.status);
  }

  process.exit(1);
};

if (process.env.CI === 'true') {
  console.log(`CI=true detected: running integration tests against host=${parsedUrl.hostname} db=${dbName}.`);
  runIntegrationVitest();
}

const host = parsedUrl.hostname;
const port = Number(parsedUrl.port || 5432);

const delaysMs = [0, 300, 700];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkReachability = async () => {
  for (let attempt = 0; attempt < delaysMs.length; attempt += 1) {
    const delay = delaysMs[attempt];
    if (delay > 0) {
      await sleep(delay);
    }

    const reachable = await new Promise((resolve) => {
      const socket = net.createConnection({
        host,
        port,
        family: 4,
        timeout: 8000,
      });

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
    });

    if (reachable) {
      return true;
    }
  }

  return false;
};

const isReachable = await checkReachability();

if (!isReachable) {
  console.log(`Skipping integration tests: host=${host} db=${dbName} is unreachable (IPv4 retries exhausted).`);
  process.exit(0);
}
runIntegrationVitest();
