import { describe, expect, it } from 'vitest';

import { createCaller } from '@/server/api';
import { db } from '@/server/infrastructure/db/client';
import { dailyReports } from '@/server/infrastructure/db/schema/daily-reports';

const caller = createCaller({});

const TEST_DAILY_REPORTS = [
  {
    date: new Date('2026-02-17'),
    plan: '機能Aの実装を進める',
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
    wakeUpTime: new Date('2026-02-18T06:30:00+09:00'),
    bedTime: null,
    goodPoints: null,
    badPoints: null,
    learnings: null,
    nextActions: null,
    notes: '体調不良のため早退',
  },
];

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
          plan: r.plan,
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
