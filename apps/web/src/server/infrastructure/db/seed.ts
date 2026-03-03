import { sql } from 'drizzle-orm';

import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';
import { monthlyReports } from '@/server/infrastructure/db/schema/monthly-reports';
import { projects } from '@/server/infrastructure/db/schema/projects';
import { tasks } from '@/server/infrastructure/db/schema/tasks';
import { weeklyReports } from '@/server/infrastructure/db/schema/weekly-reports';

// NOTE: new Date('YYYY-MM-DD') で UTC 午前0時を生成する。DB の date 型と一致させるためである
const toUTCDate = (date: Date): Date => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return new Date(`${y}-${m}-${d}`);
};

const addDays = (base: Date, days: number): Date => {
  const result = new Date(base);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

// NOTE: 基準日の UTC 午前0時からの時間オフセットで Date を生成する
const hoursFrom = (base: Date, hours: number): Date => {
  return new Date(base.getTime() + hours * 60 * 60 * 1000);
};

const startOfMonth = (date: Date, offset = 0): Date => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1),
  );
};

// NOTE: 指定日を含む週の月曜日を返す
const mondayOf = (date: Date): Date => {
  const day = date.getUTCDay();
  return addDays(date, -((day + 6) % 7));
};

const TODAY = toUTCDate(new Date());
const TOMORROW = addDays(TODAY, 1);
const THIS_MONDAY = mondayOf(TODAY);
const PAST = [addDays(TODAY, -11), addDays(TODAY, -10), addDays(TODAY, -9)];

const SEED_DAILY_REPORTS = [
  {
    date: PAST[0],
    goal: '機能Aの実装を進める',
    summary:
      '機能Aの主要部分を実装し、集中して作業できた。\n予定していたAPI設計も完了した。\n明日はテストを書く予定。',
    wakeUpTime: hoursFrom(PAST[0], -2),
    bedTime: hoursFrom(PAST[0], 16),
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
    reviewStartedAt: hoursFrom(PAST[0], 12),
    reviewFinishedAt: hoursFrom(PAST[0], 12.25),
  },
  {
    date: PAST[1],
    goal: 'テストを書く',
    summary: 'テストの基本を学んだが体調不良で早退した',
    wakeUpTime: hoursFrom(PAST[1], -2.5),
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
    date: PAST[2],
    goal: 'コードレビューと修正',
    summary: 'レビューで良い指摘をもらい修正を完了した',
    wakeUpTime: hoursFrom(PAST[2], -1.5),
    bedTime: hoursFrom(PAST[2], 14.5),
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
    reviewStartedAt: hoursFrom(PAST[2], 12.5),
    reviewFinishedAt: hoursFrom(PAST[2], 13),
  },
  {
    date: TODAY,
    goal: 'ダッシュボードUIを実装する',
    wakeUpTime: hoursFrom(TODAY, -2),
  },
  {
    date: TOMORROW,
    goal: 'E2Eテストを書く',
  },
];

const SEED_WEEKLY_REPORTS = [
  {
    startDate: addDays(THIS_MONDAY, -14),
    goal: '機能Aの設計を固める',
    summary: '設計レビューを実施し、API仕様を確定した',
  },
  {
    startDate: addDays(THIS_MONDAY, -7),
    goal: '機能Aの実装を開始する',
    summary: 'ドメイン層とユースケース層の実装を完了した',
  },
  {
    startDate: THIS_MONDAY,
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
    deadline: addDays(TODAY, 120),
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
    notes: [
      '- `sortOrder` は DB 側で **デフォルト値** を設定するか検討する',
      '- エラーハンドリングは `NotFoundError` を使う方針に決まった',
    ].join('\n'),
    firstAction: 'task.ts にスキーマを定義する',
    status: 'not_started' as const,
    sortOrder: 1,
    deadline: hoursFrom(addDays(TODAY, -8), 9),
    estimatedMinutes: 120,
  },
  {
    title: 'テストを書く',
    firstAction: 'テストファイルを作成する',
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
    firstAction: 'daily-task-section.tsx を開く',
    status: 'in_progress' as const,
    sortOrder: 0,
    estimatedMinutes: 180,
  },
  {
    title: 'コンポーネントのテストを書く',
    firstAction: 'テストファイルを作成する',
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
        startDate: startOfMonth(TODAY, -1),
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
        startDate: startOfMonth(TODAY),
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
    const todayStr = TODAY.toISOString().slice(0, 10);
    const tomorrowStr = TOMORROW.toISOString().slice(0, 10);
    const todayReport = insertedReports.find((r) =>
      r.date.toISOString().startsWith(todayStr),
    )!;
    const tomorrowReport = insertedReports.find((r) =>
      r.date.toISOString().startsWith(tomorrowStr),
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
