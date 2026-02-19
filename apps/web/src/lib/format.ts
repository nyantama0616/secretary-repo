// NOTE: tRPC はトランスフォーマー未設定のため、Date は ISO 文字列として届く

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const w = weekdays[date.getDay()];
  return `${y}/${m}/${d}（${w}）`;
};

export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
};
