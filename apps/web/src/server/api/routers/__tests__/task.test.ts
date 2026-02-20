import { describe, expect, it } from 'vitest';

import { createCaller } from '@/server/api';
import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';
import { tasks } from '@/server/infrastructure/db/schema/tasks';

const caller = createCaller({ isAuthenticated: true });
const unauthenticatedCaller = createCaller({ isAuthenticated: false });

const TEST_DAILY_REPORT = {
  date: new Date('2026-02-17'),
};

const TEST_TASKS = [
  {
    title: 'tRPC ルーターを実装する',
    status: 'not_started' as const,
    sortOrder: 1,
  },
  {
    title: 'テストを書く',
    status: 'done' as const,
    sortOrder: 2,
  },
];

describe('認証', () => {
  it('未認証の場合、UNAUTHORIZED エラーを返す', async () => {
    await expect(unauthenticatedCaller.task.list()).rejects.toThrow(
      expect.objectContaining({
        code: 'UNAUTHORIZED',
      }),
    );
  });
});

describe('task.list', () => {
  it('タスク一覧を返す', async () => {
    await db.insert(tasks).values(TEST_TASKS);

    const result = await caller.task.list();

    expect(result).toHaveLength(TEST_TASKS.length);
    expect(result).toEqual(
      expect.arrayContaining(
        TEST_TASKS.map((t) => ({
          id: expect.any(String),
          title: t.title,
          status: t.status,
          dailyReportDate: null,
        })),
      ),
    );
  });

  it('日報に紐づくタスクは日報の日付を含む', async () => {
    const [report] = await db
      .insert(dailyReports)
      .values(TEST_DAILY_REPORT)
      .returning();
    await db.insert(tasks).values({
      title: '日報に紐づくタスク',
      status: 'not_started',
      sortOrder: 1,
      dailyReportId: report.id,
    });

    const result = await caller.task.list();

    expect(result).toEqual([
      expect.objectContaining({
        title: '日報に紐づくタスク',
        dailyReportDate: TEST_DAILY_REPORT.date,
      }),
    ]);
  });

  it('タスクが存在しない場合、空配列を返す', async () => {
    const result = await caller.task.list();

    expect(result).toStrictEqual([]);
  });
});
