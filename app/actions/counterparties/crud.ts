'use server';

import {
    createCounterpartyUseCase,
    deleteCounterpartyUseCase,
    updateCounterpartyUseCase,
} from '@/lib/domain/counterparties/use-cases';
import { getCounterparties } from '@/lib/data/db/queries';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { safeAction } from '@/lib/actions/safe-action';
import { success, error } from '@/lib/utils/result';
import { CounterpartyRow } from '@/types/counterparty-row';

const counterpartySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['customer', 'contractor', 'supplier']),
    legalStatus: z.enum(['individual', 'company']),

    // Individual
    birthDate: z.string().optional().nullable().or(z.literal('')),
    passportSeriesNumber: z.string().optional().nullable().or(z.literal('')),
    passportIssuedBy: z.string().optional().nullable().or(z.literal('')),
    passportIssuedDate: z.string().optional().nullable().or(z.literal('')),
    departmentCode: z.string().optional().nullable().or(z.literal('')),

    // Company
    ogrn: z.string().optional().nullable().or(z.literal('')),
    inn: z.string().optional().nullable().or(z.literal('')),
    kpp: z.string().optional().nullable().or(z.literal('')),

    // Contact
    address: z.string().optional().nullable().or(z.literal('')),
    phone: z.string().optional().nullable().or(z.literal('')),
    email: z.string().email().optional().or(z.literal('')).nullable(),

    // Bank
    bankName: z.string().optional().nullable().or(z.literal('')),
    bankAccount: z.string().optional().nullable().or(z.literal('')),
    corrAccount: z.string().optional().nullable().or(z.literal('')),
    bankInn: z.string().optional().nullable().or(z.literal('')),
    bankKpp: z.string().optional().nullable().or(z.literal('')),
});

const counterpartiesPageSchema = z.object({
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
});

type PgErrorLike = {
    code?: string;
    cause?: {
        code?: string;
    };
};

function extractPgCode(errorInput: unknown): string | undefined {
    if (typeof errorInput !== 'object' || errorInput === null) {
        return undefined;
    }

    const candidate = errorInput as PgErrorLike;
    return candidate.code ?? candidate.cause?.code;
}

export const createCounterparty = safeAction<CounterpartyRow, [z.infer<typeof counterpartySchema>]>(
    async ({ team, user }, data) => {
        const validatedData = counterpartySchema.parse(data);

        try {
            const created = await createCounterpartyUseCase(team.id, user.id, validatedData);

            revalidatePath('/app/guide/counterparties');
            return success(created as CounterpartyRow);
        } catch (e: unknown) {
            // DrizzleQueryError wraps PostgresError in 'cause'
            const pgCode = extractPgCode(e);
            if (pgCode === '23505') {
                return error('Контрагент с такими ИНН/КПП уже существует в вашей организации', 'DUPLICATE_RECORD');
            }
            throw e;
        }
    },
    { name: 'createCounterparty' }
);

export const updateCounterparty = safeAction<CounterpartyRow, [{ id: string; data: z.infer<typeof counterpartySchema> }]>(
    async ({ team, user }, { id, data }) => {
        const validatedData = counterpartySchema.parse(data);
        const updated = await updateCounterpartyUseCase(team.id, user.id, id, validatedData);
        revalidatePath('/app/guide/counterparties');
        return success(updated as CounterpartyRow);
    },
    { name: 'updateCounterparty' }
);

export const deleteCounterparty = safeAction<CounterpartyRow, [string]>(
    async ({ team, user }, id) => {
        const deleted = await deleteCounterpartyUseCase(team.id, user.id, id);

        revalidatePath('/app/guide/counterparties');
        return success(deleted as CounterpartyRow);
    },
    { name: 'deleteCounterparty' }
);

export const fetchCounterpartiesPage = safeAction<
    { data: CounterpartyRow[]; count: number },
    [z.infer<typeof counterpartiesPageSchema>?]
>(
    async ({ team }, payload = {}) => {
        const { limit = 50, offset = 0 } = counterpartiesPageSchema.parse(payload ?? {});
        const page = await getCounterparties(team.id, { limit, offset });
        return success({ data: page.data, count: page.count });
    },
    { name: 'fetchCounterpartiesPage' }
);
