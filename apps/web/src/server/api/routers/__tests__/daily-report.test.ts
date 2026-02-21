import { describe, expect, it } from 'vitest';

import { createCaller } from '@/server/api';
import { generateId } from '@/server/domain/id';
import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';
import { monthlyReports } from '@/server/infrastructure/db/schema/monthly-reports';
import { tasks } from '@/server/infrastructure/db/schema/tasks';

const caller = createCaller({ isAuthenticated: true });
const unauthenticatedCaller = createCaller({ isAuthenticated: false });

const TEST_DAILY_REPORTS = [
  {
    date: new Date('2026-02-17'),
    plan: '機能Aの実装を進める',
    summary: '機能Aの主要部分を実装し、集中して作業できた',
    wakeUpTime: new Date('2026-02-17T07:00:00+09:00'),
    bedTime: new Date('2026-02-17T23:00:00+09:00'),
    goodPoints: '集中して作業できた',
    badPoints: '休憩を取り忘れた',
    learnings: 'ポモドーロテクニックを試してみたい',
    nextActions: '明日はテストを書く',
    notes: null,
  },
  {
    date: new Date('2026-02-18'),
    plan: 'テストを書く',
    summary: null,
    wakeUpTime: new Date('2026-02-18T06:30:00+09:00'),
    bedTime: null,
    goodPoints: null,
    badPoints: null,
    learnings: null,
    nextActions: null,
    notes: '体調不良のため早退',
  },
];

const createTestMonthlyReport = async () => {
  const [mr] = await db.insert(monthlyReports).values({}).returning();
  return mr;
};

describe('認証', () => {
  it('未認証の場合、UNAUTHORIZED エラーを返す', async () => {
    await expect(unauthenticatedCaller.dailyReport.list()).rejects.toThrow(
      expect.objectContaining({
        code: 'UNAUTHORIZED',
      }),
    );
  });
});

describe('dailyReport.list', () => {
  it('日報一覧を返す', async () => {
    const mr = await createTestMonthlyReport();
    await db
      .insert(dailyReports)
      .values(
        TEST_DAILY_REPORTS.map((r) => ({ ...r, monthlyReportId: mr.id })),
      );

    const result = await caller.dailyReport.list();

    expect(result).toHaveLength(TEST_DAILY_REPORTS.length);
    expect(result).toEqual(
      expect.arrayContaining(
        TEST_DAILY_REPORTS.map((r) => ({
          id: expect.any(String),
          date: r.date,
          monthlyReportId: mr.id,
          plan: r.plan,
          summary: r.summary,
          wakeUpTime: r.wakeUpTime,
          bedTime: r.bedTime,
          goodPoints: r.goodPoints,
          badPoints: r.badPoints,
          learnings: r.learnings,
          nextActions: r.nextActions,
          notes: r.notes,
          createdAt: expect.any(Date),
        })),
      ),
    );
  });

  it('日報が存在しない場合、空配列を返す', async () => {
    const result = await caller.dailyReport.list();

    expect(result).toStrictEqual([]);
  });
});

