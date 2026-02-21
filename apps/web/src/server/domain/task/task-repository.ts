import type { Task } from '@/server/domain/task/task';

export type TaskUpdatableFields = Partial<
  Pick<
    Task,
    | 'title'
    | 'description'
    | 'status'
    | 'deadline'
    | 'estimatedMinutes'
    | 'dailyReportId'
    | 'projectId'
  >
>;

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
  update(id: string, fields: TaskUpdatableFields): Promise<void>;
  delete(id: string): Promise<void>;
}
