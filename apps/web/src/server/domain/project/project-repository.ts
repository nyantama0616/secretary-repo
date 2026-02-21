import type { Project } from '@/server/domain/project/project';

export interface ProjectRepository {
  findAll(): Promise<Project[]>;
}
