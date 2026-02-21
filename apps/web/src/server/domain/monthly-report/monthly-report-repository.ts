import type { MonthlyReport } from '@/server/domain/monthly-report/monthly-report';

export interface MonthlyReportRepository {
  findAll(): Promise<MonthlyReport[]>;
  findById(id: string): Promise<MonthlyReport | null>;
  save(monthlyReport: MonthlyReport): Promise<void>;
}
