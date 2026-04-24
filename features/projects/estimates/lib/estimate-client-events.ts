"use client";

const ESTIMATE_ROWS_MUTATED_EVENT = "estimate:rows-mutated";
const ESTIMATE_PURCHASES_MUTATED_EVENT = "estimate:purchases-mutated";

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

export const addEstimateRowsMutatedListener = (
  estimateId: string,
  callback: () => void,
) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<EstimateInvalidationDetail>;
    if (customEvent.detail?.estimateId !== estimateId) {
      return;
    }

    callback();
  };

  window.addEventListener(ESTIMATE_ROWS_MUTATED_EVENT, handler);
  return () => window.removeEventListener(ESTIMATE_ROWS_MUTATED_EVENT, handler);
};

export const addEstimatePurchasesMutatedListener = (
  estimateId: string,
  callback: () => void,
) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<EstimateInvalidationDetail>;
    if (customEvent.detail?.estimateId && customEvent.detail.estimateId !== estimateId) {
      return;
    }

    callback();
  };

  window.addEventListener(ESTIMATE_PURCHASES_MUTATED_EVENT, handler);
  return () => window.removeEventListener(ESTIMATE_PURCHASES_MUTATED_EVENT, handler);
};
