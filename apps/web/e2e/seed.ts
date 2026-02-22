import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { DATABASE_URL_TEST } from '../src/config';
import { dailyReports } from '../src/server/infrastructure/db/schema/daily-reports';
import { monthlyReports } from '../src/server/infrastructure/db/schema/monthly-reports';
import { projects } from '../src/server/infrastructure/db/schema/projects';
import { tasks } from '../src/server/infrastructure/db/schema/tasks';
import { weeklyReports } from '../src/server/infrastructure/db/schema/weekly-reports';

const SEED_DAILY_REPORTS = [
  {
    date: new Date('2026-02-17'),
    goal: '機能Aの実装を進める',
    summary: '機能Aの主要部分を実装し、集中して作業できた',
    wakeUpTime: new Date('2026-02-17T07:00:00+09:00'),
    bedTime: new Date('2026-02-17T23:00:00+09:00'),
    review: '集中して作業できた。休憩を取り忘れたので改善したい。',
  },
  {
    date: new Date('2026-02-18'),
    goal: 'テストを書く',
    summary: 'テストの基本を学んだが体調不良で早退した',
    wakeUpTime: new Date('2026-02-18T06:30:00+09:00'),
    notes: '体調不良のため早退',
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
    status: 'active' as const,
    deadline: new Date('2026-06-30T00:00:00+09:00'),
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
      await tx.insert(tasks).values(
        SEED_TASKS.map((task, i) => ({
          ...task,
          dailyReportId: insertedReports[i % insertedReports.length].id,
          projectId: i === 0 ? insertedProjects[0].id : null,
        })),
      );
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
