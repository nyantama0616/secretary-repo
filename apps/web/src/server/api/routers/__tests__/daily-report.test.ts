import { describe, expect, it } from 'vitest';

import { createCaller } from '@/server/api';
import { generateId } from '@/server/domain/id';
import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';

const caller = createCaller({ isAuthenticated: true });
const unauthenticatedCaller = createCaller({ isAuthenticated: false });

const TEST_DAILY_REPORTS = [
  {
    date: new Date('2026-02-17'),
    goal: '機能Aの実装を進める',
    summary: '機能Aの主要部分を実装し、集中して作業できた',
    wakeUpTime: new Date('2026-02-17T07:00:00+09:00'),
    bedTime: new Date('2026-02-17T23:00:00+09:00'),
    review: '集中して作業できた。休憩を取り忘れたので改善したい。',
    reviewStartedAt: new Date('2026-02-17T21:00:00+09:00'),
    reviewFinishedAt: new Date('2026-02-17T21:15:00+09:00'),
    notes: null,
  },
  {
    date: new Date('2026-02-18'),
    goal: 'テストを書く',
    summary: null,
    wakeUpTime: new Date('2026-02-18T06:30:00+09:00'),
    bedTime: null,
    review: null,
    reviewStartedAt: null,
    reviewFinishedAt: null,
    notes: '体調不良のため早退',
  },
];

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
    await db.insert(dailyReports).values(TEST_DAILY_REPORTS);

    const result = await caller.dailyReport.list();

    expect(result).toHaveLength(TEST_DAILY_REPORTS.length);
    expect(result).toEqual(
      expect.arrayContaining(
        TEST_DAILY_REPORTS.map((r) => ({
          id: expect.any(String),
          date: r.date,
          goal: r.goal,
          summary: r.summary,
          wakeUpTime: r.wakeUpTime,
          bedTime: r.bedTime,
          review: r.review,
          reviewStartedAt: r.reviewStartedAt,
          reviewFinishedAt: r.reviewFinishedAt,
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
    const [inserted] = await db
      .insert(dailyReports)
      .values(testDailyReport)
      .returning();

    const result = await caller.dailyReport.detail({ id: inserted.id });

    expect(result).toEqual({
      id: inserted.id,
      date: testDailyReport.date,
      goal: testDailyReport.goal,
      summary: testDailyReport.summary,
      wakeUpTime: testDailyReport.wakeUpTime,
      bedTime: testDailyReport.bedTime,
      review: testDailyReport.review,
      reviewStartedAt: testDailyReport.reviewStartedAt,
      reviewFinishedAt: testDailyReport.reviewFinishedAt,
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

describe('dailyReport.detailByDate', () => {
  const testDailyReport = TEST_DAILY_REPORTS[0];

  it('指定した日付の日報を返す', async () => {
    await db.insert(dailyReports).values(testDailyReport);

    const result = await caller.dailyReport.detailByDate({
      date: testDailyReport.date,
    });

    expect(result).toEqual({
      id: expect.any(String),
      date: testDailyReport.date,
      goal: testDailyReport.goal,
      summary: testDailyReport.summary,
      wakeUpTime: testDailyReport.wakeUpTime,
      bedTime: testDailyReport.bedTime,
      review: testDailyReport.review,
      reviewStartedAt: testDailyReport.reviewStartedAt,
      reviewFinishedAt: testDailyReport.reviewFinishedAt,
      notes: testDailyReport.notes,
      createdAt: expect.any(Date),
    });
  });

  it('存在しない日付の場合、NOT_FOUND エラーを返す', async () => {
    await expect(
      caller.dailyReport.detailByDate({ date: new Date('2099-01-01') }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('dailyReport.update', () => {
  const updateInput = {
    goal: '更新後の計画',
    summary: '更新後のまとめ',
    wakeUpTime: new Date('2026-02-19T08:00:00+09:00'),
    bedTime: new Date('2026-02-19T00:00:00+09:00'),
    review: '更新後の振り返り',
    reviewStartedAt: new Date('2026-02-19T21:00:00+09:00'),
    reviewFinishedAt: new Date('2026-02-19T21:20:00+09:00'),
    notes: '更新後のメモ',
  };

  it('日報を更新する', async () => {
    const [inserted] = await db
      .insert(dailyReports)
      .values(TEST_DAILY_REPORTS[0])
      .returning();

    const result = await caller.dailyReport.update({
      id: inserted.id,
      ...updateInput,
    });

    expect(result).toEqual({
      id: inserted.id,
      date: TEST_DAILY_REPORTS[0].date,
      goal: updateInput.goal,
      summary: updateInput.summary,
      wakeUpTime: updateInput.wakeUpTime,
      bedTime: updateInput.bedTime,
      review: updateInput.review,
      reviewStartedAt: updateInput.reviewStartedAt,
      reviewFinishedAt: updateInput.reviewFinishedAt,
      notes: updateInput.notes,
      createdAt: expect.any(Date),
    });
  });

  it('一部のフィールドのみ更新できる', async () => {
    const [inserted] = await db
      .insert(dailyReports)
      .values(TEST_DAILY_REPORTS[0])
      .returning();

    const result = await caller.dailyReport.update({
      id: inserted.id,
      summary: '更新後のまとめ',
    });

    expect(result).toEqual({
      id: inserted.id,
      date: TEST_DAILY_REPORTS[0].date,
      goal: TEST_DAILY_REPORTS[0].goal,
      summary: '更新後のまとめ',
      wakeUpTime: TEST_DAILY_REPORTS[0].wakeUpTime,
      bedTime: TEST_DAILY_REPORTS[0].bedTime,
      review: TEST_DAILY_REPORTS[0].review,
      reviewStartedAt: TEST_DAILY_REPORTS[0].reviewStartedAt,
      reviewFinishedAt: TEST_DAILY_REPORTS[0].reviewFinishedAt,
      notes: TEST_DAILY_REPORTS[0].notes,
      createdAt: expect.any(Date),
    });
  });

  it('null を渡すとフィールドをクリアできる', async () => {
    const [inserted] = await db
      .insert(dailyReports)
      .values(TEST_DAILY_REPORTS[0])
      .returning();

    const result = await caller.dailyReport.update({
      id: inserted.id,
      goal: null,
      review: null,
      wakeUpTime: null,
    });

    expect(result).toEqual({
      id: inserted.id,
      date: TEST_DAILY_REPORTS[0].date,
      goal: null,
      summary: TEST_DAILY_REPORTS[0].summary,
      wakeUpTime: null,
      bedTime: TEST_DAILY_REPORTS[0].bedTime,
      review: null,
      reviewStartedAt: TEST_DAILY_REPORTS[0].reviewStartedAt,
      reviewFinishedAt: TEST_DAILY_REPORTS[0].reviewFinishedAt,
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

describe('dailyReport.create', () => {
  const createInput = {
    date: new Date('2026-02-19'),
    goal: '日報作成機能の実装',
    wakeUpTime: new Date('2026-02-19T07:30:00+09:00'),
    notes: '特になし',
  };

  it('日報を作成する', async () => {
    const result = await caller.dailyReport.create(createInput);

    expect(result).toEqual({
      id: expect.any(String),
      date: createInput.date,
      goal: createInput.goal,
      summary: null,
      wakeUpTime: createInput.wakeUpTime,
      bedTime: null,
      review: null,
      reviewStartedAt: null,
      reviewFinishedAt: null,
      notes: createInput.notes,
      createdAt: expect.any(Date),
    });
  });

  it('日付のみで日報を作成できる', async () => {
    const result = await caller.dailyReport.create({
      date: new Date('2026-02-20'),
    });

    expect(result).toEqual({
      id: expect.any(String),
      date: new Date('2026-02-20'),
      goal: null,
      summary: null,
      wakeUpTime: null,
      bedTime: null,
      review: null,
      reviewStartedAt: null,
      reviewFinishedAt: null,
      notes: null,
      createdAt: expect.any(Date),
    });
  });

  it('同じ日付の日報が存在する場合、CONFLICT エラーを返す', async () => {
    await db.insert(dailyReports).values({
      date: createInput.date,
    });

    await expect(
      caller.dailyReport.create(createInput),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'CONFLICT',
      }),
    );
  });
});
