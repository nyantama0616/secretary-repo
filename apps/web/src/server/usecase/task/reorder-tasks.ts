import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import { reorderTasks } from '@/server/domain/task/reorder-tasks';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const ReorderTasksInputSchema = v.object({
  taskIds: v.pipe(v.array(v.string()), v.minLength(1)),
});

type ReorderTasksInput = v.InferOutput<typeof ReorderTasksInputSchema>;

export class ReorderTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: ReorderTasksInput): Promise<void> {
    const tasks = await this.taskRepository.findByIds(input.taskIds);
    const taskMap = new Map(tasks.map((t) => [t.id, t]));

    // NOTE: findByIds の返却順は保証されないため、入力の順序に合わせる
    const ordered = input.taskIds.map((id) => {
      const task = taskMap.get(id);
      if (!task) {
        throw new NotFoundError('タスク', id);
      }
      return task;
    });

    const reordered = reorderTasks(ordered);
    await this.taskRepository.updateMany(reordered);
  }
}
