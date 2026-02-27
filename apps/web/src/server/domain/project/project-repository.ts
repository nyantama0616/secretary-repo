import type { Project } from '@/server/domain/project/project';

export interface ProjectRepository {
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  create(project: Project): Promise<void>;
  update(project: Project): Promise<void>;
}
