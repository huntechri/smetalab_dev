import { NewWork } from '@/lib/data/db/schema';
import { WorksService } from './works.service';

export async function createWorkUseCase(teamId: number, data: NewWork) {
  return WorksService.create(teamId, data);
}

export async function updateWorkUseCase(teamId: number, id: string, data: Partial<NewWork>) {
  return WorksService.update(teamId, id, data);
}

export async function deleteWorkUseCase(teamId: number, id: string) {
  return WorksService.delete(teamId, id);
}

export async function deleteAllWorksUseCase(teamId: number) {
  return WorksService.deleteAll(teamId);
}

export async function insertWorkAfterUseCase(teamId: number, afterId: string | null, data: NewWork) {
  return WorksService.insertAfter(teamId, afterId, data);
}
