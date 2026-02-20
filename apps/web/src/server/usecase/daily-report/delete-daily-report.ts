import * as v from 'valibot';

import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { NotFoundError } from '@/server/domain/error/domain-errors';

export const DeleteDailyReportInputSchema = v.object({
  id: v.string(),
});

type DeleteDailyReportInput = v.InferOutput<typeof DeleteDailyReportInputSchema>;

export class DeleteDailyReportUseCase {
  constructor(
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  async execute(input: DeleteDailyReportInput): Promise<void> {
    const dailyReport = await this.dailyReportRepository.findById(input.id);

    if (!dailyReport) {
      throw new NotFoundError('日報', input.id);
    }

    await this.dailyReportRepository.delete(input.id);
  }
}
