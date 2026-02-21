import { date, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

import { generateId } from '@/server/domain/id';

export const monthlyReports = pgTable(
  'monthly_reports',
  {
    id: text('id').primaryKey().$defaultFn(generateId),
    startDate: date('start_date', { mode: 'date' }).notNull(),
    goal: text('goal'),
    summary: text('summary'),
    review: text('review'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.startDate)],
);
