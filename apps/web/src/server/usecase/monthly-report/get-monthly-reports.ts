import type { MonthlyReportRepository } from '@/server/domain/monthly-report/monthly-report-repository';

type MonthlyReportListItem = {
  id: string;
  startDate: Date;
  goal: string | null;
  summary: string | null;
  review: string | null;
  notes: string | null;
  createdAt: Date;
};

export class GetMonthlyReportsUseCase {
  constructor(
    private readonly monthlyReportRepository: MonthlyReportRepository,
  ) {}

  async execute(): Promise<MonthlyReportListItem[]> {
    const monthlyReports = await this.monthlyReportRepository.findAll();

    return monthlyReports.map((r) => ({
      id: r.id,
      startDate: r.startDate,
      goal: r.goal,
      summary: r.summary,
      review: r.review,
      notes: r.notes,
      createdAt: r.createdAt,
    }));
  }
}
