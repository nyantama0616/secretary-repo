import { eq } from 'drizzle-orm';

import type { Task } from '@/server/domain/task/task';
import { createTask } from '@/server/domain/task/task';
import type { TaskRepository } from '@/server/domain/task/task-repository';
import { db } from '@/server/infrastructure/db/client';
import { tasks } from '@/server/infrastructure/db/schema/tasks';

export class DrizzleTaskRepository implements TaskRepository {
  async findAll(): Promise<Task[]> {
    const rows = await db.select().from(tasks);
    return rows.map(toTask);
  }

  async findById(id: string): Promise<Task | null> {
    const [row] = await db.select().from(tasks).where(eq(tasks.id, id));
    return row ? toTask(row) : null;
  }
}

const toTask = (row: typeof tasks.$inferSelect): Task => {
  return createTask({
    id: row.id,
    dailyReportId: row.dailyReportId,
    title: row.title,
    description: row.description,
    status: row.status,
    sortOrder: row.sortOrder,
    deadline: row.deadline,
    estimatedMinutes: row.estimatedMinutes,
    incompletionReason: row.incompletionReason,
    createdAt: row.createdAt,
  });
};
