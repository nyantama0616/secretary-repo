import { describe, expect, it } from 'vitest';

import { createCaller } from '@/server/api';
import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';
import { monthlyReports } from '@/server/infrastructure/db/schema/monthly-reports';

const caller = createCaller({ isAuthenticated: true });
const unauthenticatedCaller = createCaller({ isAuthenticated: false });

const TEST_MONTHLY_REPORTS = [
  {
    projectProgress: 'プロジェクトAの主要機能を実装した',
    growthChanges: 'TDDの習慣が身についてきた',
    purposeActionGap: '技術調査に時間を使いすぎた',
    improvements: 'タイムボックスを設定する',
    notes: null,
  },
  {
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
