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
  if (!process.env.DATABASE_URL) {
    throw new Error('❌ SAFETY ERROR: DATABASE_URL is required for integration tests.');
  }

  if (
    !process.env.DATABASE_URL.includes('localhost') &&
    !process.env.DATABASE_URL.includes('test') &&
    !process.env.DATABASE_URL.includes('neon.tech')
  ) {
    throw new Error(
      '❌ SAFETY ERROR: Running tests against a non-local/non-test database!\n' +
        'Please set TEST_DATABASE_URL in .env.test or provide a local DATABASE_URL.',
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
