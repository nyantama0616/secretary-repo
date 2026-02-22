import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const ReorderTasksInputSchema = v.object({
  taskIds: v.pipe(v.array(v.string()), v.minLength(1)),
});

type ReorderTasksInput = v.InferOutput<typeof ReorderTasksInputSchema>;

export class ReorderTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: ReorderTasksInput): Promise<void> {
    for (const id of input.taskIds) {
      const task = await this.taskRepository.findById(id);

      if (!task) {
        throw new NotFoundError('タスク', id);
      }
    }

    for (let i = 0; i < input.taskIds.length; i++) {
      await this.taskRepository.update(input.taskIds[i], { sortOrder: i });
    }
  }
}
