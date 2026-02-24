import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { ProjectRepository } from '@/server/domain/project/project-repository';

export const UpdateProjectInputSchema = v.object({
  id: v.string(),
  name: v.optional(v.pipe(v.string(), v.minLength(1))),
  purpose: v.optional(v.pipe(v.string(), v.minLength(1))),
  notes: v.optional(v.nullable(v.string())),
  deadline: v.optional(v.nullable(v.date())),
});

type UpdateProjectInput = v.InferOutput<typeof UpdateProjectInputSchema>;

export class UpdateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: UpdateProjectInput): Promise<void> {
    const { id, ...fields } = input;

    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundError('プロジェクト', id);
    }

    await this.projectRepository.update(id, fields);
  }
}
