import * as v from 'valibot';

import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { TaskStatus } from '@/server/domain/task/task';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const GetTaskDetailInputSchema = v.object({
  id: v.string(),
});

type GetTaskDetailInput = v.InferOutput<typeof GetTaskDetailInputSchema>;

type TaskDetail = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  deadline: Date | null;
  estimatedMinutes: number | null;
  incompletionReason: string | null;
  dailyReportDate: Date | null;
  createdAt: Date;
};

export class GetTaskDetailUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  async execute(input: GetTaskDetailInput): Promise<TaskDetail> {
    const task = await this.taskRepository.findById(input.id);

    if (!task) {
      throw new NotFoundError('タスク', input.id);
    }

    const dailyReportDate = await this.resolveDailyReportDate(
      task.dailyReportId,
    );

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline,
      estimatedMinutes: task.estimatedMinutes,
      incompletionReason: task.incompletionReason,
      dailyReportDate,
      createdAt: task.createdAt,
    };
  }

  private async resolveDailyReportDate(
    dailyReportId: string | null,
  ): Promise<Date | null> {
    if (!dailyReportId) return null;

    const dailyReport =
      await this.dailyReportRepository.findById(dailyReportId);
    return dailyReport?.date ?? null;
  }
}
