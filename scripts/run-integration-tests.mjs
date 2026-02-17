#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import net from 'node:net';

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.log('Skipping integration tests: DATABASE_URL is not set.');
  process.exit(0);
}

const isReachable = await new Promise((resolve) => {
  try {
    const parsed = new URL(databaseUrl);
    const socket = net.createConnection({
      host: parsed.hostname,
      port: Number(parsed.port || 5432),
      timeout: 1500,
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
  } catch {
    resolve(false);
  }
});

if (!isReachable) {
  console.log('Skipping integration tests: DATABASE_URL is present but database host is unreachable.');
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
