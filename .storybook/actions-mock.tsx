export const createCounterparty = async () => ({ success: true, data: {} });
export const updateCounterparty = async () => ({ success: true, data: {} });
export const deleteCounterparty = async () => ({ success: true });
export const signIn = async () => ({ success: true });
export const signUp = async () => ({ success: true });
export const db = {
    transaction: (cb: (tx: unknown) => Promise<unknown>) => cb({}),
    insert: () => ({ values: () => ({ returning: () => [{}] }) }),
    select: () => ({ from: () => ({ where: () => ({ limit: () => ({ offset: () => [] }) }) }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [{}] }) }) }),
};
export const validatedAction = (action: unknown) => action;
export const validatedActionWithUser = (action: unknown) => action;
export const safeAction = (action: unknown) => action;
export const success = <T,>(data: T) => ({ success: true, data });
export const error = (message: string) => ({ success: false, error: message });

const pgMock: unknown = () => ({});
(pgMock as { safe: unknown }).safe = () => ({});
export default pgMock;
