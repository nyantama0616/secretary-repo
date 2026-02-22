import * as v from 'valibot';

import { NotFoundError, ValidationError } from '@/server/domain/error/domain-errors';
import { generateId } from '@/server/domain/id';
import { type Task, createTask } from '@/server/domain/task/task';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const DeferTaskInputSchema = v.object({
  id: v.string(),
  incompletionReason: v.optional(v.nullable(v.string())),
});

type DeferTaskInput = v.InferOutput<typeof DeferTaskInputSchema>;

const DEFERRABLE_STATUSES = new Set(['not_started', 'in_progress']);

export class DeferTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: DeferTaskInput): Promise<Task> {
    const task = await this.taskRepository.findById(input.id);

    if (!task) {
      throw new NotFoundError('タスク', input.id);
    }

    if (!DEFERRABLE_STATUSES.has(task.status)) {
      throw new ValidationError(
        `ステータスが「${task.status}」のタスクは延期できません`,
      );
    }

    const newTask = createTask({
      id: generateId(),
      dailyReportId: null,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: 'not_started',
      sortOrder: 0,
      deadline: task.deadline,
      estimatedMinutes: task.estimatedMinutes,
      incompletionReason: null,
      carriedOverFromId: task.id,
      createdAt: new Date(),
    });

    await this.taskRepository.save(newTask);
    await this.taskRepository.update(input.id, {
      status: 'deferred',
      incompletionReason: input.incompletionReason,
    });

    return newTask;
  }
}
