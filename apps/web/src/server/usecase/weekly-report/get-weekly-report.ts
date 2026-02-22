import * as v from 'valibot';

import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { WeeklyReportRepository } from '@/server/domain/weekly-report/weekly-report-repository';

export const GetWeeklyReportInputSchema = v.object({
  id: v.string(),
});

type GetWeeklyReportInput = v.InferOutput<typeof GetWeeklyReportInputSchema>;

type WeeklyReportDetail = {
  id: string;
  startDate: Date;
  goal: string | null;
  summary: string | null;
  review: string | null;
  notes: string | null;
  createdAt: Date;
  dailyReports: {
    id: string;
    date: Date;
    summary: string | null;
  }[];
};

export class GetWeeklyReportUseCase {
  constructor(
    private readonly weeklyReportRepository: WeeklyReportRepository,
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  async execute(input: GetWeeklyReportInput): Promise<WeeklyReportDetail> {
    const weeklyReport = await this.weeklyReportRepository.findById(input.id);

    if (!weeklyReport) {
      throw new NotFoundError('週報', input.id);
    }

    const nextMonday = new Date(weeklyReport.startDate);
    nextMonday.setDate(nextMonday.getDate() + 7);

    const dailyReports = await this.dailyReportRepository.findByDateRange(
      weeklyReport.startDate,
      nextMonday,
    );

    return {
      id: weeklyReport.id,
      startDate: weeklyReport.startDate,
      goal: weeklyReport.goal,
      summary: weeklyReport.summary,
      review: weeklyReport.review,
      notes: weeklyReport.notes,
      createdAt: weeklyReport.createdAt,
      dailyReports: dailyReports.map((dr) => ({
        id: dr.id,
        date: dr.date,
        summary: dr.summary,
      })),
    };
  }
}
