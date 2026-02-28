import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { ProjectRepository } from '@/server/domain/project/project-repository';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const UpdateTaskInputSchema = v.object({
  id: v.string(),
  title: v.optional(v.string()),
  description: v.optional(v.nullable(v.string())),
  deadline: v.optional(v.nullable(v.date())),
  estimatedMinutes: v.optional(v.nullable(v.number())),
  firstAction: v.optional(v.nullable(v.string())),
  projectId: v.optional(v.nullable(v.string())),
  incompletionReason: v.optional(v.nullable(v.string())),
  notes: v.optional(v.nullable(v.string())),
});

type UpdateTaskInput = v.InferOutput<typeof UpdateTaskInputSchema>;

export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(input: UpdateTaskInput): Promise<void> {
    const { id, ...fields } = input;

    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError('タスク', id);
    }

    if (fields.projectId) {
      const project = await this.projectRepository.findById(fields.projectId);

      if (!project) {
        throw new NotFoundError('プロジェクト', fields.projectId);
      }
    }

    const updated = task.update(fields);
    await this.taskRepository.update(updated);
  }
}
