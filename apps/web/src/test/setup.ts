import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { beforeAll, beforeEach } from 'vitest';

import { db } from '@/server/infrastructure/db/client';

// NOTE: マイグレーションは冪等であるため、テストファイルごとに実行しても問題ない
beforeAll(async () => {
  await migrate(db, { migrationsFolder: './drizzle' });
});

beforeEach(async () => {
  await truncateAllTables();
});

// NOTE: public スキーマの全テーブルを CASCADE 付きで TRUNCATE する
const truncateAllTables = async () => {
  await db.execute(sql`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$
  `);
};
