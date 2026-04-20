import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSlug, generateUniqueSlug } from '../slug';

describe('generateSlug', () => {
  it('converts a simple English string to a slug', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('trims leading and trailing whitespace', () => {
    expect(generateSlug('  hello  ')).toBe('hello');
  });

  it('collapses multiple spaces into a single dash', () => {
    expect(generateSlug('hello   world')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(generateSlug('hello@world!')).toBe('helloworld');
  });

  it('collapses multiple dashes into one', () => {
    expect(generateSlug('hello--world')).toBe('hello-world');
  });

  it('removes leading and trailing dashes', () => {
    expect(generateSlug('-hello world-')).toBe('hello-world');
  });

  it('truncates to 80 characters', () => {
    const long = 'a'.repeat(100);
    expect(generateSlug(long)).toHaveLength(80);
  });

  it('transliterates Cyrillic characters', () => {
    expect(generateSlug('привет мир')).toBe('privet-mir');
  });

  it('handles mixed Cyrillic and Latin text', () => {
    expect(generateSlug('hello мир')).toBe('hello-mir');
  });

  it('transliterates ж as zh', () => {
    expect(generateSlug('жук')).toBe('zhuk');
  });

  it('transliterates ш as sh', () => {
    expect(generateSlug('шар')).toBe('shar');
  });

  it('transliterates щ as shch', () => {
    expect(generateSlug('щи')).toBe('shchi');
  });

  it('transliterates ч as ch', () => {
    expect(generateSlug('чай')).toBe('chay');
  });

  it('transliterates ё as yo', () => {
    expect(generateSlug('ёж')).toBe('yozh');
  });

  it('transliterates ю as yu', () => {
    expect(generateSlug('юг')).toBe('yug');
  });

  it('transliterates я as ya', () => {
    expect(generateSlug('яма')).toBe('yama');
  });

  it('drops soft and hard signs (ь, ъ)', () => {
    expect(generateSlug('объект')).toBe('obekt');
    expect(generateSlug('день')).toBe('den');
  });

  it('returns an empty string for an empty input', () => {
    expect(generateSlug('')).toBe('');
  });

  it('handles numbers', () => {
    expect(generateSlug('section 1')).toBe('section-1');
  });
});

describe('generateUniqueSlug', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a string that starts with the base slug', () => {
    const slug = generateUniqueSlug('Hello World');
    expect(slug).toMatch(/^hello-world-/);
  });

  it('appends a dash-separated suffix', () => {
    const slug = generateUniqueSlug('my section');
    expect(slug).toMatch(/^my-section-[a-z0-9]+$/);
  });

  it('produces deterministic output for the same timestamp', () => {
    const first = generateUniqueSlug('test');
    const second = generateUniqueSlug('test');
    expect(first).toBe(second);
  });

  it('produces different slugs for different timestamps', () => {
    const first = generateUniqueSlug('test');
    vi.setSystemTime(new Date('2024-06-01T00:00:00.000Z'));
    const second = generateUniqueSlug('test');
    expect(first).not.toBe(second);
  });

  it('handles Cyrillic input for the base', () => {
    const slug = generateUniqueSlug('привет');
    expect(slug).toMatch(/^privet-[a-z0-9]+$/);
  });
});
