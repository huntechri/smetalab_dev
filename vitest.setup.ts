/// <reference types="@testing-library/jest-dom" />
import { config } from 'dotenv';
import path from 'path';
import { expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Polyfills for browser APIs not available in jsdom (required by Radix UI)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  root = null;
  rootMargin = '';
  thresholds = [0];
}

global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

// Force load .env.test if present, then .env as fallback
config({ path: path.resolve(process.cwd(), '.env.test') });
config();

expect.extend(matchers);

const isIntegrationRun = process.env.VITEST_INTEGRATION === 'true';

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}


// Keep unit/UI/API/performance runs deterministic without requiring real DB/email env
if (!isIntegrationRun && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgres://postgres:postgres@127.0.0.1:5432/smetalab_test';
}

if (!process.env.RESEND_API_KEY) {
  process.env.RESEND_API_KEY = 'test-resend-key';
}
if (isIntegrationRun) {
  // Integration tests must never run against production-like DB
  const integrationDbUrl = process.env.DATABASE_URL;
  if (!integrationDbUrl) {
    throw new Error('❌ SAFETY ERROR: DATABASE_URL is required for integration tests.');
  }

  let host = '';
  let database = '';

  try {
    const parsed = new URL(integrationDbUrl);
    host = parsed.hostname.toLowerCase();
    database = parsed.pathname.replace(/^\//, '').toLowerCase();
  } catch {
    throw new Error('❌ SAFETY ERROR: DATABASE_URL is malformed for integration tests.');
  }

  const isLocalHost = host === 'localhost' || host === '127.0.0.1';
  const hasTestDatabaseName = database.includes('test') || database.endsWith('_ci');
  const hasExplicitTestMarker = integrationDbUrl.toLowerCase().includes('test');
  const hasDedicatedTestUrl = Boolean(process.env.TEST_DATABASE_URL);

  if (!(hasDedicatedTestUrl || hasTestDatabaseName || (isLocalHost && hasExplicitTestMarker))) {
    throw new Error(
      '❌ SAFETY ERROR: Integration tests can run only with TEST_DATABASE_URL or explicit test DB naming.\n' +
        `Received host="${host}", db="${database}".`,
    );
  }
}


(process.env as Record<string, string | undefined>).NODE_ENV = 'test';

// Глобальный мок для next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
  headers: vi.fn(async () => ({
    get: vi.fn(),
  })),
}));

// Глобальный мок для next/server (after)
vi.mock('next/server', () => ({
  after: vi.fn((cb) => cb()),
}));