describe('dailyReport.detail', () => {
  const testDailyReport = TEST_DAILY_REPORTS[0];

  it('指定したIDの日報を返す', async () => {
    const mr = await createTestMonthlyReport();
    const [inserted] = await db
      .insert(dailyReports)
      .values({ ...testDailyReport, monthlyReportId: mr.id })
      .returning();

    const result = await caller.dailyReport.detail({ id: inserted.id });

    expect(result).toStrictEqual({
      id: inserted.id,
      date: testDailyReport.date,
      monthlyReportId: mr.id,
      plan: testDailyReport.plan,
      summary: testDailyReport.summary,
      wakeUpTime: testDailyReport.wakeUpTime,
      bedTime: testDailyReport.bedTime,
      goodPoints: testDailyReport.goodPoints,
      badPoints: testDailyReport.badPoints,
      learnings: testDailyReport.learnings,
      nextActions: testDailyReport.nextActions,
      notes: testDailyReport.notes,
      createdAt: expect.any(Date),
    });
  });

  it('存在しないIDの場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = generateId();

    await expect(
      caller.dailyReport.detail({ id: nonExistentId }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('dailyReport.update', () => {
  const updateInput = {
    plan: '更新後の計画',
    summary: '更新後のまとめ',
    wakeUpTime: new Date('2026-02-19T08:00:00+09:00'),
    bedTime: new Date('2026-02-19T00:00:00+09:00'),
    goodPoints: '更新後のよかったこと',
    badPoints: '更新後の改善点',
    learnings: '更新後の学び',
    nextActions: '更新後のネクストアクション',
    notes: '更新後のメモ',
  };

  it('日報を更新する', async () => {
    const mr = await createTestMonthlyReport();
    const [inserted] = await db
      .insert(dailyReports)
      .values({ ...TEST_DAILY_REPORTS[0], monthlyReportId: mr.id })
      .returning();

    const result = await caller.dailyReport.update({
      id: inserted.id,
      ...updateInput,
    });

    expect(result).toStrictEqual({
      id: inserted.id,
      date: TEST_DAILY_REPORTS[0].date,
      monthlyReportId: mr.id,
      plan: updateInput.plan,
      summary: updateInput.summary,
      wakeUpTime: updateInput.wakeUpTime,
      bedTime: updateInput.bedTime,
      goodPoints: updateInput.goodPoints,
      badPoints: updateInput.badPoints,
      learnings: updateInput.learnings,
      nextActions: updateInput.nextActions,
      notes: updateInput.notes,
      createdAt: expect.any(Date),
    });
  });

  it('一部のフィールドのみ更新できる', async () => {
    const mr = await createTestMonthlyReport();
    const [inserted] = await db
      .insert(dailyReports)
      .values({ ...TEST_DAILY_REPORTS[0], monthlyReportId: mr.id })
      .returning();

    const result = await caller.dailyReport.update({
      id: inserted.id,
      summary: '更新後のまとめ',
    });

    expect(result).toStrictEqual({
      id: inserted.id,
      date: TEST_DAILY_REPORTS[0].date,
      monthlyReportId: mr.id,
      plan: TEST_DAILY_REPORTS[0].plan,
      summary: '更新後のまとめ',
      wakeUpTime: TEST_DAILY_REPORTS[0].wakeUpTime,
      bedTime: TEST_DAILY_REPORTS[0].bedTime,
      goodPoints: TEST_DAILY_REPORTS[0].goodPoints,
      badPoints: TEST_DAILY_REPORTS[0].badPoints,
      learnings: TEST_DAILY_REPORTS[0].learnings,
      nextActions: TEST_DAILY_REPORTS[0].nextActions,
      notes: TEST_DAILY_REPORTS[0].notes,
      createdAt: expect.any(Date),
    });
  });

  it('存在しないIDの場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = generateId();

    await expect(
      caller.dailyReport.update({ id: nonExistentId, summary: 'テスト' }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('dailyReport.delete', () => {
  it('日報を削除する', async () => {
    const mr = await createTestMonthlyReport();
    const [inserted] = await db
      .insert(dailyReports)
      .values({ ...TEST_DAILY_REPORTS[0], monthlyReportId: mr.id })
      .returning();

    await caller.dailyReport.delete({ id: inserted.id });

    const result = await caller.dailyReport.list();
    expect(result).toHaveLength(0);
  });

  it('紐づくタスクの dailyReportId が null になる', async () => {
    const mr = await createTestMonthlyReport();
    const [inserted] = await db
      .insert(dailyReports)
      .values({ ...TEST_DAILY_REPORTS[0], monthlyReportId: mr.id })
      .returning();
    await db.insert(tasks).values({
      title: 'テストタスク',
      dailyReportId: inserted.id,
      sortOrder: 0,
    });

    await caller.dailyReport.delete({ id: inserted.id });

    const result = await caller.task.list();
    expect(result).toHaveLength(1);
    expect(result[0].dailyReportDate).toBeNull();
  });

  it('存在しないIDの場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = generateId();

    await expect(
      caller.dailyReport.delete({ id: nonExistentId }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('dailyReport.create', () => {
  const createInput = {
    date: new Date('2026-02-19'),
    plan: '日報作成機能の実装',
    wakeUpTime: new Date('2026-02-19T07:30:00+09:00'),
    notes: '特になし',
  };

  it('日報を作成する', async () => {
    const mr = await createTestMonthlyReport();

    const result = await caller.dailyReport.create({
      ...createInput,
      monthlyReportId: mr.id,
    });

    expect(result).toStrictEqual({
      id: expect.any(String),
      date: createInput.date,
      monthlyReportId: mr.id,
      plan: createInput.plan,
      summary: null,
      wakeUpTime: createInput.wakeUpTime,
      bedTime: null,
      goodPoints: null,
      badPoints: null,
      learnings: null,
      nextActions: null,
      notes: createInput.notes,
      createdAt: expect.any(Date),
    });
  });

  it('日付と月報IDのみで日報を作成できる', async () => {
    const mr = await createTestMonthlyReport();

    const result = await caller.dailyReport.create({
      date: new Date('2026-02-20'),
      monthlyReportId: mr.id,
    });

    expect(result).toStrictEqual({
      id: expect.any(String),
      date: new Date('2026-02-20'),
      monthlyReportId: mr.id,
      plan: null,
      summary: null,
      wakeUpTime: null,
      bedTime: null,
      goodPoints: null,
      badPoints: null,
      learnings: null,
      nextActions: null,
      notes: null,
      createdAt: expect.any(Date),
    });
  });

  it('同じ日付の日報が存在する場合、CONFLICT エラーを返す', async () => {
    const mr = await createTestMonthlyReport();
    await db.insert(dailyReports).values({
      date: createInput.date,
      monthlyReportId: mr.id,
    });

    await expect(
      caller.dailyReport.create({
        ...createInput,
        monthlyReportId: mr.id,
      }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'CONFLICT',
      }),
    );
  });

  it('月報が存在しない場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = generateId();

    await expect(
      caller.dailyReport.create({
        ...createInput,
        monthlyReportId: nonExistentId,
      }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});
