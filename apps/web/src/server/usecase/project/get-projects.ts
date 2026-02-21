import type { ProjectStatus } from '@/server/domain/project/project';
import type { ProjectRepository } from '@/server/domain/project/project-repository';

type ProjectListItem = {
  id: string;
  name: string;
  purpose: string;
  status: ProjectStatus;
  deadline: Date | null;
  createdAt: Date;
};

export class GetProjectsUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(): Promise<ProjectListItem[]> {
    const projects = await this.projectRepository.findAll();

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      purpose: p.purpose,
      status: p.status,
      deadline: p.deadline,
      createdAt: p.createdAt,
    }));
  }
}
