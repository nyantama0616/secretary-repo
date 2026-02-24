import type { Project, ProjectStatus } from '@/server/domain/project/project';

export type ProjectUpdatableFields = Partial<
  Pick<Project, 'name' | 'purpose' | 'notes' | 'deadline'>
>;

export interface ProjectRepository {
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  save(project: Project): Promise<void>;
  update(id: string, fields: ProjectUpdatableFields): Promise<void>;
  updateStatus(id: string, status: ProjectStatus): Promise<void>;
}
