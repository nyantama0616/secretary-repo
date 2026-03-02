import { and, desc, eq, gte, inArray, lt } from 'drizzle-orm';

import { DailyReport } from '@/server/domain/daily-report/daily-report';
import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';

export class DrizzleDailyReportRepository implements DailyReportRepository {
  async findAll(): Promise<DailyReport[]> {
    const rows = await db
      .select()
      .from(dailyReports)
      .orderBy(desc(dailyReports.date));
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<DailyReport | null> {
    const results = await this.findByIds([id]);
    return results[0] ?? null;
  }

  async findByIds(ids: string[]): Promise<DailyReport[]> {
    if (ids.length === 0) return [];
    const rows = await db
      .select()
      .from(dailyReports)
      .where(inArray(dailyReports.id, ids));
    return rows.map(toDomain);
  }

  async findByDateRange(start: Date, end: Date): Promise<DailyReport[]> {
    const rows = await db
      .select()
      .from(dailyReports)
      .where(
        and(gte(dailyReports.date, start), lt(dailyReports.date, end)),
      )
      .orderBy(desc(dailyReports.date));
    return rows.map(toDomain);
  }

  async findByDate(date: Date): Promise<DailyReport | null> {
    const rows = await db
      .select()
      .from(dailyReports)
      .where(eq(dailyReports.date, date));
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async create(dailyReport: DailyReport): Promise<void> {
    await db.insert(dailyReports).values({
      id: dailyReport.id,
      date: dailyReport.date,
      goal: dailyReport.goal,
      summary: dailyReport.summary,
      wakeUpTime: dailyReport.wakeUpTime,
      bedTime: dailyReport.bedTime,
      review: dailyReport.review,
      reviewStartedAt: dailyReport.reviewStartedAt,
      reviewFinishedAt: dailyReport.reviewFinishedAt,
      notes: dailyReport.notes,
    });
  }

  async update(dailyReport: DailyReport): Promise<void> {
    await db
      .update(dailyReports)
      .set({
        date: dailyReport.date,
        goal: dailyReport.goal,
        summary: dailyReport.summary,
        wakeUpTime: dailyReport.wakeUpTime,
        bedTime: dailyReport.bedTime,
        review: dailyReport.review,
        reviewStartedAt: dailyReport.reviewStartedAt,
        reviewFinishedAt: dailyReport.reviewFinishedAt,
        notes: dailyReport.notes,
      })
      .where(eq(dailyReports.id, dailyReport.id));
  }
}

const toDomain = (
  row: typeof dailyReports.$inferSelect,
): DailyReport => {
  return DailyReport.reconstruct({
    id: row.id,
    date: row.date,
    goal: row.goal,
    summary: row.summary,
    wakeUpTime: row.wakeUpTime,
    bedTime: row.bedTime,
    review: row.review,
    reviewStartedAt: row.reviewStartedAt,
    reviewFinishedAt: row.reviewFinishedAt,
    notes: row.notes,
    createdAt: row.createdAt,
  });
};
