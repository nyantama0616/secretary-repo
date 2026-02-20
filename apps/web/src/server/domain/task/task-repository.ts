import type { Task } from '@/server/domain/task/task';

export interface TaskRepository {
  findAll(): Promise<Task[]>;
}
