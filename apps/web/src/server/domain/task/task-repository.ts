import type { Task } from '@/server/domain/task/task';

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
}
