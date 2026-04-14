import { NewWork } from '@/lib/data/db/schema';
import { WorksService } from '@/lib/domain/works/works.service';

export class WorksCatalogService {
  static create(teamId: number, data: NewWork) {
    return WorksService.create(teamId, data);
  }

  static update(teamId: number, id: string, data: Partial<NewWork>) {
    return WorksService.update(teamId, id, data);
  }

  static delete(teamId: number, id: string) {
    return WorksService.delete(teamId, id);
  }

  static deleteAll(teamId: number) {
    return WorksService.deleteAll(teamId);
  }

  static insertAfter(teamId: number, afterId: string | null, data: NewWork) {
    return WorksService.insertAfter(teamId, afterId, data);
  }

  static fetchMore(
    teamId: number,
    options: { query?: string; lastSortOrder?: number; limit?: number; category?: string; phase?: string } = {}
  ) {
    return WorksService.getMany(teamId, options.limit, options.query, options.lastSortOrder, options.category, options.phase);
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

  static getPhases(teamId: number) {
    return WorksService.getPhases(teamId);
  }

  static getCategories(teamId: number) {
    return WorksService.getCategories(teamId);
  }
}
