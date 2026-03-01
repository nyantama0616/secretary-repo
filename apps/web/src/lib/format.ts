export const formatDate = (date: Date): string => {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const w = weekdays[date.getDay()];
  return `${y}/${m}/${d}（${w}）`;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const formatTime = (date: Date, baseDate?: Date): string => {
  const diffDays = baseDate
    ? Math.floor(
        (startOfDay(date).getTime() - startOfDay(baseDate).getTime()) /
          MS_PER_DAY,
      )
    : 0;
  if (diffDays < 0) {
    throw new Error('date は baseDate 以降である必要がある');
  }
  const h = date.getHours() + diffDays * 24;
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${String(h).padStart(2, '0')}:${min}`;
};

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatMonth = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}年${m}月`;
};

export const formatWeekRange = (startDate: Date): string => {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const endDate = new Date(startDate.getTime() + 6 * MS_PER_DAY);

  const sy = startDate.getFullYear();
  const sm = String(startDate.getMonth() + 1).padStart(2, '0');
  const sd = String(startDate.getDate()).padStart(2, '0');
  const sw = weekdays[startDate.getDay()];

  const em = String(endDate.getMonth() + 1).padStart(2, '0');
  const ed = String(endDate.getDate()).padStart(2, '0');
  const ew = weekdays[endDate.getDay()];

  return `${sy}/${sm}/${sd}（${sw}）〜 ${em}/${ed}（${ew}）`;
};

export const toDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
