import type { Task } from '@/server/domain/task/task';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export class GetTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }
}
