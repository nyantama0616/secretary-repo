import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const UpdateTaskInputSchema = v.object({
  id: v.string(),
  title: v.optional(v.string()),
  description: v.optional(v.nullable(v.string())),
  deadline: v.optional(v.nullable(v.date())),
  estimatedMinutes: v.optional(v.nullable(v.number())),
});

type UpdateTaskInput = v.InferOutput<typeof UpdateTaskInputSchema>;

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskInput): Promise<void> {
    const { id, ...fields } = input;

    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError('タスク', id);
    }

    await this.taskRepository.update(id, fields);
  }
}
