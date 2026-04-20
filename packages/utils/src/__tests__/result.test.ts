import { describe, it, expect } from 'vitest';
import { success, error } from '../result';

describe('success', () => {
  it('returns a result with success: true', () => {
    const result = success({ id: 1 });
    expect(result.success).toBe(true);
  });

  it('includes the provided data', () => {
    const data = { id: 42, name: 'test' };
    const result = success(data);
    if (!result.success) throw new Error('expected success');
    expect(result.data).toEqual(data);
  });

  it('includes an optional message', () => {
    const result = success('value', 'Created successfully');
    expect(result.message).toBe('Created successfully');
  });

  it('works with primitive data types', () => {
    const num = success(123);
    if (!num.success) throw new Error('expected success');
    expect(num.data).toBe(123);

    const bool = success(true);
    if (!bool.success) throw new Error('expected success');
    expect(bool.data).toBe(true);
  });

  it('works with null data', () => {
    const result = success(null);
    if (!result.success) throw new Error('expected success');
    expect(result.data).toBeNull();
  });

  it('omits message when not provided', () => {
    const result = success('value');
    expect(result.message).toBeUndefined();
  });
});

describe('error', () => {
  it('returns a result with success: false', () => {
    const result = error('Something went wrong');
    expect(result.success).toBe(false);
  });

  it('includes the error message', () => {
    const result = error('Something went wrong');
    if (result.success) throw new Error('expected error');
    expect(result.error.message).toBe('Something went wrong');
  });

  it('includes an optional error code', () => {
    const result = error('Not found', 'NOT_FOUND');
    if (result.success) throw new Error('expected error');
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('includes optional details', () => {
    const details = { field: 'email', reason: 'invalid format' };
    const result = error('Validation failed', 'VALIDATION_ERROR', details);
    if (result.success) throw new Error('expected error');
    expect(result.error.details).toEqual(details);
  });

  it('omits code and details when not provided', () => {
    const result = error('Oops');
    if (result.success) throw new Error('expected error');
    expect(result.error.code).toBeUndefined();
    expect(result.error.details).toBeUndefined();
  });

  it('sets the top-level message to the error message', () => {
    const result = error('Something went wrong');
    expect(result.message).toBe('Something went wrong');
  });
});
