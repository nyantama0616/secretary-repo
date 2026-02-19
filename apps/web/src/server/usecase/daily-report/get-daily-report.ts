import * as v from 'valibot';

import type { DailyReport } from '@/server/domain/daily-report/daily-report';
import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { NotFoundError } from '@/server/domain/error/domain-errors';

export const GetDailyReportInputSchema = v.object({
  id: v.string(),
});

type GetDailyReportInput = v.InferOutput<typeof GetDailyReportInputSchema>;

export class GetDailyReportUseCase {
  constructor(
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  async execute(input: GetDailyReportInput): Promise<DailyReport> {
    const dailyReport = await this.dailyReportRepository.findById(input.id);

    if (!dailyReport) {
      throw new NotFoundError('DailyReport', input.id);
    }

    return dailyReport;
  }
}
