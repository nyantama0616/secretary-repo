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
