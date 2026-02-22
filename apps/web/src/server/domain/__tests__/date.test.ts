import { describe, expect, it } from 'vitest';

import { addDays, isStartOfMonth, isStartOfWeek, nextMonthStart } from '../date';

describe('isStartOfWeek', () => {
  it('月曜日の場合、true を返す', () => {
    // NOTE: 2026-02-16 は月曜日である
    expect(isStartOfWeek(new Date('2026-02-16'))).toBe(true);
  });

  it('月曜日以外の場合、false を返す', () => {
    // NOTE: 2026-02-17 は火曜日である
    expect(isStartOfWeek(new Date('2026-02-17'))).toBe(false);
  });
});

describe('isStartOfMonth', () => {
  it('月の1日の場合、true を返す', () => {
    expect(isStartOfMonth(new Date('2026-03-01'))).toBe(true);
  });

  it('月の1日以外の場合、false を返す', () => {
    expect(isStartOfMonth(new Date('2026-03-15'))).toBe(false);
  });
});

describe('addDays', () => {
  it('指定した日数を加算した日付を返す', () => {
    const result = addDays(new Date('2026-02-16'), 7);
    expect(result).toEqual(new Date('2026-02-23'));
  });

  it('月をまたぐ加算ができる', () => {
    const result = addDays(new Date('2026-02-25'), 7);
    expect(result).toEqual(new Date('2026-03-04'));
  });

  it('元の日付を変更しない', () => {
    const original = new Date('2026-02-16');
    const originalTime = original.getTime();
    addDays(original, 7);
    expect(original.getTime()).toBe(originalTime);
  });
});

describe('nextMonthStart', () => {
  it('翌月の1日を返す', () => {
    const result = nextMonthStart(new Date('2026-02-01'));
    expect(result).toEqual(new Date('2026-03-01'));
  });

  it('12月の場合、翌年の1月1日を返す', () => {
    const result = nextMonthStart(new Date('2026-12-01'));
    expect(result).toEqual(new Date('2027-01-01'));
  });
});
