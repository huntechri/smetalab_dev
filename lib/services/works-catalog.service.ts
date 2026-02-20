import { NewWork } from '@/lib/data/db/schema';
import { WorksService } from '@/lib/domain/works/works.service';
import {
  createWorkUseCase,
  deleteAllWorksUseCase,
  deleteWorkUseCase,
  insertWorkAfterUseCase,
  updateWorkUseCase,
} from '@/lib/domain/works/use-cases';

export class WorksCatalogService {
  static create(teamId: number, data: NewWork) {
    return createWorkUseCase(teamId, data);
  }

  static update(teamId: number, id: string, data: Partial<NewWork>) {
    return updateWorkUseCase(teamId, id, data);
  }

  static delete(teamId: number, id: string) {
    return deleteWorkUseCase(teamId, id);
  }

  static deleteAll(teamId: number) {
    return deleteAllWorksUseCase(teamId);
  }

  static insertAfter(teamId: number, afterId: string | null, data: NewWork) {
    return insertWorkAfterUseCase(teamId, afterId, data);
  }

  static fetchMore(
    teamId: number,
    options: { query?: string; lastSortOrder?: number; limit?: number; category?: string } = {}
  ) {
    return WorksService.getMany(teamId, options.limit, options.query, options.lastSortOrder, options.category);
  }

  static search(teamId: number, query: string) {
    return WorksService.search(teamId, query);
  }

  static reorder(teamId: number) {
    return WorksService.reorder(teamId);
  }

  static getUniqueUnits(teamId: number) {
    return WorksService.getUniqueUnits(teamId);
  }
}
