import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { DATABASE_URL_TEST } from '../src/config';
import { dailyReports } from '../src/server/infrastructure/db/schema/daily-reports';
import { monthlyReports } from '../src/server/infrastructure/db/schema/monthly-reports';
import { projects } from '../src/server/infrastructure/db/schema/projects';
import { tasks } from '../src/server/infrastructure/db/schema/tasks';
import { weeklyReports } from '../src/server/infrastructure/db/schema/weekly-reports';

// NOTE: サーバー側の時刻依存ロジック（48時間制限など）が正しく動作するよう、実時刻ベースの日付を使う
// NOTE: fixtures.ts の clock.setFixedTime() でブラウザの時計をこの値に固定する
// NOTE: new Date('YYYY-MM-DD') で UTC 午前0時にする。DB の date 型と一致させるためである
const toUTCDate = (date: Date): Date => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return new Date(`${y}-${m}-${d}`);
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

export const TODAY = toUTCDate(new Date());
const TOMORROW = addDays(TODAY, 1);

const SEED_DAILY_REPORTS = [
  {
    date: new Date('2026-02-17'),
    goal: '機能Aの実装を進める',
    summary: '機能Aの主要部分を実装し、集中して作業できた',
    wakeUpTime: new Date('2026-02-17T07:00:00Z'),
    bedTime: new Date('2026-02-17T23:00:00Z'),
    review: '集中して作業できた。休憩を取り忘れたので改善したい。',
  },
  {
    date: new Date('2026-02-18'),
    goal: 'テストを書く',
    summary: 'テストの基本を学んだが体調不良で早退した',
    wakeUpTime: new Date('2026-02-18T06:30:00Z'),
    notes: '体調不良のため早退',
  },
  {
    date: TODAY,
    goal: 'ダッシュボードの改善を進める',
    summary: '今日の進捗を記録した',
    review: '## 良かった点\n- 集中して作業できた\n\n## 改善点\n- 休憩を取り忘れた',
  },
  {
    date: TOMORROW,
    goal: '明日の目標',
  },
];

const SEED_WEEKLY_REPORTS = [
  {
    startDate: new Date('2026-02-02'),
    goal: '機能Aの設計を固める',
    summary: '設計レビューを実施し、API仕様を確定した',
  },
  {
    startDate: new Date('2026-02-16'),
    goal: 'テストを充実させる',
  },
];

const SEED_PROJECTS = [
  {
    name: 'secretary-repo',
    purpose: 'AI を活用した日報・タスク管理アプリを開発する',
    notes: 'MVP は6月末までにリリースする',
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
    description: 'タスク一覧APIを実装する',
    notes: '- `sortOrder` は **デフォルト値** を設定する\n- エラーは `NotFoundError` を使う',
    firstAction: 'エディタを開いてファイルを作成する',
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
];

const SEED_TODAY_TASKS = [
  {
    title: 'ダッシュボードUIを実装する',
    firstAction: 'コンポーネントファイルを開く',
    status: 'in_progress' as const,
    sortOrder: 0,
  },
  {
    title: 'テストを追加する',
    firstAction: 'テストファイルを作成する',
    status: 'not_started' as const,
    sortOrder: 1,
  },
  {
    title: '日報を書く',
    status: 'done' as const,
    sortOrder: 2,
  },
];

const SEED_TOMORROW_TASKS = [
  {
    title: 'コードレビュー対応',
    status: 'not_started' as const,
    sortOrder: 0,
  },
  {
    title: 'ドキュメント更新',
    status: 'not_started' as const,
    sortOrder: 1,
  },
];

export const seed = async () => {
  const client = postgres(DATABASE_URL_TEST!);
  const db = drizzle(client);

  try {
    console.log('Seeding for E2E...');
    await db.transaction(async (tx) => {
      await tx.execute(
        sql`TRUNCATE ${tasks}, ${dailyReports}, ${weeklyReports}, ${monthlyReports}, ${projects}`,
      );
      await tx.insert(monthlyReports).values([
        {
          startDate: new Date('2026-02-01'),
          goal: '機能Aをリリースする',
          summary: '新機能の開発を進めた月だった',
          review:
            '機能Aの実装とテストが完了した。テストの書き方に慣れてきた。レビューを早めに出すことで手戻りを減らせる。',
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
        (r) => r.date.getTime() === TODAY.getTime(),
      )!;
      const tomorrowReport = insertedReports.find(
        (r) => r.date.getTime() === TOMORROW.getTime(),
      )!;
      await tx.insert(tasks).values([
        ...SEED_TASKS.map((task, i) => ({
          ...task,
          dailyReportId: insertedReports[i % 2].id,
          projectId: i === 0 ? insertedProjects[0].id : null,
        })),
        ...SEED_TODAY_TASKS.map((task) => ({
          ...task,
          dailyReportId: todayReport.id,
        })),
        ...SEED_TOMORROW_TASKS.map((task) => ({
          ...task,
          dailyReportId: tomorrowReport.id,
        })),
      ]);
    });
    console.log('Seeding for E2E completed.');
  } finally {
    await client.end();
  }
};

// NOTE: CLI から直接実行された場合のみ process.exit() する
const isDirectExecution = require.main === module;
if (isDirectExecution) {
  seed()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('Seeding for E2E failed:', e);
      process.exit(1);
    });
}
