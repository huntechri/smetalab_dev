/// <reference types="@testing-library/jest-dom" />
import { config } from 'dotenv';
import path from 'path';
import { expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import {
  getCleanupHeuristicMatched,
  getRequiredTestDatabaseUrl,
  getSanitizedDatabaseTarget,
  isExplicitCleanupAllowed,
} from '@/lib/testing/assert-test-db';

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

if (typeof window !== 'undefined' && typeof window.HTMLElement !== 'undefined' && !window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}

// Force load .env.test if present, then .env as fallback
config({ path: path.resolve(process.cwd(), '.env.test'), quiet: true });
config({ quiet: true });

expect.extend(matchers);

const isIntegrationRun = process.env.VITEST_INTEGRATION === 'true';

// Keep unit/UI/API/performance runs deterministic without requiring real DB/email env
if (!isIntegrationRun && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgres://postgres:postgres@127.0.0.1:5432/smetalab_test';
}

if (!process.env.RESEND_API_KEY) {
  process.env.RESEND_API_KEY = 'test-resend-key';
}
if (isIntegrationRun) {
  // Safety-critical: integration tests are pinned to TEST_DATABASE_URL only.
  const integrationDbUrl = getRequiredTestDatabaseUrl();
  process.env.DATABASE_URL = integrationDbUrl;

  const target = getSanitizedDatabaseTarget(integrationDbUrl);
  const heuristicMatched = getCleanupHeuristicMatched(integrationDbUrl);
  const cleanupAllowed = isExplicitCleanupAllowed();
  console.info(
    `Integration DB target: host=${target.host} db=${target.database} cleanupAllowed=${cleanupAllowed} heuristicMatched=${heuristicMatched}`,
  );

  if (!heuristicMatched && cleanupAllowed) {
    console.warn(
      `Integration DB heuristic is inconclusive for host=${target.host} db=${target.database}; allowing cleanup because ALLOW_TEST_DB_CLEANUP=true.`,
    );
  }

  if (!cleanupAllowed) {
    throw new Error(
      'ALLOW_TEST_DB_CLEANUP="true" is required for integration tests that run destructive cleanup (TRUNCATE/RESET).',
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

// Глобальный мок для breadcrumb-provider
vi.mock('@/components/providers/breadcrumb-provider', () => ({
  useBreadcrumbs: vi.fn(() => ({
    breadcrumbs: [],
    setBreadcrumbs: vi.fn(),
  })),
}));
