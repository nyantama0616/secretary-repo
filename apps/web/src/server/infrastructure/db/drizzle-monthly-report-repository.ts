import { eq } from 'drizzle-orm';

import type { MonthlyReport } from '@/server/domain/monthly-report/monthly-report';
import { createMonthlyReport } from '@/server/domain/monthly-report/monthly-report';
import type { MonthlyReportRepository } from '@/server/domain/monthly-report/monthly-report-repository';
import { db } from '@/server/infrastructure/db/client';
import { monthlyReports } from '@/server/infrastructure/db/schema/monthly-reports';

export class DrizzleMonthlyReportRepository
  implements MonthlyReportRepository
{
  async findAll(): Promise<MonthlyReport[]> {
    const rows = await db.select().from(monthlyReports);
    return rows.map(toMonthlyReport);
  }

  async findById(id: string): Promise<MonthlyReport | null> {
    const rows = await db
      .select()
      .from(monthlyReports)
      .where(eq(monthlyReports.id, id));
    return rows[0] ? toMonthlyReport(rows[0]) : null;
  }

  async save(monthlyReport: MonthlyReport): Promise<void> {
    await db.insert(monthlyReports).values({
      id: monthlyReport.id,
      projectProgress: monthlyReport.projectProgress,
      growthChanges: monthlyReport.growthChanges,
      purposeActionGap: monthlyReport.purposeActionGap,
      improvements: monthlyReport.improvements,
      notes: monthlyReport.notes,
    });
  }
}

const toMonthlyReport = (
  row: typeof monthlyReports.$inferSelect,
): MonthlyReport => {
  return createMonthlyReport({
    id: row.id,
    projectProgress: row.projectProgress,
    growthChanges: row.growthChanges,
    purposeActionGap: row.purposeActionGap,
    improvements: row.improvements,
    notes: row.notes,
    createdAt: row.createdAt,
  });
};
