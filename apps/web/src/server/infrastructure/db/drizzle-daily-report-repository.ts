import type { DailyReport } from '@/server/domain/daily-report/daily-report';
import { createDailyReport } from '@/server/domain/daily-report/daily-report';
import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';

export class DrizzleDailyReportRepository implements DailyReportRepository {
  async findAll(): Promise<DailyReport[]> {
    const rows = await db.select().from(dailyReports);
    return rows.map(toDailyReport);
  }
}

const toDailyReport = (
  row: typeof dailyReports.$inferSelect,
): DailyReport => {
  return createDailyReport({
    id: row.id,
    date: row.date,
    plan: row.plan,
    wakeUpTime: row.wakeUpTime,
    bedTime: row.bedTime,
    goodPoints: row.goodPoints,
    badPoints: row.badPoints,
    learnings: row.learnings,
    nextActions: row.nextActions,
    notes: row.notes,
    createdAt: row.createdAt,
  });
};
