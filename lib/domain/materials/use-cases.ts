import { NewMaterial } from '@/lib/data/db/schema';
import { MaterialsService } from './materials.service';

export async function createMaterialUseCase(teamId: number, data: NewMaterial) {
  return MaterialsService.create(teamId, data);
}

export async function updateMaterialUseCase(teamId: number, id: string, data: Partial<NewMaterial>) {
  return MaterialsService.update(teamId, id, data);
}

export async function deleteMaterialUseCase(teamId: number, id: string) {
  return MaterialsService.delete(teamId, id);
}

export async function deleteAllMaterialsUseCase(teamId: number) {
  return MaterialsService.deleteAll(teamId);
}
