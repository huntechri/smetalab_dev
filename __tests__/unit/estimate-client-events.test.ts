import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  addEstimateCoefficientUpdatedListener,
  addEstimatePurchasesMutatedListener,
  addEstimateRowsMutatedListener,
  notifyEstimateCoefficientUpdated,
  notifyEstimatePurchasesMutated,
  notifyEstimateRowsMutated,
} from '@/features/projects/estimates/lib/estimate-client-events';

const estimateId = 'estimate-a';
const otherEstimateId = 'estimate-b';

describe('estimate client events', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('notifies rows listeners only for the matching estimate', () => {
    const callback = vi.fn();
    const unsubscribe = addEstimateRowsMutatedListener(estimateId, callback);

    notifyEstimateRowsMutated(otherEstimateId);
    expect(callback).not.toHaveBeenCalled();

    notifyEstimateRowsMutated(estimateId);
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    notifyEstimateRowsMutated(estimateId);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('notifies coefficient listeners only for the matching estimate', () => {
    const callback = vi.fn();
    const unsubscribe = addEstimateCoefficientUpdatedListener(estimateId, callback);

    notifyEstimateCoefficientUpdated(otherEstimateId);
    expect(callback).not.toHaveBeenCalled();

    notifyEstimateCoefficientUpdated(estimateId);
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    notifyEstimateCoefficientUpdated(estimateId);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('allows global purchase invalidation events without an estimate id', () => {
    const callback = vi.fn();
    const unsubscribe = addEstimatePurchasesMutatedListener(estimateId, callback);

    notifyEstimatePurchasesMutated();
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    notifyEstimatePurchasesMutated();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('ignores purchase invalidation events for another estimate', () => {
    const callback = vi.fn();
    const unsubscribe = addEstimatePurchasesMutatedListener(estimateId, callback);

    notifyEstimatePurchasesMutated(otherEstimateId);
    expect(callback).not.toHaveBeenCalled();

    notifyEstimatePurchasesMutated(estimateId);
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
  });
});
