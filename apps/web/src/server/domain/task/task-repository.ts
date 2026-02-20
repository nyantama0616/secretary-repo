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
  >
>;

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  update(id: string, fields: TaskUpdatableFields): Promise<void>;
}
