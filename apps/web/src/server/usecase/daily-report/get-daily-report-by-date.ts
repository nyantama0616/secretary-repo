import * as v from 'valibot';

import type { DailyReport } from '@/server/domain/daily-report/daily-report';
import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { NotFoundError } from '@/server/domain/error/domain-errors';

export const GetDailyReportByDateInputSchema = v.object({
  date: v.date(),
});

type GetDailyReportByDateInput = v.InferOutput<
  typeof GetDailyReportByDateInputSchema
>;

export class GetDailyReportByDateUseCase {
  constructor(
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  async execute(input: GetDailyReportByDateInput): Promise<DailyReport> {
    const dailyReport = await this.dailyReportRepository.findByDate(input.date);

    if (!dailyReport) {
      throw new NotFoundError('日報', input.date.toISOString());
    }

    return dailyReport;
  }
}
