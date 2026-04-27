"use client";

const ESTIMATE_ROWS_MUTATED_EVENT = "estimate:rows-mutated";
const ESTIMATE_PURCHASES_MUTATED_EVENT = "estimate:purchases-mutated";
const ESTIMATE_COEFFICIENT_UPDATED_EVENT = "estimate:coefficient-updated";

export type EstimateInvalidationDetail = {
  estimateId?: string;
};

const dispatchEstimateEvent = (eventName: string, detail: EstimateInvalidationDetail) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

export const notifyEstimateRowsMutated = (estimateId: string) => {
  dispatchEstimateEvent(ESTIMATE_ROWS_MUTATED_EVENT, { estimateId });
};

export const notifyEstimatePurchasesMutated = (estimateId?: string) => {
  dispatchEstimateEvent(ESTIMATE_PURCHASES_MUTATED_EVENT, { estimateId });
};

export const notifyEstimateCoefficientUpdated = (estimateId: string) => {
  dispatchEstimateEvent(ESTIMATE_COEFFICIENT_UPDATED_EVENT, { estimateId });
};

const addEstimateEventListener = (
  eventName: string,
  estimateId: string,
  callback: () => void,
  matchGlobalEvents = false,
) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<EstimateInvalidationDetail>;
    if (customEvent.detail?.estimateId) {
      if (customEvent.detail.estimateId !== estimateId) {
        return;
      }
    } else if (!matchGlobalEvents) {
      return;
    }

    callback();
  };

  window.addEventListener(eventName, handler);
  return () => window.removeEventListener(eventName, handler);
};

export const addEstimateRowsMutatedListener = (
  estimateId: string,
  callback: () => void,
) => addEstimateEventListener(ESTIMATE_ROWS_MUTATED_EVENT, estimateId, callback);

export const addEstimatePurchasesMutatedListener = (
  estimateId: string,
  callback: () => void,
) => addEstimateEventListener(ESTIMATE_PURCHASES_MUTATED_EVENT, estimateId, callback, true);

export const addEstimateCoefficientUpdatedListener = (
  estimateId: string,
  callback: () => void,
) => addEstimateEventListener(ESTIMATE_COEFFICIENT_UPDATED_EVENT, estimateId, callback);
