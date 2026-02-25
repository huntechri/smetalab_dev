import { NewMaterial } from '@/lib/data/db/schema';
import { FetchMoreMaterialsInput } from '@/lib/domain/materials/materials.contract';
import { MaterialsService } from '@/lib/domain/materials/materials.service';
import {
  createMaterialUseCase,
  deleteAllMaterialsUseCase,
  deleteMaterialUseCase,
  updateMaterialUseCase,
} from '@/lib/domain/materials/use-cases';

export class MaterialsCatalogService {
  static create(teamId: number, data: NewMaterial) {
    return createMaterialUseCase(teamId, data);
  }

  static update(teamId: number, id: string, data: Partial<NewMaterial>) {
    return updateMaterialUseCase(teamId, id, data);
  }

  static delete(teamId: number, id: string) {
    return deleteMaterialUseCase(teamId, id);
  }

  static deleteAll(teamId: number) {
    return deleteAllMaterialsUseCase(teamId);
  }

  static fetchMore(teamId: number, options: FetchMoreMaterialsInput = {}) {
    return MaterialsService.getMany(
      teamId,
      options.limit,
      options.query,
      options.offset,
      options.cursor?.lastCode,
      options.cursor?.lastId
    );
  }

  static search(teamId: number, query: string) {
    return MaterialsService.search(teamId, query);
  }

  static generateMissingEmbeddings(teamId: number) {
    return MaterialsService.generateMissingEmbeddings(teamId);
  }
}
