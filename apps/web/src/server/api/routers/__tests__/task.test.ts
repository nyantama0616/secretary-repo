import { describe, expect, it } from 'vitest';

import { createCaller } from '@/server/api';
import { db } from '@/server/infrastructure/db/client';
import { tasks } from '@/server/infrastructure/db/schema/tasks';

const caller = createCaller({ isAuthenticated: true });
const unauthenticatedCaller = createCaller({ isAuthenticated: false });

const TEST_TASKS = [
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
    description: null,
    status: 'done' as const,
    sortOrder: 2,
    deadline: null,
    estimatedMinutes: null,
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
          dailyReportId: null,
          title: t.title,
          description: t.description,
          status: t.status,
          sortOrder: t.sortOrder,
          deadline: t.deadline,
          estimatedMinutes: t.estimatedMinutes,
          incompletionReason: null,
          createdAt: expect.any(Date),
        })),
      ),
    );
  });

  it('タスクが存在しない場合、空配列を返す', async () => {
    const result = await caller.task.list();

    expect(result).toStrictEqual([]);
  });
});
