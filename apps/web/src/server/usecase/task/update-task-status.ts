import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import { TaskStatusSchema } from '@/server/domain/task/task';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const UpdateTaskStatusInputSchema = v.object({
  id: v.string(),
  status: TaskStatusSchema,
  incompletionReason: v.optional(v.nullable(v.string())),
});

type UpdateTaskStatusInput = v.InferOutput<typeof UpdateTaskStatusInputSchema>;

export class UpdateTaskStatusUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskStatusInput): Promise<void> {
    const task = await this.taskRepository.findById(input.id);

    if (!task) {
      throw new NotFoundError('タスク', input.id);
    }

    await this.taskRepository.update(input.id, {
      status: input.status,
      incompletionReason: input.incompletionReason,
    });
  }
}
