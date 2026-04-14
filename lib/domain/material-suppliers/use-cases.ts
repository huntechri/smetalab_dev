import {
  createMaterialSupplierRecord,
  deleteMaterialSupplierRecord,
  updateMaterialSupplierRecord,
} from '@/lib/data/material-suppliers/repository';

interface MaterialSupplierPayload {
  [key: string]: string | null | undefined;
  name: string;
  color: string;
  legalStatus: 'individual' | 'company';
}

export async function createMaterialSupplierUseCase(teamId: number, userId: number, data: MaterialSupplierPayload) {
  return createMaterialSupplierRecord(teamId, userId, data);
}

export async function updateMaterialSupplierUseCase(teamId: number, userId: number, id: string, data: MaterialSupplierPayload) {
  return updateMaterialSupplierRecord(teamId, userId, id, data);
}

export async function deleteMaterialSupplierUseCase(teamId: number, userId: number, id: string) {
  return deleteMaterialSupplierRecord(teamId, userId, id);
}
