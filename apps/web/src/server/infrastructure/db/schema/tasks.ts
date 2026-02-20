import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { generateId } from '@/server/domain/id';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey().$defaultFn(generateId),
  dailyReportId: text('daily_report_id').references(() => dailyReports.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', {
    enum: ['not_started', 'in_progress', 'done', 'cancelled'],
  })
    .notNull()
    .default('not_started'),
  sortOrder: integer('sort_order').notNull(),
  deadline: timestamp('deadline', { withTimezone: true }),
  estimatedMinutes: integer('estimated_minutes'),
  incompletionReason: text('incompletion_reason'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
