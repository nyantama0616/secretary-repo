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
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return new Date(`${y}-${m}-${d}`);
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

/** TODAY から遡って直近の月曜日を返す */
const previousMonday = (from: Date): Date => {
  const day = from.getUTCDay();
  // NOTE: 日曜(0)は -6、月曜(1)は 0、火曜(2)は -1 … 土曜(6)は -5
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(from, diff);
};

/** TODAY の属する月の1日を返す */
const startOfMonth = (from: Date): Date =>
  new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));

/** 前月の1日を返す */
const previousMonthStart = (from: Date): Date =>
  new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - 1, 1));

export {
  formatDate,
  formatMonth,
  formatWeekRange,
  toDateStr,
} from '../src/lib/format';

export const TODAY = toUTCDate(new Date());
const TOMORROW = addDays(TODAY, 1);
export const DAYS_AGO_3 = addDays(TODAY, -3);
export const DAYS_AGO_4 = addDays(TODAY, -4);
export const DAYS_AGO_7 = addDays(TODAY, -7);
export const TASK_DEADLINE = addDays(TODAY, 3);
export const PROJECT_DEADLINE = addDays(TODAY, 120);
export const THIS_MONDAY = previousMonday(TODAY);
export const TWO_WEEKS_AGO_MONDAY = addDays(THIS_MONDAY, -14);
export const THIS_MONTH_START = startOfMonth(TODAY);
export const LAST_MONTH_START = previousMonthStart(TODAY);
export const NEXT_MONTH_START = new Date(
  Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth() + 1, 1),
);

const SEED_DAILY_REPORTS = [
  // NOTE: 全フィールド入力済みの日報（詳細表示・タスク紐づき確認用）
  {
    date: DAYS_AGO_4,
    goal: '目標テキスト',
    summary: 'サマリーA',
    wakeUpTime: new Date(DAYS_AGO_4.getTime() + 7 * 60 * 60 * 1000),
    bedTime: new Date(DAYS_AGO_4.getTime() + 23 * 60 * 60 * 1000),
    review: '振り返りテキスト',
  },
  // NOTE: 備考ありの日報（一覧表示確認用）
  {
    date: DAYS_AGO_3,
    goal: '目標テキスト',
    summary: 'サマリーB',
    wakeUpTime: new Date(DAYS_AGO_3.getTime() + 6.5 * 60 * 60 * 1000),
    notes: '備考テキスト',
  },
  // NOTE: 今日の日報（ダッシュボード表示・編集テスト用）
  {
    date: TODAY,
    goal: '目標テキスト',
    summary: 'サマリーC',
    review: '## 見出し\n- 箇条書き',
  },
  // NOTE: 目標のみの日報（明日タスクの親）
  {
    date: TOMORROW,
    goal: '目標テキスト',
  },
];

const SEED_WEEKLY_REPORTS = [
  // NOTE: 全フィールド入力済みの週報（詳細表示・編集プリフィル・月報紐づき確認用）
  {
    startDate: TWO_WEEKS_AGO_MONDAY,
    goal: '週報の目標A',
    summary: 'サマリーテキスト',
  },
  // NOTE: 目標のみの週報（サマリー/振り返り非表示・日報紐づき確認用）
  {
    startDate: THIS_MONDAY,
    goal: '週報の目標B',
  },
];

const SEED_PROJECTS = [
  // NOTE: 全フィールド入力済みのプロジェクト（詳細表示・編集・タスク紐づき確認用）
  {
    name: 'プロジェクトA',
    purpose: '目的テキスト',
    notes: 'メモテキスト',
    status: 'active' as const,
    deadline: PROJECT_DEADLINE,
  },
  // NOTE: 最小構成のプロジェクト（完了ステータス表示確認用）
  {
    name: 'プロジェクトB',
    purpose: '目的テキスト',
    status: 'done' as const,
  },
];

const SEED_TASKS = [
  // NOTE: 全フィールド入力済みのタスク（詳細表示・編集・プロジェクト紐づき確認用）
  {
    title: 'タスクA',
    description: '説明テキスト',
    notes: '- **太字テキスト**\n- `コードテキスト`',
    firstAction: 'アクションテキスト',
    status: 'not_started' as const,
    sortOrder: 1,
    deadline: TASK_DEADLINE,
    estimatedMinutes: 120,
  },
  // NOTE: 最小構成のタスク（削除テスト用）
  {
    title: 'タスクB',
    status: 'done' as const,
    sortOrder: 2,
  },
];

const SEED_TODAY_TASKS = [
  {
    title: '今日タスクX',
    firstAction: 'アクションA',
    status: 'in_progress' as const,
    sortOrder: 0,
  },
  {
    title: '今日タスクY',
    firstAction: 'アクションB',
    status: 'not_started' as const,
    sortOrder: 1,
  },
  {
    title: '今日タスクZ',
    status: 'done' as const,
    sortOrder: 2,
  },
];

const SEED_TOMORROW_TASKS = [
  {
    title: '明日タスクX',
    status: 'not_started' as const,
    sortOrder: 0,
  },
  {
    title: '明日タスクY',
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
        // NOTE: 全フィールド入力済みの月報（詳細表示・振り返りセクション・週報紐づき確認用）
        {
          startDate: LAST_MONTH_START,
          goal: '月報の目標A',
          summary: 'サマリーテキスト',
          review:
            '振り返りテキストA。振り返りテキストB。振り返りテキストC。',
        },
        // NOTE: 目標のみの月報（振り返り非表示確認用）
        {
          startDate: THIS_MONTH_START,
          goal: '月報の目標B',
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
