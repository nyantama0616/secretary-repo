import { describe, expect, it } from 'vitest';

import { formatTime } from '@/lib/format';

describe('formatTime', () => {
  it('HH:MM 形式で返す', () => {
    expect(formatTime(new Date('2026-02-17T07:05:00'))).toBe('07:05');
  });

  it('baseDate と同じ日付の場合、通常の時刻を返す', () => {
    const baseDate = new Date('2026-02-17');
    expect(formatTime(new Date('2026-02-17T21:30:00'), baseDate)).toBe(
      '21:30',
    );
  });

  it('baseDate の翌日の場合、24時以降の表記で返す', () => {
    const baseDate = new Date('2026-02-17');
    expect(formatTime(new Date('2026-02-18T01:00:00'), baseDate)).toBe(
      '25:00',
    );
  });

  it('date が baseDate より前の場合、エラーを投げる', () => {
    const baseDate = new Date('2026-02-18');
    expect(() => formatTime(new Date('2026-02-17T21:00:00'), baseDate)).toThrow(
      'date は baseDate 以降である必要がある',
    );
  });
});
