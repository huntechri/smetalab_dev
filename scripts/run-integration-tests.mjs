#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import net from 'node:net';

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.log('Skipping integration tests: DATABASE_URL is not set.');
  process.exit(0);
}

let parsedUrl;
try {
  parsedUrl = new URL(databaseUrl);
} catch (error) {
  console.error('Invalid DATABASE_URL. Expected a valid URL string.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
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
  console.log('Skipping integration tests: DATABASE_URL is present but database host is unreachable (IPv4 retries exhausted).');
  process.exit(0);
}

const result = spawnSync('pnpm', ['vitest', 'run', '--config', 'vitest.integration.config.ts'], {
  stdio: 'inherit',
  env: process.env,
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
