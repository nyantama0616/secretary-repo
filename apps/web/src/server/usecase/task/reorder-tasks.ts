import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { Task } from '@/server/domain/task/task';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const ReorderTasksInputSchema = v.object({
  taskIds: v.pipe(v.array(v.string()), v.minLength(1)),
});

type ReorderTasksInput = v.InferOutput<typeof ReorderTasksInputSchema>;

export class ReorderTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: ReorderTasksInput): Promise<void> {
    const updatedTasks: Task[] = [];

    for (const [i, id] of input.taskIds.entries()) {
      const task = await this.taskRepository.findById(id);

      if (!task) {
        throw new NotFoundError('タスク', id);
      }

      updatedTasks.push(task.update({ sortOrder: i }));
    }

    await this.taskRepository.updateMany(updatedTasks);
  }
}
