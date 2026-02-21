import * as v from 'valibot';

import { generateId } from '@/server/domain/id';
import {
  type Project,
  createProject,
} from '@/server/domain/project/project';
import type { ProjectRepository } from '@/server/domain/project/project-repository';

export const CreateProjectInputSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  purpose: v.pipe(v.string(), v.minLength(1)),
  deadline: v.optional(v.date()),
});

type CreateProjectInput = v.InferOutput<typeof CreateProjectInputSchema>;

export class CreateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    const project = createProject({
      id: generateId(),
      name: input.name,
      purpose: input.purpose,
      status: 'active',
      deadline: input.deadline ?? null,
      createdAt: new Date(),
    });

    await this.projectRepository.save(project);

    return project;
  }
}
