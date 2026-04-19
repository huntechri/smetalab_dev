import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('ignores falsy values', () => {
    expect(cn('foo', false, null, undefined, '')).toBe('foo');
  });

  it('handles conditional classes via objects', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo');
  });

  it('handles conditional classes via arrays', () => {
    const condition = false;
    expect(cn(['foo', condition && 'bar'])).toBe('foo');
  });

  it('deduplicates conflicting Tailwind classes, keeping the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('merges text color conflicts correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('returns an empty string when given no arguments', () => {
    expect(cn()).toBe('');
  });
});
