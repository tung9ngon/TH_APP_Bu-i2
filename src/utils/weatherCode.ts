import { Tone } from '../types/weather';

export interface WeatherInfo {
  label: string;
  icon: string; // tên icon MaterialCommunityIcons
  color: string;
  tone: Tone;
}

const SUN = '#eab308';
const MOON = '#8183f4';
const CLOUD = '#9fa9b7';
const RAIN = '#3b82f6';
const STORM = '#a855f7';

const RAIN_LABELS: Record<number, string> = {
  61: 'Mưa nhẹ',
  63: 'Mưa vừa',
  65: 'Mưa to',
  66: 'Mưa lạnh',
  67: 'Mưa lạnh',
  80: 'Mưa rào nhẹ',
  81: 'Mưa rào',
  82: 'Mưa rào rất to',
};

/** Ánh xạ mã WMO (Open-Meteo) sang nhãn tiếng Việt + icon + tông màu nền. */
export function getWeatherInfo(code: number, isDay = true): WeatherInfo {
  if (code === 0) {
    return { label: 'Trời quang', icon: isDay ? 'weather-sunny' : 'weather-night', color: isDay ? SUN : MOON, tone: 'clear' };
  }
  if (code === 1 || code === 2) {
    return {
      label: code === 1 ? 'Ít mây' : 'Mây rải rác',
      icon: isDay ? 'weather-partly-cloudy' : 'weather-night-partly-cloudy',
      color: isDay ? '#eec337' : MOON,
      tone: 'clear',
    };
  }
  if (code === 3) return { label: 'Nhiều mây', icon: 'weather-cloudy', color: CLOUD, tone: 'cloudy' };
  if (code === 45 || code === 48) return { label: 'Sương mù', icon: 'weather-fog', color: CLOUD, tone: 'fog' };
  if (code >= 51 && code <= 57) return { label: 'Mưa phùn', icon: 'weather-rainy', color: RAIN, tone: 'rain' };
  if (RAIN_LABELS[code]) {
    const heavy = code === 65 || code === 82;
    return { label: RAIN_LABELS[code], icon: heavy ? 'weather-pouring' : 'weather-rainy', color: RAIN, tone: 'rain' };
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return { label: 'Có tuyết', icon: 'weather-snowy', color: '#85b2f9', tone: 'cloudy' };
  }
  if (code >= 95) {
    return {
      label: code === 95 ? 'Dông' : 'Dông kèm mưa đá',
      icon: code === 95 ? 'weather-lightning-rainy' : 'weather-hail',
      color: STORM,
      tone: 'storm',
    };
  }
  return { label: 'Không xác định', icon: 'weather-cloudy', color: CLOUD, tone: 'cloudy' };
}

/** Ban đêm, trời quang/nhiều mây -> dùng nền "night". */
export function getTone(code: number, isDay: boolean): Tone {
  const { tone } = getWeatherInfo(code, isDay);
  return !isDay && (tone === 'clear' || tone === 'cloudy') ? 'night' : tone;
}
