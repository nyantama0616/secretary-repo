import { generateId } from '@/server/domain/id';
import {
  type MonthlyReport,
  createMonthlyReport,
} from '@/server/domain/monthly-report/monthly-report';
import type { MonthlyReportRepository } from '@/server/domain/monthly-report/monthly-report-repository';

export class CreateMonthlyReportUseCase {
  constructor(
    private readonly monthlyReportRepository: MonthlyReportRepository,
  ) {}

  async execute(): Promise<MonthlyReport> {
    const monthlyReport = createMonthlyReport({
      id: generateId(),
      projectProgress: null,
      growthChanges: null,
      purposeActionGap: null,
      improvements: null,
      notes: null,
      createdAt: new Date(),
    });

    await this.monthlyReportRepository.save(monthlyReport);

    return monthlyReport;
  }
}
