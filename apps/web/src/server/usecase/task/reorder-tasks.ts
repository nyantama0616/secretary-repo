import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import { reorderTasks } from '@/server/domain/task/reorder-tasks';
import type { Task } from '@/server/domain/task/task';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const ReorderTasksInputSchema = v.object({
  taskIds: v.pipe(v.array(v.string()), v.minLength(1)),
});

type ReorderTasksInput = v.InferOutput<typeof ReorderTasksInputSchema>;

export class ReorderTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: ReorderTasksInput): Promise<void> {
    const tasks: Task[] = [];

    for (const id of input.taskIds) {
      const task = await this.taskRepository.findById(id);

      if (!task) {
        throw new NotFoundError('タスク', id);
      }

      tasks.push(task);
    }

    const reordered = reorderTasks(tasks);
    await this.taskRepository.updateMany(reordered);
  }
}
