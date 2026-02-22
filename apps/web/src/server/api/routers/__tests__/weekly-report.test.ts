import { describe, expect, it } from 'vitest';

import { createCaller } from '@/server/api';
import { db } from '@/server/infrastructure/db/client';
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
