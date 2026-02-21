import type { MonthlyReportRepository } from '@/server/domain/monthly-report/monthly-report-repository';

type MonthlyReportListItem = {
  id: string;
  startDate: Date;
  summary: string | null;
  projectProgress: string | null;
  growthChanges: string | null;
  purposeActionGap: string | null;
  improvements: string | null;
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
      summary: r.summary,
      projectProgress: r.projectProgress,
      growthChanges: r.growthChanges,
      purposeActionGap: r.purposeActionGap,
      improvements: r.improvements,
      notes: r.notes,
      createdAt: r.createdAt,
    }));
  }
}
