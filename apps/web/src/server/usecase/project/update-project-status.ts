import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import { ProjectStatusSchema } from '@/server/domain/project/project';
import type { ProjectRepository } from '@/server/domain/project/project-repository';

export const UpdateProjectStatusInputSchema = v.object({
  id: v.string(),
  status: ProjectStatusSchema,
});

type UpdateProjectStatusInput = v.InferOutput<
  typeof UpdateProjectStatusInputSchema
>;

export class UpdateProjectStatusUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: UpdateProjectStatusInput): Promise<void> {
    const project = await this.projectRepository.findById(input.id);
    if (!project) {
      throw new NotFoundError('プロジェクト', input.id);
    }

    const updated = project.update({ status: input.status });
    await this.projectRepository.update(updated);
  }
}
