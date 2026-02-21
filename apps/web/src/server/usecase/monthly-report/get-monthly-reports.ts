import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import type { MonthlyReportRepository } from '@/server/domain/monthly-report/monthly-report-repository';

type MonthlyReportListItem = {
  id: string;
  startDate: Date;
  date: Date | null;
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
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  async execute(): Promise<MonthlyReportListItem[]> {
    const monthlyReports = await this.monthlyReportRepository.findAll();

    const monthlyReportIds = monthlyReports.map((r) => r.id);
    const dailyReports =
      await this.dailyReportRepository.findByMonthlyReportIds(
        monthlyReportIds,
      );

    const earliestDateByMonthlyReportId = new Map<string, Date>();
    for (const dr of dailyReports) {
      if (!dr.monthlyReportId) continue;
      const current = earliestDateByMonthlyReportId.get(dr.monthlyReportId);
      if (!current || dr.date < current) {
        earliestDateByMonthlyReportId.set(dr.monthlyReportId, dr.date);
      }
    }

    return monthlyReports.map((r) => ({
      id: r.id,
      startDate: r.startDate,
      date: earliestDateByMonthlyReportId.get(r.id) ?? null,
      projectProgress: r.projectProgress,
      growthChanges: r.growthChanges,
      purposeActionGap: r.purposeActionGap,
      improvements: r.improvements,
      notes: r.notes,
      createdAt: r.createdAt,
    }));
  }
}
