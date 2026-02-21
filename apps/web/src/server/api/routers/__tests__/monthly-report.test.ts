import { describe, expect, it } from 'vitest';

import { createCaller } from '@/server/api';
import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';
import { monthlyReports } from '@/server/infrastructure/db/schema/monthly-reports';

const caller = createCaller({ isAuthenticated: true });
const unauthenticatedCaller = createCaller({ isAuthenticated: false });

const TEST_MONTHLY_REPORTS = [
  {
    startDate: new Date('2026-01-01'),
    projectProgress: 'プロジェクトAの主要機能を実装した',
    growthChanges: 'TDDの習慣が身についてきた',
    purposeActionGap: '技術調査に時間を使いすぎた',
    improvements: 'タイムボックスを設定する',
    notes: null,
  },
  {
    startDate: new Date('2026-02-01'),
    projectProgress: null,
    growthChanges: null,
    purposeActionGap: null,
    improvements: null,
    notes: '体調不良で活動量が少なかった',
  },
];

const TEST_DAILY_REPORTS = [
  { date: new Date('2026-01-15') },
  { date: new Date('2026-01-20') },
  { date: new Date('2026-02-10') },
];

describe('認証', () => {
  it('未認証の場合、UNAUTHORIZED エラーを返す', async () => {
    await expect(
      unauthenticatedCaller.monthlyReport.list(),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'UNAUTHORIZED',
      }),
    );
  });
});

describe('monthlyReport.list', () => {
  it('月報一覧を返す', async () => {
    const [inserted1, inserted2] = await db
      .insert(monthlyReports)
      .values(TEST_MONTHLY_REPORTS)
      .returning();

    await db.insert(dailyReports).values([
      { ...TEST_DAILY_REPORTS[0], monthlyReportId: inserted1.id },
      { ...TEST_DAILY_REPORTS[1], monthlyReportId: inserted1.id },
      { ...TEST_DAILY_REPORTS[2], monthlyReportId: inserted2.id },
    ]);

    const result = await caller.monthlyReport.list();

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        {
          id: inserted1.id,
          startDate: TEST_MONTHLY_REPORTS[0].startDate,
          date: TEST_DAILY_REPORTS[0].date,
          projectProgress: TEST_MONTHLY_REPORTS[0].projectProgress,
          growthChanges: TEST_MONTHLY_REPORTS[0].growthChanges,
          purposeActionGap: TEST_MONTHLY_REPORTS[0].purposeActionGap,
          improvements: TEST_MONTHLY_REPORTS[0].improvements,
          notes: TEST_MONTHLY_REPORTS[0].notes,
          createdAt: expect.any(Date),
        },
        {
          id: inserted2.id,
          startDate: TEST_MONTHLY_REPORTS[1].startDate,
          date: TEST_DAILY_REPORTS[2].date,
          projectProgress: TEST_MONTHLY_REPORTS[1].projectProgress,
          growthChanges: TEST_MONTHLY_REPORTS[1].growthChanges,
          purposeActionGap: TEST_MONTHLY_REPORTS[1].purposeActionGap,
          improvements: TEST_MONTHLY_REPORTS[1].improvements,
          notes: TEST_MONTHLY_REPORTS[1].notes,
          createdAt: expect.any(Date),
        },
      ]),
    );
  });

  it('日報が紐づかない月報の date は null を返す', async () => {
    await db.insert(monthlyReports).values(TEST_MONTHLY_REPORTS[0]);

    const result = await caller.monthlyReport.list();

    expect(result).toHaveLength(1);
    expect(result[0].date).toBeNull();
  });

  it('月報が存在しない場合、空配列を返す', async () => {
    const result = await caller.monthlyReport.list();

    expect(result).toStrictEqual([]);
  });
});

