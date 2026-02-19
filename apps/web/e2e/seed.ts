import { sql } from 'drizzle-orm';

import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';
import { users } from '@/server/infrastructure/db/schema/users';

const SEED_USERS = [
  { name: '田中太郎', email: 'tanaka@example.com' },
];

const SEED_DAILY_REPORTS = [
  {
    date: new Date('2026-02-17'),
    plan: '機能Aの実装を進める',
    summary: '機能Aの主要部分を実装し、集中して作業できた',
    wakeUpTime: new Date('2026-02-17T07:00:00+09:00'),
    bedTime: new Date('2026-02-17T23:00:00+09:00'),
    goodPoints: '集中して作業できた',
    badPoints: '休憩を取り忘れた',
    learnings: 'ポモドーロテクニックを試してみたい',
    nextActions: '明日はテストを書く',
  },
  {
    date: new Date('2026-02-18'),
    plan: 'テストを書く',
    summary: 'テストの基本を学んだが体調不良で早退した',
    wakeUpTime: new Date('2026-02-18T06:30:00+09:00'),
    notes: '体調不良のため早退',
  },
];

const main = async () => {
  console.log('Seeding for E2E...');
  await db.transaction(async (tx) => {
    // NOTE: TRUNCATE CASCADE により外部キー制約の順序を気にせず全テーブルを削除できる
    await tx.execute(sql`TRUNCATE ${users} CASCADE`);
    await tx.execute(sql`TRUNCATE ${dailyReports} CASCADE`);

    await tx.insert(users).values(SEED_USERS);
    await tx.insert(dailyReports).values(SEED_DAILY_REPORTS);
  });
  console.log('Seeding for E2E completed.');
  process.exit(0);
};

main().catch((e) => {
  console.error('Seeding for E2E failed:', e);
  process.exit(1);
});
