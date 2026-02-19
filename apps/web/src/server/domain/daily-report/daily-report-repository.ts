import type { DailyReport } from '@/server/domain/daily-report/daily-report';

export interface DailyReportRepository {
  findAll(): Promise<DailyReport[]>;
  findById(id: string): Promise<DailyReport | null>;
}
