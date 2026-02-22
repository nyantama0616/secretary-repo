import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import { generateId } from '@/server/domain/id';
import type { ProjectRepository } from '@/server/domain/project/project-repository';
import { type Task, createTask } from '@/server/domain/task/task';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const CreateTaskInputSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1)),
  description: v.optional(v.nullable(v.string())),
  deadline: v.optional(v.nullable(v.date())),
  estimatedMinutes: v.optional(v.nullable(v.number())),
  projectId: v.optional(v.nullable(v.string())),
});

type CreateTaskInput = v.InferOutput<typeof CreateTaskInputSchema>;

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    if (input.projectId) {
      const project = await this.projectRepository.findById(input.projectId);

      if (!project) {
        throw new NotFoundError('プロジェクト', input.projectId);
      }
    }

    const task = createTask({
      id: generateId(),
      dailyReportId: null,
      projectId: input.projectId ?? null,
      title: input.title,
      description: input.description ?? null,
      status: 'not_started',
      sortOrder: 0,
      deadline: input.deadline ?? null,
      estimatedMinutes: input.estimatedMinutes ?? null,
      incompletionReason: null,
      carriedOverFromId: null,
      createdAt: new Date(),
    });

    await this.taskRepository.save(task);

    return task;
  }
}
