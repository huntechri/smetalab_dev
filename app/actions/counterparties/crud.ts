'use server';

import { db } from '@/lib/db/drizzle';
import { counterparties, activityLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { safeAction } from '@/lib/actions/safe-action';
import { success, error, Result } from '@/lib/utils/result';
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

export const createCounterparty = safeAction<CounterpartyRow, [z.infer<typeof counterpartySchema>]>(
    async ({ team, user }, data) => {
        const validatedData = counterpartySchema.parse(data);

        try {
            const created = await db.transaction(async (tx) => {
                const [newRow] = await tx
                    .insert(counterparties)
                    .values({
                        ...validatedData,
                        tenantId: team.id,
                    })
                    .returning();

                await tx.insert(activityLogs).values({
                    teamId: team.id,
                    userId: user.id,
                    action: `Created counterparty: ${newRow.name}`,
                });

                return newRow;
            });

            revalidatePath('/app/guide/counterparties');
            return success(created as CounterpartyRow);
        } catch (e: any) {
            // DrizzleQueryError wraps PostgresError in 'cause'
            const pgCode = e.code || e.cause?.code;
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
        console.log(`[updateCounterparty] Starting update for ID: ${id}`, data);

        const validatedData = counterpartySchema.parse(data);

        const updated = await db.transaction(async (tx) => {
            const [updatedRow] = await tx
                .update(counterparties)
                .set({
                    ...validatedData,
                    updatedAt: new Date(),
                })
                .where(eq(counterparties.id, id))
                .returning();

            if (!updatedRow) {
                throw new Error(`Counterparty not found or update denied: ${id}`);
            }

            await tx.insert(activityLogs).values({
                teamId: team.id,
                userId: user.id,
                action: `Updated counterparty: ${updatedRow.name} (ID: ${id})`,
            });

            return updatedRow;
        });

        console.log(`[updateCounterparty] Successfully updated counterparty: ${updated.id}`);
        revalidatePath('/app/guide/counterparties');
        return success(updated as CounterpartyRow);
    },
    { name: 'updateCounterparty' }
);

export const deleteCounterparty = safeAction<boolean, [string]>(
    async ({ team, user }, id) => {
        await db.transaction(async (tx) => {
            await tx
                .update(counterparties)
                .set({ deletedAt: new Date() })
                .where(eq(counterparties.id, id));

            await tx.insert(activityLogs).values({
                teamId: team.id,
                userId: user.id,
                action: `Deleted counterparty (soft-delete) with ID: ${id}`,
            });
        });

        revalidatePath('/app/guide/counterparties');
        return success(true);
    },
    { name: 'deleteCounterparty' }
);
