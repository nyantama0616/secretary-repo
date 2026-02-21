import { sql } from 'drizzle-orm';

import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';
import { monthlyReports } from '@/server/infrastructure/db/schema/monthly-reports';
import { tasks } from '@/server/infrastructure/db/schema/tasks';

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

const SEED_TASKS = [
  {
    title: 'tRPC ルーターを実装する',
    description: 'タスク一覧APIを実装する',
    status: 'not_started' as const,
    sortOrder: 1,
    deadline: new Date('2026-02-20T18:00:00+09:00'),
    estimatedMinutes: 120,
  },
  {
    title: 'テストを書く',
    status: 'done' as const,
    sortOrder: 2,
  },
];

const main = async () => {
  console.log('Seeding for E2E...');
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`TRUNCATE ${tasks}, ${dailyReports}, ${monthlyReports}`,
    );
    await tx.insert(monthlyReports).values([
      {
        startDate: new Date('2026-02-01'),
        summary: '新機能の開発を進めた月だった',
        projectProgress: '機能Aの実装とテストが完了した',
        growthChanges: 'テストの書き方に慣れてきた',
        purposeActionGap: '休憩を忘れて集中しすぎる傾向がある',
        improvements: 'レビューを早めに出すことで手戻りを減らせる',
      },
      { startDate: new Date('2026-01-01') },
    ]);
    const insertedReports = await tx
      .insert(dailyReports)
      .values(SEED_DAILY_REPORTS)
      .returning();
    await tx.insert(tasks).values(
      SEED_TASKS.map((task, i) => ({
        ...task,
        dailyReportId: insertedReports[i % insertedReports.length].id,
      })),
    );
  });
  console.log('Seeding for E2E completed.');
  process.exit(0);
};

main().catch((e) => {
  console.error('Seeding for E2E failed:', e);
  process.exit(1);
});
