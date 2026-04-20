const NUMERIC_DOTTED_CODE_REGEX = /^\d+(?:\.\d+)*$/;
const NON_NUMERIC_SORT_KEY = '~';
const SEGMENT_WIDTH = 10;

export function buildWorkCodeSortKey(code: string): string {
  const normalizedCode = code.trim();

  if (!NUMERIC_DOTTED_CODE_REGEX.test(normalizedCode)) {
    return NON_NUMERIC_SORT_KEY;
  }

  return normalizedCode
    .split('.')
    .map((segment) => segment.padStart(SEGMENT_WIDTH, '0'))
    .join('.');
}
