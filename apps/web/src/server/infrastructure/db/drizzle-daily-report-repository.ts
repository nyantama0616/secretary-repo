import { eq, inArray } from 'drizzle-orm';

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

  async findById(id: string): Promise<DailyReport | null> {
    const rows = await db
      .select()
      .from(dailyReports)
      .where(eq(dailyReports.id, id));
    return rows[0] ? toDailyReport(rows[0]) : null;
  }

  async findByIds(ids: string[]): Promise<DailyReport[]> {
    if (ids.length === 0) return [];
    const rows = await db
      .select()
      .from(dailyReports)
      .where(inArray(dailyReports.id, ids));
    return rows.map(toDailyReport);
  }

  async findByDate(date: Date): Promise<DailyReport | null> {
    const rows = await db
      .select()
      .from(dailyReports)
      .where(eq(dailyReports.date, date));
    return rows[0] ? toDailyReport(rows[0]) : null;
  }

  async save(dailyReport: DailyReport): Promise<void> {
    await db.insert(dailyReports).values({
      id: dailyReport.id,
      date: dailyReport.date,
      plan: dailyReport.plan,
      summary: dailyReport.summary,
      wakeUpTime: dailyReport.wakeUpTime,
      bedTime: dailyReport.bedTime,
      goodPoints: dailyReport.goodPoints,
      badPoints: dailyReport.badPoints,
      learnings: dailyReport.learnings,
      nextActions: dailyReport.nextActions,
      notes: dailyReport.notes,
    });
  }

  async update(dailyReport: DailyReport): Promise<void> {
    await db
      .update(dailyReports)
      .set({
        date: dailyReport.date,
        plan: dailyReport.plan,
        summary: dailyReport.summary,
        wakeUpTime: dailyReport.wakeUpTime,
        bedTime: dailyReport.bedTime,
        goodPoints: dailyReport.goodPoints,
        badPoints: dailyReport.badPoints,
        learnings: dailyReport.learnings,
        nextActions: dailyReport.nextActions,
        notes: dailyReport.notes,
      })
      .where(eq(dailyReports.id, dailyReport.id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(dailyReports).where(eq(dailyReports.id, id));
  }
}

const toDailyReport = (
  row: typeof dailyReports.$inferSelect,
): DailyReport => {
  return createDailyReport({
    id: row.id,
    date: row.date,
    plan: row.plan,
    summary: row.summary,
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
