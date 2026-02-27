import { describe, expect, it } from 'vitest';

import { createCaller } from '@/server/api';
import { generateId } from '@/server/domain/id';
import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';
import { projects } from '@/server/infrastructure/db/schema/projects';
import { tasks } from '@/server/infrastructure/db/schema/tasks';

const caller = createCaller({ isAuthenticated: true });
const unauthenticatedCaller = createCaller({ isAuthenticated: false });

const TEST_DAILY_REPORT = {
  date: new Date('2026-02-17'),
};

const TEST_PROJECT = {
  name: 'secretary-repo 開発',
  purpose: 'AI を活用した日報・タスク管理アプリを作る',
  status: 'active' as const,
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

const CREATE_TASK_INPUT = {
  title: '新しいタスク',
  description: 'タスクの説明',
  deadline: new Date('2026-03-01'),
  estimatedMinutes: 90,
  firstAction: 'エディタを開いてファイルを作成する',
};

describe('task.create', () => {
  it('タスクを作成し、一覧に表示される', async () => {
    const result = await caller.task.create(CREATE_TASK_INPUT);

    expect(result).toStrictEqual({
      id: expect.any(String),
      dailyReportId: null,
      projectId: null,
      title: CREATE_TASK_INPUT.title,
      description: CREATE_TASK_INPUT.description,
      status: 'not_started',
      sortOrder: 0,
      deadline: CREATE_TASK_INPUT.deadline,
      estimatedMinutes: CREATE_TASK_INPUT.estimatedMinutes,
      incompletionReason: null,
      firstAction: CREATE_TASK_INPUT.firstAction,
      notes: null,
      carriedOverFromId: null,
      createdAt: expect.any(Date),
    });

    const list = await caller.task.list();
    expect(list).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: CREATE_TASK_INPUT.title }),
      ]),
    );
  });

  it('タイトルのみでタスクを作成できる', async () => {
    const result = await caller.task.create({
      title: CREATE_TASK_INPUT.title,
    });

    expect(result).toStrictEqual({
      id: expect.any(String),
      dailyReportId: null,
      projectId: null,
      title: CREATE_TASK_INPUT.title,
      description: null,
      status: 'not_started',
      sortOrder: 0,
      deadline: null,
      estimatedMinutes: null,
      incompletionReason: null,
      firstAction: null,
      notes: null,
      carriedOverFromId: null,
      createdAt: expect.any(Date),
    });
  });

  it('projectId を指定してプロジェクトに紐づける', async () => {
    const [project] = await db
      .insert(projects)
      .values(TEST_PROJECT)
      .returning();

    const result = await caller.task.create({
      title: CREATE_TASK_INPUT.title,
      projectId: project.id,
    });

    const detail = await caller.task.detail({ id: result.id });
    expect(detail.project).toStrictEqual({
      id: project.id,
      name: TEST_PROJECT.name,
    });
  });

  it('dailyReportId を指定して日報に紐づける', async () => {
    const [report] = await db
      .insert(dailyReports)
      .values(TEST_DAILY_REPORT)
      .returning();

const result = await caller.task.create({
      title: CREATE_TASK_INPUT.title,
      dailyReportId: report.id,
    });

    const detail = await caller.task.detail({ id: result.id });
    expect(detail.dailyReportDate).toStrictEqual(TEST_DAILY_REPORT.date);
  });

  it('存在しない日報の場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = generateId();

    await expect(
    caller.task.create({
        title: CREATE_TASK_INPUT.title,
        dailyReportId: nonExistentId,
      }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });

  it('存在しないプロジェクトの場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = generateId();

    await expect(
      caller.task.create({
        title: CREATE_TASK_INPUT.title,
        projectId: nonExistentId,
      }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
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

  it('dailyReportId でフィルタリングできる', async () => {
    const [report] = await db
      .insert(dailyReports)
      .values(TEST_DAILY_REPORT)
      .returning();
    await db.insert(tasks).values([
      {
        title: '日報に紐づくタスク',
        status: 'not_started',
        sortOrder: 1,
        dailyReportId: report.id,
      },
      {
        title: '日報に紐づかないタスク',
        status: 'not_started',
        sortOrder: 2,
      },
    ]);

const result = await caller.task.list({ dailyReportId: report.id });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({ title: '日報に紐づくタスク' }),
    );
  });

  it('statuses でフィルタリングできる', async () => {
    await db.insert(tasks).values(TEST_TASKS);

const result = await caller.task.list({ statuses: ['done'] });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({ title: 'テストを書く', status: 'done' }),
    );
  });

  it('dailyReportId と statuses を組み合わせてフィルタリングできる', async () => {
    const [report] = await db
      .insert(dailyReports)
      .values(TEST_DAILY_REPORT)
      .returning();
    await db.insert(tasks).values([
      {
        title: '未着手タスク',
        status: 'not_started',
        sortOrder: 1,
        dailyReportId: report.id,
      },
      {
        title: '完了タスク',
        status: 'done',
        sortOrder: 2,
        dailyReportId: report.id,
      },
      {
        title: '別の日報のタスク',
        status: 'not_started',
        sortOrder: 3,
      },
    ]);

const result = await caller.task.list({
      dailyReportId: report.id,
      statuses: ['not_started'],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({ title: '未着手タスク' }),
    );
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
      firstAction: null,
      notes: null,
      dailyReportDate: null,
      project: null,
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

  it('プロジェクトに紐づくタスクはプロジェクト情報を含む', async () => {
    const [project] = await db
      .insert(projects)
      .values(TEST_PROJECT)
      .returning();
    const [inserted] = await db
      .insert(tasks)
      .values({ ...TEST_TASKS[0], projectId: project.id })
      .returning();

    const result = await caller.task.detail({ id: inserted.id });

    expect(result).toEqual(
      expect.objectContaining({
        project: { id: project.id, name: TEST_PROJECT.name },
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
    firstAction: '更新後の最初の一手',
    notes: '調査した結果、APIの仕様変更が必要',
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
        firstAction: updateInput.firstAction,
        notes: updateInput.notes,
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

  it('projectId を指定してプロジェクトに紐づける', async () => {
    const [project] = await db
      .insert(projects)
      .values(TEST_PROJECT)
      .returning();
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();

    await caller.task.update({ id: inserted.id, projectId: project.id });

    const updated = await caller.task.detail({ id: inserted.id });
    expect(updated.project).toStrictEqual({
      id: project.id,
      name: TEST_PROJECT.name,
    });
  });

  it('projectId に null を渡すと紐づけを解除する', async () => {
    const [project] = await db
      .insert(projects)
      .values(TEST_PROJECT)
      .returning();
    const [inserted] = await db
      .insert(tasks)
      .values({ ...TEST_TASKS[0], projectId: project.id })
      .returning();

    await caller.task.update({ id: inserted.id, projectId: null });

    const updated = await caller.task.detail({ id: inserted.id });
    expect(updated.project).toBeNull();
  });

  it('未達成の理由を更新する', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();

    await caller.task.update({
      id: inserted.id,
      incompletionReason: '仕様変更により不要になった',
    });

    const updated = await caller.task.detail({ id: inserted.id });
    expect(updated.incompletionReason).toBe('仕様変更により不要になった');
  });

  it('存在しないプロジェクトの場合、NOT_FOUND エラーを返す', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();
    const nonExistentId = generateId();

    await expect(
      caller.task.update({ id: inserted.id, projectId: nonExistentId }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
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

  it('ステータス更新と同時に未達成の理由を設定する', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();

    await caller.task.updateStatus({
      id: inserted.id,
      status: 'cancelled',
      incompletionReason: '優先度が下がったため',
    });

    const updated = await caller.task.detail({ id: inserted.id });
    expect(updated.status).toBe('cancelled');
    expect(updated.incompletionReason).toBe('優先度が下がったため');
  });

  it('deferred を指定した場合、BAD_REQUEST エラーを返す', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();

    await expect(
      // @ts-expect-error -- 型レベルでは除外済みだが、ランタイムのバリデーションを検証する
      caller.task.updateStatus({ id: inserted.id, status: 'deferred' }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'BAD_REQUEST',
      }),
    );
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

describe('task.reorder', () => {
  it('タスクの並び順を更新する', async () => {
    const inserted = await db
      .insert(tasks)
      .values(TEST_TASKS)
      .returning();
    const [first, second] = inserted;

await caller.task.reorder({ taskIds: [second.id, first.id] });

    // NOTE: list は sortOrder 順で返すため、並び順の変更を検証できる
    const list = await caller.task.list();
    expect(list[0].id).toBe(second.id);
    expect(list[1].id).toBe(first.id);
  });

  it('存在しないタスクIDが含まれる場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = generateId();

    await expect(
    caller.task.reorder({ taskIds: [nonExistentId] }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('task.defer', () => {
  it('タスクを延期し、複製先タスクが作成される', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();

    const deferred = await caller.task.defer({ id: inserted.id });

    expect(deferred).toEqual(
      expect.objectContaining({
        title: TEST_TASKS[0].title,
        description: TEST_TASKS[0].description,
        status: 'not_started',
        carriedOverFromId: inserted.id,
      }),
    );

    const original = await caller.task.detail({ id: inserted.id });
    expect(original.status).toBe('deferred');
  });

  it('延期時に未達成の理由を設定できる', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values(TEST_TASKS[0])
      .returning();

    await caller.task.defer({
      id: inserted.id,
      incompletionReason: '時間が足りなかった',
    });

    const original = await caller.task.detail({ id: inserted.id });
    expect(original.incompletionReason).toBe('時間が足りなかった');
  });

  it('完了済みタスクの場合、BAD_REQUEST エラーを返す', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values({ ...TEST_TASKS[0], status: 'done' })
      .returning();

    await expect(
      caller.task.defer({ id: inserted.id }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'BAD_REQUEST',
      }),
    );
  });

  it('中止済みタスクの場合、BAD_REQUEST エラーを返す', async () => {
    const [inserted] = await db
      .insert(tasks)
      .values({ ...TEST_TASKS[0], status: 'cancelled' })
      .returning();

    await expect(
      caller.task.defer({ id: inserted.id }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'BAD_REQUEST',
      }),
    );
  });

  it('存在しないIDの場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = generateId();

    await expect(
      caller.task.defer({ id: nonExistentId }),
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
