import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import { generateId } from '@/server/domain/id';
import { deferTask } from '@/server/domain/task/defer-task';
import type { Task } from '@/server/domain/task/task';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const DeferTaskInputSchema = v.object({
  id: v.string(),
  incompletionReason: v.optional(v.nullable(v.string())),
});

type DeferTaskInput = v.InferOutput<typeof DeferTaskInputSchema>;

export class DeferTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: DeferTaskInput): Promise<Task> {
    const task = await this.taskRepository.findById(input.id);

    if (!task) {
      throw new NotFoundError('タスク', input.id);
    }

    const { deferred, newTask } = deferTask(task, {
      id: generateId(),
      createdAt: new Date(),
      incompletionReason: input.incompletionReason,
    });

    await this.taskRepository.update(deferred);
    await this.taskRepository.create(newTask);

    return newTask;
  }
}
