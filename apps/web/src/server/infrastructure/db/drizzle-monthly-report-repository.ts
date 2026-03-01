import { desc, eq } from 'drizzle-orm';

import type { MonthlyReport } from '@/server/domain/monthly-report/monthly-report';
import { createMonthlyReport } from '@/server/domain/monthly-report/monthly-report';
import type { MonthlyReportRepository } from '@/server/domain/monthly-report/monthly-report-repository';
import { db } from '@/server/infrastructure/db/client';
import { monthlyReports } from '@/server/infrastructure/db/schema/monthly-reports';

export class DrizzleMonthlyReportRepository
  implements MonthlyReportRepository
{
  async findAll(): Promise<MonthlyReport[]> {
    const rows = await db
      .select()
      .from(monthlyReports)
      .orderBy(desc(monthlyReports.startDate));
    return rows.map(toMonthlyReport);
  }

  async findById(id: string): Promise<MonthlyReport | null> {
    const rows = await db
      .select()
      .from(monthlyReports)
      .where(eq(monthlyReports.id, id));
    return rows[0] ? toMonthlyReport(rows[0]) : null;
  }

  async findByStartDate(startDate: Date): Promise<MonthlyReport | null> {
    const rows = await db
      .select()
      .from(monthlyReports)
      .where(eq(monthlyReports.startDate, startDate));
    return rows[0] ? toMonthlyReport(rows[0]) : null;
  }

  async save(monthlyReport: MonthlyReport): Promise<void> {
    await db.insert(monthlyReports).values({
      id: monthlyReport.id,
      startDate: monthlyReport.startDate,
      goal: monthlyReport.goal,
      summary: monthlyReport.summary,
      review: monthlyReport.review,
      notes: monthlyReport.notes,
    });
  }

  async update(monthlyReport: MonthlyReport): Promise<void> {
    await db
      .update(monthlyReports)
      .set({
        goal: monthlyReport.goal,
        summary: monthlyReport.summary,
        review: monthlyReport.review,
        notes: monthlyReport.notes,
      })
      .where(eq(monthlyReports.id, monthlyReport.id));
  }

}

const toMonthlyReport = (
  row: typeof monthlyReports.$inferSelect,
): MonthlyReport => {
  return createMonthlyReport({
    id: row.id,
    startDate: row.startDate,
    goal: row.goal,
    summary: row.summary,
    review: row.review,
    notes: row.notes,
    createdAt: row.createdAt,
  });
};
