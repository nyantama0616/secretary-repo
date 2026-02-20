import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const DeleteTaskInputSchema = v.object({
  id: v.string(),
});

type DeleteTaskInput = v.InferOutput<typeof DeleteTaskInputSchema>;

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: DeleteTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(input.id);

    if (!task) {
      throw new NotFoundError('タスク', input.id);
    }

    await this.taskRepository.delete(input.id);
  }
}
