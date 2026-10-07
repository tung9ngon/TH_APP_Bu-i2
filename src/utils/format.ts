export const DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const DIRS = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];

export const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export const formatTemp = (v?: number | null) => (v == null || isNaN(v) ? '–' : `${Math.round(v)}°`);

export const windDirName = (deg: number) => DIRS[Math.round((deg || 0) / 45) % 8];

export const uvLevel = (u: number) =>
  u < 3 ? 'Thấp' : u < 6 ? 'Trung bình' : u < 8 ? 'Cao' : u < 11 ? 'Rất cao' : 'Cực cao';

export const visibilityLabel = (km: number) =>
  km >= 10 ? 'Tầm nhìn rõ' : km >= 5 ? 'Tầm nhìn khá' : km >= 2 ? 'Tầm nhìn hạn chế' : 'Tầm nhìn kém';

export const pressureLabel = (p: number) =>
  p < 1005 ? 'Áp thấp — dễ mưa' : p <= 1020 ? 'Bình thường' : 'Áp cao — trời ổn định';

export const windLabel = (kmh: number) =>
  kmh < 2 ? 'Lặng gió' : kmh < 12 ? 'Gió nhẹ' : kmh < 29 ? 'Gió vừa' : kmh < 50 ? 'Gió mạnh' : 'Gió rất mạnh';

export const rainAdvice = (pop: number) =>
  pop >= 60 ? 'Nên mang ô' : pop >= 30 ? 'Có thể có mưa' : 'Ít khả năng mưa';

export const formatVisibility = (km: number) => (km >= 10 ? `${Math.round(km)}` : km.toFixed(1));

/** Công thức Magnus. */
export function dewPoint(t: number, rh: number) {
  const a = 17.27;
  const b = 237.7;
  const g = (a * t) / (b + t) + Math.log(Math.max(rh, 1) / 100);
  return (b * g) / (a - g);
}

/** "2026-10-07" hoặc "2026-10-07T14:00" -> "7/10" */
export const dayMonth = (iso: string) => `${+iso.slice(8, 10)}/${+iso.slice(5, 7)}`;

export const weekdayOf = (iso: string) => DAY_NAMES[new Date(`${iso.slice(0, 10)}T00:00:00`).getDay()];

/** "Hôm nay" / "Ngày mai" / "Thứ Năm" dựa trên ngày đầu tiên của dự báo. */
export function relativeDayName(iso: string, firstDate: string) {
  const d0 = new Date(`${firstDate}T00:00:00`).getTime();
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`).getTime();
  const diff = Math.round((d - d0) / 86400000);
  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return 'Ngày mai';
  return weekdayOf(iso);
}

export const hourOf = (iso: string) => iso.slice(11, 13);
