import * as v from 'valibot';

import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { TaskStatusSchema, type TaskStatus } from '@/server/domain/task/task';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const GetTasksInputSchema = v.optional(
  v.object({
    dailyReportId: v.optional(v.string()),
    statuses: v.optional(v.array(TaskStatusSchema)),
  }),
);

type GetTasksInput = v.InferOutput<typeof GetTasksInputSchema>;

type TaskListItem = {
  id: string;
  title: string;
  status: TaskStatus;
  dailyReportDate: Date | null;
};

export class GetTasksUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  async execute(input?: GetTasksInput): Promise<TaskListItem[]> {
    const tasks = await this.taskRepository.findAll({
      dailyReportId: input?.dailyReportId,
      statuses: input?.statuses,
    });

    const dailyReportIds = [
      ...new Set(
        tasks.map((t) => t.dailyReportId).filter((id) => id !== null),
      ),
    ];
    const dailyReports =
      await this.dailyReportRepository.findByIds(dailyReportIds);
    const dateById = new Map(dailyReports.map((r) => [r.id, r.date]));

    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      dailyReportDate: t.dailyReportId
        ? (dateById.get(t.dailyReportId) ?? null)
        : null,
    }));
  }
}
