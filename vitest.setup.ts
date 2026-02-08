/// <reference types="@testing-library/jest-dom" />
import { config } from 'dotenv';
import path from 'path';

// Polyfills for browser APIs not available in jsdom (required by Radix UI)
class ResizeObserverMock {
  observe() { }
  unobserve() { }
  disconnect() { }
}

class IntersectionObserverMock {
  observe() { }
  unobserve() { }
  disconnect() { }
  root = null;
  rootMargin = '';
  thresholds = [0];
}

global.ResizeObserver = ResizeObserverMock as any;
global.IntersectionObserver = IntersectionObserverMock as any;

// Force load .env.test if not already loaded by Vitest
config({ path: path.resolve(process.cwd(), '.env.test') });
config(); // Load .env as fallback (though usually not needed if .env.test covers everything)
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

import { vi } from 'vitest';

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
} else if (process.env.VITEST) {
  // 🛡️ CRITICAL: Fail if no dedicated test database is provided
  if (!process.env.DATABASE_URL?.includes('localhost') && !process.env.DATABASE_URL?.includes('test')) {
    throw new Error(
      '❌ SAFETY ERROR: Running tests against a non-local/non-test database!\n' +
      'Please set TEST_DATABASE_URL in .env.test or provide a local DATABASE_URL.'
    );
  }
  (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
}

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


