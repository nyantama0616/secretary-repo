import { eq } from 'drizzle-orm';

import type { WeeklyReport } from '@/server/domain/weekly-report/weekly-report';
import { createWeeklyReport } from '@/server/domain/weekly-report/weekly-report';
import type { WeeklyReportRepository } from '@/server/domain/weekly-report/weekly-report-repository';
import { db } from '@/server/infrastructure/db/client';
import { weeklyReports } from '@/server/infrastructure/db/schema/weekly-reports';

export class DrizzleWeeklyReportRepository
  implements WeeklyReportRepository
{
  async findAll(): Promise<WeeklyReport[]> {
    const rows = await db.select().from(weeklyReports);
    return rows.map(toWeeklyReport);
  }

  async findById(id: string): Promise<WeeklyReport | null> {
    const rows = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.id, id));
    return rows[0] ? toWeeklyReport(rows[0]) : null;
  }

  async findByStartDate(startDate: Date): Promise<WeeklyReport | null> {
    const rows = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.startDate, startDate));
    return rows[0] ? toWeeklyReport(rows[0]) : null;
  }

  async save(weeklyReport: WeeklyReport): Promise<void> {
    await db.insert(weeklyReports).values({
      id: weeklyReport.id,
      startDate: weeklyReport.startDate,
      goal: weeklyReport.goal,
      summary: weeklyReport.summary,
      review: weeklyReport.review,
      notes: weeklyReport.notes,
    });
  }
}

const toWeeklyReport = (
  row: typeof weeklyReports.$inferSelect,
): WeeklyReport => {
  return createWeeklyReport({
    id: row.id,
    startDate: row.startDate,
    goal: row.goal,
    summary: row.summary,
    review: row.review,
    notes: row.notes,
    createdAt: row.createdAt,
  });
};
