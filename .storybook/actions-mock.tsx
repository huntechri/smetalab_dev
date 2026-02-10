const mockFn: any = () => ({});
mockFn.safe = () => ({});
mockFn.parsers = {};
mockFn.options = { parsers: {} };

export const db = {
    transaction: (cb: (tx: any) => Promise<any>) => cb({
        execute: async () => ({}),
        insert: () => ({ values: () => ({ returning: () => [{}] }) }),
        update: () => ({ set: () => ({ where: () => ({ returning: () => [{}] }) }) }),
        select: () => ({ from: () => ({ where: () => ({ limit: () => ({ offset: () => [] }) }) }) }),
    }),
    insert: () => ({ values: () => ({ returning: () => [{}] }) }),
    select: () => ({ from: () => ({ where: () => ({ limit: () => ({ offset: () => [] }) }) }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [{}] }) }) }),
    execute: async () => ({}),
};

export const validatedAction = (action: any) => action;
export const validatedActionWithUser = (action: any) => action;
export const safeAction = (action: any) => action;
export const success = (data: any) => ({ success: true, data });
export const error = (message: string) => ({ success: false, error: message });

export const createCounterparty = async () => ({ success: true, data: {} });
export const updateCounterparty = async () => ({ success: true, data: {} });
export const deleteCounterparty = async () => ({ success: true });
export const signIn = async () => ({ success: true });
export const signUp = async () => ({ success: true });

export default mockFn;

export const withTenantContext = async (tenantId: number, cb: () => Promise<any>) => {
  return cb();
};
