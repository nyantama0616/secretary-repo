import * as v from 'valibot';

import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const AssignDailyReportInputSchema = v.object({
  id: v.string(),
  dailyReportId: v.nullable(v.string()),
});

type AssignDailyReportInput = v.InferOutput<typeof AssignDailyReportInputSchema>;

export class AssignDailyReportUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  async execute(input: AssignDailyReportInput): Promise<void> {
    const task = await this.taskRepository.findById(input.id);

    if (!task) {
      throw new NotFoundError('タスク', input.id);
    }

    if (input.dailyReportId) {
      const dailyReport = await this.dailyReportRepository.findById(
        input.dailyReportId,
      );

      if (!dailyReport) {
        throw new NotFoundError('日報', input.dailyReportId);
      }
    }

    await this.taskRepository.update(input.id, {
      dailyReportId: input.dailyReportId,
    });
  }
}
