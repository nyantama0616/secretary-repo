import { type SQL, and, desc, eq, inArray } from 'drizzle-orm';

import { Task } from '@/server/domain/task/task';
import type {
  TaskFilters,
  TaskRepository,
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

    const query = db
      .select()
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tasks.createdAt));

    const rows = filters?.limit
      ? await query.limit(filters.limit)
      : await query;
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Task | null> {
    const results = await this.findByIds([id]);
    return results[0] ?? null;
  }

  async findByIds(ids: string[]): Promise<Task[]> {
    const rows = await db
      .select()
      .from(tasks)
      .where(inArray(tasks.id, ids));
    return rows.map(toDomain);
  }

  async create(task: Task): Promise<void> {
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
      firstAction: task.firstAction,
      notes: task.notes,
    });
  }

  async update(task: Task): Promise<void> {
    await db
      .update(tasks)
      .set({
        dailyReportId: task.dailyReportId,
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        status: task.status,
        sortOrder: task.sortOrder,
        deadline: task.deadline,
        estimatedMinutes: task.estimatedMinutes,
        incompletionReason: task.incompletionReason,
        firstAction: task.firstAction,
        notes: task.notes,
      })
      .where(eq(tasks.id, task.id));
  }

  async updateMany(taskList: Task[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (const task of taskList) {
        await tx
          .update(tasks)
          .set({
            dailyReportId: task.dailyReportId,
            projectId: task.projectId,
            title: task.title,
            description: task.description,
            status: task.status,
            sortOrder: task.sortOrder,
            deadline: task.deadline,
            estimatedMinutes: task.estimatedMinutes,
            incompletionReason: task.incompletionReason,
            firstAction: task.firstAction,
            notes: task.notes,
          })
          .where(eq(tasks.id, task.id));
      }
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }
}

const toDomain = (row: typeof tasks.$inferSelect): Task => {
  return Task.reconstruct({
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
    firstAction: row.firstAction,
    notes: row.notes,
    carriedOverFromId: row.carriedOverFromId,
    createdAt: row.createdAt,
  });
};
