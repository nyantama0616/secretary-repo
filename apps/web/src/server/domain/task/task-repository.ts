import type { Task, TaskStatus } from '@/server/domain/task/task';

export type TaskFilters = {
  dailyReportId?: string;
  statuses?: TaskStatus[];
};

export interface TaskRepository {
  findAll(filters?: TaskFilters): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(task: Task): Promise<void>;
  update(task: Task): Promise<void>;
  updateMany(tasks: Task[]): Promise<void>;
  delete(id: string): Promise<void>;
}
