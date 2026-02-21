import type { Project } from '@/server/domain/project/project';

export interface ProjectRepository {
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  save(project: Project): Promise<void>;
}
