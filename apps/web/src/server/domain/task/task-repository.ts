import type { Task, TaskStatus } from '@/server/domain/task/task';

export type TaskFilters = {
  dailyReportId?: string;
  statuses?: TaskStatus[];
};

export type TaskUpdatableFields = Partial<
  Pick<
    Task,
    | 'title'
    | 'description'
    | 'status'
    | 'sortOrder'
    | 'deadline'
    | 'estimatedMinutes'
    | 'dailyReportId'
    | 'projectId'
    | 'incompletionReason'
    | 'firstAction'
    | 'notes'
  >
>;

export interface TaskRepository {
  findAll(filters?: TaskFilters): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
  update(id: string, fields: TaskUpdatableFields): Promise<void>;
  updateMany(
    items: { id: string; fields: TaskUpdatableFields }[],
  ): Promise<void>;
  delete(id: string): Promise<void>;
}
