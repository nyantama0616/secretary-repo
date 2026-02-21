import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { generateId } from '@/server/domain/id';

export const monthlyReports = pgTable('monthly_reports', {
  id: text('id').primaryKey().$defaultFn(generateId),
  projectProgress: text('project_progress'),
  growthChanges: text('growth_changes'),
  purposeActionGap: text('purpose_action_gap'),
  improvements: text('improvements'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
