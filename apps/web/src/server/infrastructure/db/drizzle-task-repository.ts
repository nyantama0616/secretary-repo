import { type SQL, and, asc, eq, inArray } from 'drizzle-orm';

import type { Task } from '@/server/domain/task/task';
import { createTask } from '@/server/domain/task/task';
import type {
  TaskFilters,
  TaskRepository,
  TaskUpdatableFields,
} from '@/server/domain/task/task-repository';
import { db } from '@/server/infrastructure/db/client';
import { tasks } from '@/server/infrastructure/db/schema/tasks';

export class DrizzleTaskRepository implements TaskRepository {
  async findAll(filters?: TaskFilters): Promise<Task[]> {
    const conditions: SQL[] = [];

    if (filters?.dailyReportId) {
      conditions.push(eq(tasks.dailyReportId, filters.dailyReportId));
    }

    if (filters?.statuses && filters.statuses.length > 0) {
      conditions.push(inArray(tasks.status, filters.statuses));
    }

    const rows = await db
      .select()
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(tasks.sortOrder));
    return rows.map(toTask);
  }

  async findById(id: string): Promise<Task | null> {
    const [row] = await db.select().from(tasks).where(eq(tasks.id, id));
    return row ? toTask(row) : null;
  }

  async save(task: Task): Promise<void> {
    await db.insert(tasks).values({
      id: task.id,
      dailyReportId: task.dailyReportId,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      sortOrder: task.sortOrder,
      deadline: task.deadline,
      estimatedMinutes: task.estimatedMinutes,
      incompletionReason: task.incompletionReason,
    });
  }

  async update(id: string, fields: TaskUpdatableFields): Promise<void> {
    await db.update(tasks).set(fields).where(eq(tasks.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }
}

const toTask = (row: typeof tasks.$inferSelect): Task => {
  return createTask({
    id: row.id,
    dailyReportId: row.dailyReportId,
    projectId: row.projectId,
    title: row.title,
    description: row.description,
    status: row.status,
    sortOrder: row.sortOrder,
    deadline: row.deadline,
    estimatedMinutes: row.estimatedMinutes,
    incompletionReason: row.incompletionReason,
    carriedOverFromId: row.carriedOverFromId,
    createdAt: row.createdAt,
  });
};
