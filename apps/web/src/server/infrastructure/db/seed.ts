import { sql } from 'drizzle-orm';

import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';
import { users } from '@/server/infrastructure/db/schema/users';

const SEED_USERS = [
  { name: '田中太郎', email: 'tanaka@example.com' },
  { name: '佐藤花子', email: 'sato@example.com' },
  { name: '鈴木一郎', email: 'suzuki@example.com' },
];

const SEED_DAILY_REPORTS = [
  {
    date: new Date('2026-02-17'),
    plan: '機能Aの実装を進める',
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
    wakeUpTime: new Date('2026-02-18T06:30:00+09:00'),
    goodPoints: 'テストの書き方が分かってきた',
    notes: '体調不良のため早退',
  },
  {
    date: new Date('2026-02-19'),
    plan: 'コードレビューと修正',
    wakeUpTime: new Date('2026-02-19T07:30:00+09:00'),
    bedTime: new Date('2026-02-19T23:30:00+09:00'),
    goodPoints: 'レビューで良い指摘をもらえた',
    badPoints: '修正に時間がかかりすぎた',
    learnings: '早めにレビューを出すべきだと分かった',
    nextActions: '明日は新機能に着手する',
  },
];

const main = async () => {
  console.log('Seeding...');
  await db.transaction(async (tx) => {
    // NOTE: TRUNCATE CASCADE により外部キー制約の順序を気にせず全テーブルを削除できる
    await tx.execute(sql`TRUNCATE ${users} CASCADE`);
    await tx.execute(sql`TRUNCATE ${dailyReports} CASCADE`);

    await tx.insert(users).values(SEED_USERS);
    await tx.insert(dailyReports).values(SEED_DAILY_REPORTS);
  });
  console.log('Seeding completed.');
  process.exit(0);
};

main().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
