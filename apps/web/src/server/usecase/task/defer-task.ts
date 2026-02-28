import * as v from 'valibot';

import { NotFoundError, ValidationError } from '@/server/domain/error/domain-errors';
import { generateId } from '@/server/domain/id';
import { Task } from '@/server/domain/task/task';
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

    const newTask = Task.create({
      id: generateId(),
      dailyReportId: null,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      estimatedMinutes: task.estimatedMinutes,
      firstAction: task.firstAction,
      notes: task.notes,
      carriedOverFromId: task.id,
      createdAt: new Date(),
    });

    const deferred = task.update({
      status: 'deferred',
      incompletionReason: input.incompletionReason,
    });

    await this.taskRepository.update(deferred);
    await this.taskRepository.create(newTask);

    return newTask;
  }
}