describe('monthlyReport.detail', () => {
  it('月報の詳細と紐づく日報一覧を返す', async () => {
    const [inserted] = await db
      .insert(monthlyReports)
      .values(TEST_MONTHLY_REPORTS[0])
      .returning();

    const [dr1, dr2] = await db
      .insert(dailyReports)
      .values([
        { ...TEST_DAILY_REPORTS[0], monthlyReportId: inserted.id },
        { ...TEST_DAILY_REPORTS[1], monthlyReportId: inserted.id },
      ])
      .returning();

    const result = await caller.monthlyReport.detail({ id: inserted.id });

    expect(result).toEqual({
      id: inserted.id,
      startDate: TEST_MONTHLY_REPORTS[0].startDate,
      projectProgress: TEST_MONTHLY_REPORTS[0].projectProgress,
      growthChanges: TEST_MONTHLY_REPORTS[0].growthChanges,
      purposeActionGap: TEST_MONTHLY_REPORTS[0].purposeActionGap,
      improvements: TEST_MONTHLY_REPORTS[0].improvements,
      notes: TEST_MONTHLY_REPORTS[0].notes,
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
      .insert(monthlyReports)
      .values(TEST_MONTHLY_REPORTS[0])
      .returning();

    const result = await caller.monthlyReport.detail({ id: inserted.id });

    expect(result.dailyReports).toStrictEqual([]);
  });

  it('存在しない月報の場合、NOT_FOUND エラーを返す', async () => {
    await expect(
      caller.monthlyReport.detail({ id: 'non-existent-id' }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('monthlyReport.create', () => {
  it('空の月報を作成する', async () => {
    const startDate = new Date('2026-03-01');
    const result = await caller.monthlyReport.create({ startDate });

    expect(result).toEqual({
      id: expect.any(String),
      startDate,
      projectProgress: null,
      growthChanges: null,
      purposeActionGap: null,
      improvements: null,
      notes: null,
      createdAt: expect.any(Date),
    });

    const detail = await caller.monthlyReport.detail({ id: result.id });
    expect(detail.id).toBe(result.id);
    expect(detail.startDate).toEqual(startDate);
  });

  it('1日以外の日付の場合、BAD_REQUEST エラーを返す', async () => {
    await expect(
      caller.monthlyReport.create({ startDate: new Date('2026-03-15') }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'BAD_REQUEST',
      }),
    );
  });

  it('同じ startDate の月報が既に存在する場合、CONFLICT エラーを返す', async () => {
    const startDate = new Date('2026-03-01');
    await caller.monthlyReport.create({ startDate });

    await expect(
      caller.monthlyReport.create({ startDate }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'CONFLICT',
      }),
    );
  });
});

describe('monthlyReport.review', () => {
  it('月報の振り返りを更新する', async () => {
    const created = await caller.monthlyReport.create({
      startDate: new Date('2026-01-01'),
    });

    const result = await caller.monthlyReport.review({
      id: created.id,
      projectProgress: 'プロジェクトAの主要機能を実装した',
      growthChanges: 'TDDの習慣が身についてきた',
      purposeActionGap: '技術調査に時間を使いすぎた',
      improvements: 'タイムボックスを設定する',
      notes: '特になし',
    });

    expect(result).toEqual({
      id: created.id,
      startDate: new Date('2026-01-01'),
      projectProgress: 'プロジェクトAの主要機能を実装した',
      growthChanges: 'TDDの習慣が身についてきた',
      purposeActionGap: '技術調査に時間を使いすぎた',
      improvements: 'タイムボックスを設定する',
      notes: '特になし',
      createdAt: expect.any(Date),
    });

    const detail = await caller.monthlyReport.detail({ id: created.id });
    expect(detail.projectProgress).toBe('プロジェクトAの主要機能を実装した');
  });

  it('一部のフィールドだけ更新できる', async () => {
    const created = await caller.monthlyReport.create({
      startDate: new Date('2026-01-01'),
    });

    await caller.monthlyReport.review({
      id: created.id,
      projectProgress: '進捗あり',
    });

    const detail = await caller.monthlyReport.detail({ id: created.id });
    expect(detail.projectProgress).toBe('進捗あり');
    expect(detail.growthChanges).toBeNull();
  });

  it('存在しない月報の場合、NOT_FOUND エラーを返す', async () => {
    await expect(
      caller.monthlyReport.review({ id: 'non-existent-id' }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('monthlyReport.delete', () => {
  it('月報を削除する', async () => {
    const created = await caller.monthlyReport.create({
      startDate: new Date('2026-01-01'),
    });

    await caller.monthlyReport.delete({ id: created.id });

    await expect(
      caller.monthlyReport.detail({ id: created.id }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });

  // NOTE: カスケード動作は本来 Infrastructure 層の責務だが、
  // 紐づく日報が意図通り削除されることはデータ整合性上重要なため例外的に検証する
  it('月報を削除すると、紐づいていた日報も削除される', async () => {
    const created = await caller.monthlyReport.create({
      startDate: new Date('2026-01-01'),
    });

    const [dr] = await db
      .insert(dailyReports)
      .values({ date: TEST_DAILY_REPORTS[0].date, monthlyReportId: created.id })
      .returning();

    await caller.monthlyReport.delete({ id: created.id });

    await expect(
      caller.dailyReport.detail({ id: dr.id }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });

  it('存在しない月報の場合、NOT_FOUND エラーを返す', async () => {
    await expect(
      caller.monthlyReport.delete({ id: 'non-existent-id' }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});
