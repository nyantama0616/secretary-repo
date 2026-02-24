import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { ProjectStatus } from '@/server/domain/project/project';
import type { ProjectRepository } from '@/server/domain/project/project-repository';

export const GetProjectInputSchema = v.object({
  id: v.string(),
});

type GetProjectInput = v.InferOutput<typeof GetProjectInputSchema>;

type ProjectDetail = {
  id: string;
  name: string;
  purpose: string;
  notes: string | null;
  status: ProjectStatus;
  deadline: Date | null;
  createdAt: Date;
};

export class GetProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: GetProjectInput): Promise<ProjectDetail> {
    const project = await this.projectRepository.findById(input.id);

    if (!project) {
      throw new NotFoundError('プロジェクト', input.id);
    }

    return {
      id: project.id,
      name: project.name,
      purpose: project.purpose,
      notes: project.notes,
      status: project.status,
      deadline: project.deadline,
      createdAt: project.createdAt,
    };
  }
}
