import { sql } from 'drizzle-orm';

import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';
import { monthlyReports } from '@/server/infrastructure/db/schema/monthly-reports';
import { tasks } from '@/server/infrastructure/db/schema/tasks';

const SEED_DAILY_REPORTS = [
  {
    date: new Date('2026-02-17'),
    goal: '機能Aの実装を進める',
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
    goal: 'テストを書く',
    summary: 'テストの基本を学んだが体調不良で早退した',
    wakeUpTime: new Date('2026-02-18T06:30:00+09:00'),
    goodPoints: 'テストの書き方が分かってきた',
    notes: '体調不良のため早退',
  },
  {
    date: new Date('2026-02-19'),
    goal: 'コードレビューと修正',
    summary: 'レビューで良い指摘をもらい修正を完了した',
    wakeUpTime: new Date('2026-02-19T07:30:00+09:00'),
    bedTime: new Date('2026-02-19T23:30:00+09:00'),
    goodPoints: 'レビューで良い指摘をもらえた',
    badPoints: '修正に時間がかかりすぎた',
    learnings: '早めにレビューを出すべきだと分かった',
    nextActions: '明日は新機能に着手する',
  },
];

const SEED_TASKS = [
  {
    title: 'tRPC ルーターを実装する',
    description: [
      '## 概要',
      'タスク一覧APIを実装する。',
      '',
      '## やること',
      '- [ ] `task.list` プロシージャを追加する',
      '- [ ] `task.detail` プロシージャを追加する',
      '- [ ] 統合テストを書く',
      '',
      '## 備考',
      '既存の `dailyReport` ルーターの実装を参考にする。',
      '`sortOrder` でのソートを忘れないこと。',
    ].join('\n'),
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
  {
    title: 'コードレビューの修正',
    description: [
      'レビューで以下の指摘を受けた。',
      '',
      '1. **命名の改善**: `getData` → `fetchTaskList` に変更する',
      '2. **エラーハンドリング**: `NotFoundError` を追加する',
      '3. **型定義**: `as const` を使って型を厳密にする',
    ].join('\n'),
    status: 'in_progress' as const,
    sortOrder: 3,
    estimatedMinutes: 60,
  },
  {
    title: '旧APIの廃止対応',
    status: 'cancelled' as const,
    sortOrder: 4,
    incompletionReason: '仕様変更により不要になった',
  },
];

const main = async () => {
  console.log('Seeding...');
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`TRUNCATE ${tasks}, ${dailyReports}, ${monthlyReports}`,
    );
    await tx.insert(monthlyReports).values([
      {
        startDate: new Date('2026-02-01'),
        goal: '機能Aをリリースする',
        summary: '新機能の開発を進めた月だった',
        projectProgress: '機能Aの実装とテストが完了し、コードレビューも通った',
        growthChanges: 'テストの書き方に慣れてきた。レビューの指摘から設計の考え方を学べた',
        purposeActionGap: '休憩を忘れて集中しすぎる傾向がある。ポモドーロテクニックの導入を検討したい',
        improvements: 'レビューを早めに出すことで手戻りを減らせる。作業の見積もり精度も改善したい',
      },
      {
        startDate: new Date('2026-03-01'),
        goal: 'テストカバレッジを80%にする',
      },
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
  console.log('Seeding completed.');
  process.exit(0);
};

main().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
