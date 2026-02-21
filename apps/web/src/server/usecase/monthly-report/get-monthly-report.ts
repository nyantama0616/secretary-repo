import * as v from 'valibot';

import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { MonthlyReportRepository } from '@/server/domain/monthly-report/monthly-report-repository';

export const GetMonthlyReportInputSchema = v.object({
  id: v.string(),
});

type GetMonthlyReportInput = v.InferOutput<typeof GetMonthlyReportInputSchema>;

type MonthlyReportDetail = {
  id: string;
  startDate: Date;
  projectProgress: string | null;
  growthChanges: string | null;
  purposeActionGap: string | null;
  improvements: string | null;
  notes: string | null;
  createdAt: Date;
  dailyReports: {
    id: string;
    date: Date;
    summary: string | null;
  }[];
};

export class GetMonthlyReportUseCase {
  constructor(
    private readonly monthlyReportRepository: MonthlyReportRepository,
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  async execute(input: GetMonthlyReportInput): Promise<MonthlyReportDetail> {
    const monthlyReport = await this.monthlyReportRepository.findById(
      input.id,
    );

    if (!monthlyReport) {
      throw new NotFoundError('月報', input.id);
    }

    const dailyReports =
      await this.dailyReportRepository.findByMonthlyReportIds([input.id]);

    return {
      id: monthlyReport.id,
      startDate: monthlyReport.startDate,
      projectProgress: monthlyReport.projectProgress,
      growthChanges: monthlyReport.growthChanges,
      purposeActionGap: monthlyReport.purposeActionGap,
      improvements: monthlyReport.improvements,
      notes: monthlyReport.notes,
      createdAt: monthlyReport.createdAt,
      dailyReports: dailyReports.map((dr) => ({
        id: dr.id,
        date: dr.date,
        summary: dr.summary,
      })),
    };
  }
}
