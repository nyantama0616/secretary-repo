import { defineConfig } from 'drizzle-kit';

import { DATABASE_URL } from './src/config';

export default defineConfig({
  out: './drizzle',
  schema: './src/server/infrastructure/db/schema/*',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
});
