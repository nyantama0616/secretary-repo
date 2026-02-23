import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { TaskStatus } from '@/server/domain/task/task';
import type { TaskRepository } from '@/server/domain/task/task-repository';

// NOTE: deferred は defer-task 操作でのみ設定されるため、手動でのステータス変更からは除外する
const MANUAL_STATUSES = [
  'not_started',
  'in_progress',
  'done',
  'cancelled',
] as const satisfies readonly TaskStatus[];

const ManualTaskStatusSchema = v.picklist([...MANUAL_STATUSES]);

export const UpdateTaskStatusInputSchema = v.object({
  id: v.string(),
  status: ManualTaskStatusSchema,
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
