import type { WeeklyReportRepository } from '@/server/domain/weekly-report/weekly-report-repository';

type WeeklyReportListItem = {
  id: string;
  startDate: Date;
  goal: string | null;
  summary: string | null;
  review: string | null;
  notes: string | null;
  createdAt: Date;
};

export class GetWeeklyReportsUseCase {
  constructor(
    private readonly weeklyReportRepository: WeeklyReportRepository,
  ) {}

  async execute(): Promise<WeeklyReportListItem[]> {
    const weeklyReports = await this.weeklyReportRepository.findAll();

    return weeklyReports.map((r) => ({
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
