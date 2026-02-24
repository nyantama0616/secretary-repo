import { sql } from 'drizzle-orm';

import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';
import { monthlyReports } from '@/server/infrastructure/db/schema/monthly-reports';
import { projects } from '@/server/infrastructure/db/schema/projects';
import { tasks } from '@/server/infrastructure/db/schema/tasks';
import { weeklyReports } from '@/server/infrastructure/db/schema/weekly-reports';

const SEED_DAILY_REPORTS = [
  {
    date: new Date('2026-02-17'),
    goal: '機能Aの実装を進める',
    summary:
      '機能Aの主要部分を実装し、集中して作業できた。\n予定していたAPI設計も完了した。\n明日はテストを書く予定。',
    wakeUpTime: new Date('2026-02-16T22:00:00Z'),
    bedTime: new Date('2026-02-17T14:00:00Z'),
    review: [
      '## 良かった点',
      '- 集中して作業できた',
      '- API設計を予定通り完了できた',
      '',
      '## 改善点',
      '- 休憩を取り忘れた',
      '- **ポモドーロテクニック**を試してみたい',
      '',
      '## ネクストアクション',
      '- 明日はテストを書く',
    ].join('\n'),
  },
  {
    date: new Date('2026-02-18'),
    goal: 'テストを書く',
    summary: 'テストの基本を学んだが体調不良で早退した',
    wakeUpTime: new Date('2026-02-17T21:30:00Z'),
    review: [
      '## 良かった点',
      '- テストの書き方が分かってきた',
      '- `describe` / `it` の使い分けを理解した',
    ].join('\n'),
    notes: [
      '- 体調不良のため **14時** に早退した',
      '- 明日は無理せず様子を見る',
    ].join('\n'),
  },
  {
    date: new Date('2026-02-19'),
    goal: 'コードレビューと修正',
    summary: 'レビューで良い指摘をもらい修正を完了した',
    wakeUpTime: new Date('2026-02-18T22:30:00Z'),
    bedTime: new Date('2026-02-19T14:30:00Z'),
    review: [
      '## 良かった点',
      '- レビューで良い指摘をもらえた',
      '',
      '## 改善点',
      '- 修正に時間がかかりすぎた',
      '- 早めにレビューを出すべきだと分かった',
      '',
      '## ネクストアクション',
      '- 明日は新機能に着手する',
    ].join('\n'),
  },
  {
    date: new Date('2026-02-22'),
    goal: 'ダッシュボードUIを実装する',
    wakeUpTime: new Date('2026-02-21T22:00:00Z'),
  },
  {
    date: new Date('2026-02-23'),
    goal: 'E2Eテストを書く',
  },
];

const SEED_WEEKLY_REPORTS = [
  {
    startDate: new Date('2026-02-02'),
    goal: '機能Aの設計を固める',
    summary: '設計レビューを実施し、API仕様を確定した',
  },
  {
    startDate: new Date('2026-02-09'),
    goal: '機能Aの実装を開始する',
    summary: 'ドメイン層とユースケース層の実装を完了した',
  },
  {
    startDate: new Date('2026-02-16'),
    goal: 'テストを充実させる',
  },
];

