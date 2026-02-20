import type { DailyReport } from '@/server/domain/daily-report/daily-report';

export interface DailyReportRepository {
  findAll(): Promise<DailyReport[]>;
  findById(id: string): Promise<DailyReport | null>;
  findByIds(ids: string[]): Promise<DailyReport[]>;
  findByDate(date: Date): Promise<DailyReport | null>;
  save(dailyReport: DailyReport): Promise<void>;
  update(dailyReport: DailyReport): Promise<void>;
  delete(id: string): Promise<void>;
}
