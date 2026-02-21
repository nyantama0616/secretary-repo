import { date, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { generateId } from '@/server/domain/id';
import { monthlyReports } from '@/server/infrastructure/db/schema/monthly-reports';

export const dailyReports = pgTable('daily_reports', {
  id: text('id').primaryKey().$defaultFn(generateId),
  date: date('date', { mode: 'date' }).notNull().unique(),
  monthlyReportId: text('monthly_report_id')
    .notNull()
    .references(() => monthlyReports.id, { onDelete: 'cascade' }),
  plan: text('plan'),
  summary: text('summary'),
  wakeUpTime: timestamp('wake_up_time', { withTimezone: true }),
  bedTime: timestamp('bed_time', { withTimezone: true }),
  goodPoints: text('good_points'),
  badPoints: text('bad_points'),
  learnings: text('learnings'),
  nextActions: text('next_actions'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
