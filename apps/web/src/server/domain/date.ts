/** 指定した日付が週の開始日かどうかを判定する */
export const isStartOfWeek = (date: Date): boolean =>
  date.getUTCDay() === 1; // NOTE: 週は月曜日に始まる

/** 指定した日付が月の開始日かどうかを判定する */
export const isStartOfMonth = (date: Date): boolean =>
  date.getUTCDate() === 1;

/** 指定した日数を加算した日付を返す */
export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

/** 指定した日付の翌月1日を返す */
export const nextMonthStart = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
