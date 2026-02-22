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

  parseDatabaseUrl(rawUrl);
  return rawUrl;
}

export function isExplicitCleanupAllowed(): boolean {
  return process.env.ALLOW_TEST_DB_CLEANUP === 'true';
}

export function getSanitizedDatabaseTarget(rawUrl: string): { host: string; database: string } {
  const parsed = parseDatabaseUrl(rawUrl);
  return {
    host: parsed.hostname,
    database: parsed.pathname.replace(/^\//, '') || 'unknown',
  };
}

export function getCleanupHeuristicMatched(rawUrl: string): boolean {
  return hasSafeTestMarker(parseDatabaseUrl(rawUrl));
}

export function assertSafeTestCleanupConnection(actualDbUrl: string | undefined): string {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      `Destructive cleanup blocked: NODE_ENV must be "test" (received "${process.env.NODE_ENV ?? 'undefined'}").`,
    );
  }

  const testDbUrl = getRequiredTestDatabaseUrl();

  if (!isExplicitCleanupAllowed()) {
    throw new Error(
      'Destructive cleanup blocked: ALLOW_TEST_DB_CLEANUP must be set to "true" for integration database cleanup.',
    );
  }

  if (!actualDbUrl?.trim()) {
    throw new Error('Destructive cleanup blocked: DATABASE_URL is missing for active integration DB client connection.');
  }

  const normalizedActual = normalizeUrlForComparison(actualDbUrl);
  const normalizedExpected = normalizeUrlForComparison(testDbUrl);

  if (normalizedActual !== normalizedExpected) {
    throw new Error('Destructive cleanup blocked: integration DB client is not using TEST_DATABASE_URL.');
  }

  return testDbUrl;
}
