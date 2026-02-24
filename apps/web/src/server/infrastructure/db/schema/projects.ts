import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { generateId } from '@/server/domain/id';

export const projects = pgTable('projects', {
  id: text('id').primaryKey().$defaultFn(generateId),
  name: text('name').notNull(),
  purpose: text('purpose').notNull(),
  notes: text('notes'),
  status: text('status', { enum: ['active', 'done'] })
    .notNull()
    .default('active'),
  deadline: timestamp('deadline', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
