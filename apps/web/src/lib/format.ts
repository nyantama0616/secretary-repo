export const formatDate = (date: Date): string => {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const w = weekdays[date.getDay()];
  return `${y}/${m}/${d}（${w}）`;
};

export const formatTime = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
};
