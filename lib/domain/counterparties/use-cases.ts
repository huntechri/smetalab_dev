import {
  createCounterpartyRecord,
  deleteCounterpartyRecord,
  updateCounterpartyRecord,
} from '@/lib/data/counterparties/repository';

interface CounterpartyPayload {
  [key: string]: string | null | undefined;
  name: string;
  type: 'customer' | 'contractor' | 'supplier';
  legalStatus: 'individual' | 'company';
}

export async function createCounterpartyUseCase(teamId: number, userId: number, data: CounterpartyPayload) {
  return createCounterpartyRecord(teamId, userId, data);
}

export async function updateCounterpartyUseCase(teamId: number, userId: number, id: string, data: CounterpartyPayload) {
  return updateCounterpartyRecord(teamId, userId, id, data);
}

export async function deleteCounterpartyUseCase(teamId: number, userId: number, id: string) {
  return deleteCounterpartyRecord(teamId, userId, id);
}
