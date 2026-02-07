/// <reference types="@testing-library/jest-dom" />
import { config } from 'dotenv';
config();
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

import { vi } from 'vitest';

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
} else if (process.env.VITEST) {
  // If running in Vitest but no test URL, we should probably fail rather than risk production
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


