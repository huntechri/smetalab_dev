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
      options.cursor?.lastSortOrder,
      options.cursor?.lastId,
      options.categoryLv1,
      options.categoryLv2,
      options.categoryLv3,
      options.categoryLv4
    );
  }

  static getCategories(teamId: number) {
    return MaterialsService.getCategories(teamId);
  }

  static getCategoryTree(teamId: number) {
    return MaterialsService.getCategoryTree(teamId);
  }

  static search(
    teamId: number, 
    query: string, 
    categoryLv1?: string,
    categoryLv2?: string,
    categoryLv3?: string,
    categoryLv4?: string
  ) {
    return MaterialsService.search(teamId, query, categoryLv1, categoryLv2, categoryLv3, categoryLv4);
  }

  static generateMissingEmbeddings(teamId: number) {
    return MaterialsService.generateMissingEmbeddings(teamId);
  }
}
