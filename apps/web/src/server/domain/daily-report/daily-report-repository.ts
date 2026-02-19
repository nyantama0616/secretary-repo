import type { DailyReport } from '@/server/domain/daily-report/daily-report';

export interface DailyReportRepository {
  findAll(): Promise<DailyReport[]>;
  findById(id: string): Promise<DailyReport | null>;
  findByDate(date: Date): Promise<DailyReport | null>;
  save(dailyReport: DailyReport): Promise<void>;
  update(dailyReport: DailyReport): Promise<void>;
}
