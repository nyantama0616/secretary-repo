import { describe, expect, it } from 'vitest';

import { createCaller } from '@/server/api';
import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';
import { weeklyReports } from '@/server/infrastructure/db/schema/weekly-reports';

const caller = createCaller({ isAuthenticated: true });
const unauthenticatedCaller = createCaller({ isAuthenticated: false });

const TEST_WEEKLY_REPORTS = [
  {
    startDate: new Date('2026-01-05'),
    goal: 'タスク管理機能の設計を完了する',
    summary: 'タスク管理のDB設計とAPI設計を進めた',
    review: '設計は完了したが、実装に着手できなかった',
    notes: null,
  },
  {
    startDate: new Date('2026-01-12'),
    goal: 'タスク管理機能を実装する',
    summary: null,
    review: null,
    notes: '体調不良で進捗が少なかった',
  },
];

const TEST_DAILY_REPORTS = [
  { date: new Date('2026-01-05') },
  { date: new Date('2026-01-08') },
  { date: new Date('2026-01-12') },
];

describe('認証', () => {
  it('未認証の場合、UNAUTHORIZED エラーを返す', async () => {
    await expect(
      unauthenticatedCaller.weeklyReport.list(),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'UNAUTHORIZED',
      }),
    );
  });
});

describe('weeklyReport.list', () => {
  it('週報一覧を返す', async () => {
    await db.insert(weeklyReports).values(TEST_WEEKLY_REPORTS);

    const result = await caller.weeklyReport.list();

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          startDate: TEST_WEEKLY_REPORTS[0].startDate,
          goal: TEST_WEEKLY_REPORTS[0].goal,
          summary: TEST_WEEKLY_REPORTS[0].summary,
          review: TEST_WEEKLY_REPORTS[0].review,
          notes: TEST_WEEKLY_REPORTS[0].notes,
          createdAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          startDate: TEST_WEEKLY_REPORTS[1].startDate,
          goal: TEST_WEEKLY_REPORTS[1].goal,
          summary: TEST_WEEKLY_REPORTS[1].summary,
          review: TEST_WEEKLY_REPORTS[1].review,
          notes: TEST_WEEKLY_REPORTS[1].notes,
          createdAt: expect.any(Date),
        },
      ]),
    );
  });

  it('週報が存在しない場合、空配列を返す', async () => {
    const result = await caller.weeklyReport.list();

    expect(result).toStrictEqual([]);
  });
});

describe('weeklyReport.detail', () => {
  it('週報の詳細と紐づく日報一覧を返す', async () => {
    const [inserted] = await db
      .insert(weeklyReports)
      .values(TEST_WEEKLY_REPORTS[0])
      .returning();

    const [dr1, dr2] = await db
      .insert(dailyReports)
      .values([TEST_DAILY_REPORTS[0], TEST_DAILY_REPORTS[1]])
      .returning();

    const result = await caller.weeklyReport.detail({ id: inserted.id });

    expect(result).toEqual({
      id: inserted.id,
      startDate: TEST_WEEKLY_REPORTS[0].startDate,
      goal: TEST_WEEKLY_REPORTS[0].goal,
      summary: TEST_WEEKLY_REPORTS[0].summary,
      review: TEST_WEEKLY_REPORTS[0].review,
      notes: TEST_WEEKLY_REPORTS[0].notes,
      createdAt: expect.any(Date),
      dailyReports: expect.arrayContaining([
        { id: dr1.id, date: TEST_DAILY_REPORTS[0].date, summary: null },
        { id: dr2.id, date: TEST_DAILY_REPORTS[1].date, summary: null },
      ]),
    });
    expect(result.dailyReports).toHaveLength(2);
  });

  it('日報が紐づかない場合、dailyReports は空配列を返す', async () => {
    const [inserted] = await db
      .insert(weeklyReports)
      .values(TEST_WEEKLY_REPORTS[0])
      .returning();

    const result = await caller.weeklyReport.detail({ id: inserted.id });

    expect(result.dailyReports).toStrictEqual([]);
  });

  it('存在しない週報の場合、NOT_FOUND エラーを返す', async () => {
    await expect(
      caller.weeklyReport.detail({ id: 'non-existent-id' }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('weeklyReport.create', () => {
  it('目標付きの週報を作成する', async () => {
    const startDate = new Date('2026-02-16');
    const result = await caller.weeklyReport.create({
      startDate,
      goal: '週報機能を完成させる',
    });

    expect(result).toEqual({
      id: expect.any(String),
      startDate,
      goal: '週報機能を完成させる',
      summary: null,
      review: null,
      notes: null,
      createdAt: expect.any(Date),
    });

    const detail = await caller.weeklyReport.detail({ id: result.id });
    expect(detail.id).toBe(result.id);
    expect(detail.startDate).toEqual(startDate);
  });

  it('月曜日以外の日付の場合、BAD_REQUEST エラーを返す', async () => {
    await expect(
      caller.weeklyReport.create({ startDate: new Date('2026-02-18') }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'BAD_REQUEST',
      }),
    );
  });

  it('同じ startDate の週報が既に存在する場合、CONFLICT エラーを返す', async () => {
    const startDate = new Date('2026-02-16');
    await caller.weeklyReport.create({ startDate });

    await expect(
      caller.weeklyReport.create({ startDate }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'CONFLICT',
      }),
    );
  });
});

describe('weeklyReport.review', () => {
  it('週報の振り返りを更新する', async () => {
    const created = await caller.weeklyReport.create({
      startDate: new Date('2026-01-05'),
    });

    const result = await caller.weeklyReport.review({
      id: created.id,
      summary: 'タスク管理機能の設計を進めた',
      review: '設計は完了したが、実装に着手できなかった',
      notes: '来週は実装に集中する',
    });

    expect(result).toEqual({
      id: created.id,
      startDate: new Date('2026-01-05'),
      goal: null,
      summary: 'タスク管理機能の設計を進めた',
      review: '設計は完了したが、実装に着手できなかった',
      notes: '来週は実装に集中する',
      createdAt: expect.any(Date),
    });

    const detail = await caller.weeklyReport.detail({ id: created.id });
    expect(detail.review).toBe('設計は完了したが、実装に着手できなかった');
  });

  it('一部のフィールドだけ更新できる', async () => {
    const created = await caller.weeklyReport.create({
      startDate: new Date('2026-01-05'),
    });

    await caller.weeklyReport.review({
      id: created.id,
      review: '進捗あり',
    });

    const detail = await caller.weeklyReport.detail({ id: created.id });
    expect(detail.review).toBe('進捗あり');
    expect(detail.summary).toBeNull();
  });

  it('存在しない週報の場合、NOT_FOUND エラーを返す', async () => {
    await expect(
      caller.weeklyReport.review({ id: 'non-existent-id' }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});
