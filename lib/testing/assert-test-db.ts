const TEST_DB_MARKERS = ['test', 'ci', 'integration'] as const;

function parseDatabaseUrl(rawUrl: string): URL {
  try {
    return new URL(rawUrl);
  } catch {
    throw new Error('TEST_DATABASE_URL is malformed. Expected a valid postgres URL.');
  }
}

function normalizeUrlForComparison(rawUrl: string): string {
  const parsed = parseDatabaseUrl(rawUrl.trim());
  parsed.hash = '';
  return parsed.toString();
}

function hasSafeTestMarker(parsed: URL): boolean {
  const host = parsed.hostname.toLowerCase();
  const database = parsed.pathname.replace(/^\//, '').toLowerCase();
  const branch = parsed.searchParams.get('options')?.toLowerCase() ?? '';
  const combined = `${host} ${database} ${branch}`;

  return TEST_DB_MARKERS.some((marker) => combined.includes(marker));
}

export function getRequiredTestDatabaseUrl(): string {
  const rawUrl = process.env.TEST_DATABASE_URL?.trim();
  if (!rawUrl) {
    throw new Error(
      'TEST_DATABASE_URL is required for integration tests. Refusing to use DATABASE_URL/POSTGRES_URL fallbacks.',
    );
  }

  const parsed = parseDatabaseUrl(rawUrl);
  if (!hasSafeTestMarker(parsed)) {
    throw new Error(
      `TEST_DATABASE_URL does not look like a dedicated test database (host="${parsed.hostname}", db="${parsed.pathname.replace(/^\//, '') || 'unknown'}").`,
    );
  }

  return rawUrl;
}

export function getSanitizedDatabaseTarget(rawUrl: string): { host: string; database: string } {
  const parsed = parseDatabaseUrl(rawUrl);
  return {
    host: parsed.hostname,
    database: parsed.pathname.replace(/^\//, '') || 'unknown',
  };
}

export function assertSafeTestCleanupConnection(actualDbUrl: string | undefined): string {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Destructive test DB cleanup is only allowed when NODE_ENV is "test".');
  }

  const testDbUrl = getRequiredTestDatabaseUrl();

  if (!actualDbUrl?.trim()) {
    throw new Error('Destructive test DB cleanup requires an active DATABASE_URL connection.');
  }

  const normalizedActual = normalizeUrlForComparison(actualDbUrl);
  const normalizedExpected = normalizeUrlForComparison(testDbUrl);

  if (normalizedActual !== normalizedExpected) {
    throw new Error('Destructive cleanup blocked: active DB connection does not match TEST_DATABASE_URL.');
  }

  return testDbUrl;
}
