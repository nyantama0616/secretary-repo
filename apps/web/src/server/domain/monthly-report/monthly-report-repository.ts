import type { MonthlyReport } from '@/server/domain/monthly-report/monthly-report';

export interface MonthlyReportRepository {
  findAll(): Promise<MonthlyReport[]>;
}
