import type { Project } from '@/server/domain/project/project';

export type ProjectUpdatableFields = Partial<
  Pick<Project, 'name' | 'purpose' | 'deadline'>
>;

export interface ProjectRepository {
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  save(project: Project): Promise<void>;
  update(id: string, fields: ProjectUpdatableFields): Promise<void>;
}
