import * as v from 'valibot';

import { generateId } from '@/server/domain/id';
import { Project } from '@/server/domain/project/project';
import type { ProjectRepository } from '@/server/domain/project/project-repository';

export const CreateProjectInputSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  purpose: v.pipe(v.string(), v.minLength(1)),
  notes: v.optional(v.string()),
  deadline: v.optional(v.date()),
});

type CreateProjectInput = v.InferOutput<typeof CreateProjectInputSchema>;

export class CreateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    const project = Project.create({
      id: generateId(),
      name: input.name,
      purpose: input.purpose,
      notes: input.notes ?? null,
      deadline: input.deadline ?? null,
      createdAt: new Date(),
    });

    await this.projectRepository.create(project);

    return project;
  }
}
