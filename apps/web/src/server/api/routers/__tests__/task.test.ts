import { describe, expect, it } from 'vitest';

import { createCaller } from '@/server/api';
import { generateId } from '@/server/domain/id';
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
    description: 'tRPC ルーターの実装タスク',
    deadline: new Date('2026-02-20'),
    estimatedMinutes: 60,
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

describe('task.detail', () => {
  it('指定したIDのタスク詳細を返す', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();

    const result = await caller.task.detail({ id: inserted.id });

    expect(result).toStrictEqual({
      id: inserted.id,
      title: TEST_TASKS[0].title,
      description: TEST_TASKS[0].description,
      status: TEST_TASKS[0].status,
      deadline: TEST_TASKS[0].deadline,
      estimatedMinutes: TEST_TASKS[0].estimatedMinutes,
      incompletionReason: null,
      dailyReportDate: null,
      createdAt: expect.any(Date),
    });
  });

  it('日報に紐づくタスクは日報の日付を含む', async () => {
    const [report] = await db
      .insert(dailyReports)
      .values(TEST_DAILY_REPORT)
      .returning();
    const [inserted] = await db
      .insert(tasks)
      .values({
        title: '日報に紐づくタスク',
        status: 'not_started',
        sortOrder: 1,
        dailyReportId: report.id,
      })
      .returning();

    const result = await caller.task.detail({ id: inserted.id });

    expect(result).toEqual(
      expect.objectContaining({
        dailyReportDate: TEST_DAILY_REPORT.date,
      }),
    );
  });

  it('存在しないIDの場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = generateId();

    await expect(
      caller.task.detail({ id: nonExistentId }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('task.update', () => {
  const updateInput = {
    title: '更新後のタイトル',
    description: '更新後の説明',
    deadline: new Date('2026-03-01'),
    estimatedMinutes: 120,
  };

  it('タスクの基本情報を更新する', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();

    await caller.task.update({ id: inserted.id, ...updateInput });

    const updated = await caller.task.detail({ id: inserted.id });
    expect(updated).toEqual(
      expect.objectContaining({
        title: updateInput.title,
        description: updateInput.description,
        deadline: updateInput.deadline,
        estimatedMinutes: updateInput.estimatedMinutes,
      }),
    );
  });

  it('一部のフィールドのみ更新できる', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();

    await caller.task.update({ id: inserted.id, title: '変更後のタイトル' });

    const updated = await caller.task.detail({ id: inserted.id });
    expect(updated).toEqual(
      expect.objectContaining({
        title: '変更後のタイトル',
        description: TEST_TASKS[0].description,
        deadline: TEST_TASKS[0].deadline,
        estimatedMinutes: TEST_TASKS[0].estimatedMinutes,
      }),
    );
  });

  it('存在しないIDの場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = generateId();

    await expect(
      caller.task.update({ id: nonExistentId, title: 'テスト' }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('task.updateStatus', () => {
  it('タスクのステータスが更新される', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();

    await caller.task.updateStatus({
      id: inserted.id,
      status: 'in_progress',
    });

    const updated = await caller.task.detail({ id: inserted.id });
    expect(updated.status).toBe('in_progress');
  });

  it('存在しないIDの場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = generateId();

    await expect(
      caller.task.updateStatus({ id: nonExistentId, status: 'done' }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('task.assignDailyReport', () => {
  it('タスクを日報に紐づける', async () => {
    const [report] = await db
      .insert(dailyReports)
      .values(TEST_DAILY_REPORT)
      .returning();
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();

    await caller.task.assignDailyReport({
      id: inserted.id,
      dailyReportId: report.id,
    });

    const updated = await caller.task.detail({ id: inserted.id });
    expect(updated.dailyReportDate).toStrictEqual(TEST_DAILY_REPORT.date);
  });

  it('dailyReportId に null を渡すと紐づけを解除する', async () => {
    const [report] = await db
      .insert(dailyReports)
      .values(TEST_DAILY_REPORT)
      .returning();
    const [inserted] = await db
      .insert(tasks)
      .values({ ...TEST_TASKS[0], dailyReportId: report.id })
      .returning();

    await caller.task.assignDailyReport({
      id: inserted.id,
      dailyReportId: null,
    });

    const updated = await caller.task.detail({ id: inserted.id });
    expect(updated.dailyReportDate).toBeNull();
  });

  it('タスクが存在しない場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = generateId();

    await expect(
      caller.task.assignDailyReport({
        id: nonExistentId,
        dailyReportId: null,
      }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });

  it('日報が存在しない場合、NOT_FOUND エラーを返す', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();
    const nonExistentId = generateId();

    await expect(
      caller.task.assignDailyReport({
        id: inserted.id,
        dailyReportId: nonExistentId,
      }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('task.delete', () => {
  it('タスクを削除する', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();

    await caller.task.delete({ id: inserted.id });

    await expect(caller.task.detail({ id: inserted.id })).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });

  it('存在しないIDの場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = generateId();

    await expect(
      caller.task.delete({ id: nonExistentId }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});
