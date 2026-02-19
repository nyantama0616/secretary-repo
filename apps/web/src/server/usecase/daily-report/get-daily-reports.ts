import type { DailyReport } from '@/server/domain/daily-report/daily-report';
import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';

export class GetDailyReportsUseCase {
  constructor(
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  async execute(): Promise<DailyReport[]> {
    return this.dailyReportRepository.findAll();
  }
}