const SEED_PROJECTS = [
  {
    name: 'secretary-repo',
    purpose: [
      '## ゴール',
      'AI を活用した**日報・タスク管理アプリ**を開発する。',
      '',
      '## 解決したい課題',
      '- 先延ばしの解消',
      '- モチベーションの維持',
      '- 日々の振り返りの習慣化',
      '',
      '## 技術スタック',
      '- Next.js (App Router)',
      '- tRPC + TanStack Query',
      '- Drizzle ORM + PostgreSQL',
    ].join('\n'),
    notes: [
      '- MVP は6月末までにリリースする',
      '- MCP サーバーを先に安定させる',
    ].join('\n'),
    status: 'active' as const,
    deadline: new Date('2026-06-30'),
  },
  {
    name: '読書記録アプリ',
    purpose: '読んだ本の感想を記録して振り返る',
    status: 'done' as const,
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
      '- `task.list` プロシージャを追加する',
      '- `task.detail` プロシージャを追加する',
      '- 統合テストを書く',
      '',
      '## 手順',
      '1. スキーマを定義する',
      '2. ルーターを実装する',
      '3. テストを書く',
      '',
      '## 備考',
      '既存の `dailyReport` ルーターの実装を参考にする。',
      '`sortOrder` でのソートを忘れないこと。',
      '',
      '> テストは **Red → Green → Refactor** の順で進める。',
      '',
      '---',
      '',
      '### 参考リンク',
      '[tRPC 公式ドキュメント](https://trpc.io/docs)',
      '',
      '### ネストしたリスト',
      '- バックエンド',
      '  - Domain 層',
      '  - UseCase 層',
      '  - Infrastructure 層',
      '- フロントエンド',
      '  - コンポーネント',
      '  - hooks',
      '',
      '### コードブロック',
      '```ts',
      'const router = t.router({',
      '  list: protectedProcedure.query(async () => {',
      '    return tasks;',
      '  }),',
      '});',
      '```',
    ].join('\n'),
    status: 'not_started' as const,
    sortOrder: 1,
    deadline: new Date('2026-02-20T09:00:00Z'),
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

const SEED_TODAY_TASKS = [
  {
    title: 'ダッシュボードUIを実装する',
    status: 'in_progress' as const,
    sortOrder: 0,
    estimatedMinutes: 180,
  },
  {
    title: 'コンポーネントのテストを書く',
    status: 'not_started' as const,
    sortOrder: 1,
    estimatedMinutes: 60,
  },
  {
    title: '日報を書く',
    status: 'done' as const,
    sortOrder: 2,
  },
  {
    title: '旧APIの削除',
    status: 'cancelled' as const,
    sortOrder: 3,
    incompletionReason: '仕様変更により不要になった',
  },
  {
    title: 'ライブラリのアップデート',
    status: 'deferred' as const,
    sortOrder: 4,
    incompletionReason: '優先度の高いタスクを先に対応する',
  },
];

const SEED_TOMORROW_TASKS = [
  {
    title: 'E2Eテストを追加する',
    status: 'not_started' as const,
    sortOrder: 0,
    estimatedMinutes: 120,
  },
  {
    title: 'コードレビュー対応',
    status: 'not_started' as const,
    sortOrder: 1,
    estimatedMinutes: 90,
  },
];

const main = async () => {
  console.log('Seeding...');
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`TRUNCATE ${tasks}, ${dailyReports}, ${weeklyReports}, ${monthlyReports}, ${projects}`,
    );
    await tx.insert(monthlyReports).values([
      {
        startDate: new Date('2026-02-01'),
        goal: '機能Aをリリースする',
        summary: '新機能の開発を進めた月だった',
        review: [
          '## プロジェクトの進捗',
          '機能Aの実装とテストが完了し、コードレビューも通った。',
          '',
          '## 成長と変化',
          'テストの書き方に慣れてきた。レビューの指摘から設計の考え方を学べた。',
          '',
          '## 改善点',
          '- レビューを早めに出すことで手戻りを減らせる',
          '- 作業の見積もり精度も改善したい',
        ].join('\n'),
      },
      {
        startDate: new Date('2026-03-01'),
        goal: 'テストカバレッジを80%にする',
      },
    ]);
    await tx.insert(weeklyReports).values(SEED_WEEKLY_REPORTS);
    const insertedReports = await tx
      .insert(dailyReports)
      .values(SEED_DAILY_REPORTS)
      .returning();
    const insertedProjects = await tx
      .insert(projects)
      .values(SEED_PROJECTS)
      .returning();
    const todayReport = insertedReports.find(
      (r) => r.date.toISOString().startsWith('2026-02-22'),
    )!;
    const tomorrowReport = insertedReports.find(
      (r) => r.date.toISOString().startsWith('2026-02-23'),
    )!;
    await tx.insert(tasks).values([
      ...SEED_TASKS.map((task, i) => ({
        ...task,
        dailyReportId: insertedReports[i % 3].id,
        // NOTE: 最初の2つのタスクを active なプロジェクトに紐付ける
        projectId: i < 2 ? insertedProjects[0].id : null,
      })),
      ...SEED_TODAY_TASKS.map((task) => ({
        ...task,
        dailyReportId: todayReport.id,
        projectId: insertedProjects[0].id,
      })),
      ...SEED_TOMORROW_TASKS.map((task) => ({
        ...task,
        dailyReportId: tomorrowReport.id,
        projectId: insertedProjects[0].id,
      })),
    ]);
  });
  console.log('Seeding completed.');
  process.exit(0);
};

main().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
