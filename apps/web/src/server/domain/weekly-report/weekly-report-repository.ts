import type { WeeklyReport } from '@/server/domain/weekly-report/weekly-report';

export interface WeeklyReportRepository {
  findAll(): Promise<WeeklyReport[]>;
  findById(id: string): Promise<WeeklyReport | null>;
}
