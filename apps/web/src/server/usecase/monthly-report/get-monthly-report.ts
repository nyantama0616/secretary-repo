import * as v from 'valibot';

import { nextMonthStart } from '@/server/domain/date';
import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { MonthlyReportRepository } from '@/server/domain/monthly-report/monthly-report-repository';
import type { WeeklyReportRepository } from '@/server/domain/weekly-report/weekly-report-repository';

export const GetMonthlyReportInputSchema = v.object({
  id: v.string(),
});

type GetMonthlyReportInput = v.InferOutput<typeof GetMonthlyReportInputSchema>;

type MonthlyReportDetail = {
  id: string;
  startDate: Date;
  goal: string | null;
  summary: string | null;
  review: string | null;
  notes: string | null;
  createdAt: Date;
  weeklyReports: {
    id: string;
    startDate: Date;
    goal: string | null;
  }[];
};

export class GetMonthlyReportUseCase {
  constructor(
    private readonly monthlyReportRepository: MonthlyReportRepository,
    private readonly weeklyReportRepository: WeeklyReportRepository,
  ) {}

  async execute(input: GetMonthlyReportInput): Promise<MonthlyReportDetail> {
    const monthlyReport = await this.monthlyReportRepository.findById(
      input.id,
    );

    if (!monthlyReport) {
      throw new NotFoundError('月報', input.id);
    }

    const weeklyReports =
      await this.weeklyReportRepository.findByDateRange(
        monthlyReport.startDate,
        nextMonthStart(monthlyReport.startDate),
      );

    return {
      id: monthlyReport.id,
      startDate: monthlyReport.startDate,
      goal: monthlyReport.goal,
      summary: monthlyReport.summary,
      review: monthlyReport.review,
      notes: monthlyReport.notes,
      createdAt: monthlyReport.createdAt,
      weeklyReports: weeklyReports.map((wr) => ({
        id: wr.id,
        startDate: wr.startDate,
        goal: wr.goal,
      })),
    };
  }
}
