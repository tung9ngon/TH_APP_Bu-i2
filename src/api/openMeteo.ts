import { fetchJson } from './http';
import { AppError, CurrentWeather, DayPoint, HourPoint, Place } from '../types/weather';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

const HOURLY_VARS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'pressure_msl',
  'visibility',
  'wind_speed_10m',
  'wind_direction_10m',
  'uv_index',
  'is_day',
].join(',');

const CURRENT_VARS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'weather_code',
  'pressure_msl',
  'wind_speed_10m',
  'wind_direction_10m',
].join(',');

const DAILY_VARS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'sunrise',
  'sunset',
  'uv_index_max',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_direction_10m_dominant',
].join(',');

interface ForecastResponse {
  current: Record<string, any>;
  hourly: Record<string, any[]>;
  daily: Record<string, any[]>;
}

export interface ForecastData {
  current: CurrentWeather;
  hourly: HourPoint[];
  daily: DayPoint[];
  nowIndex: number;
}

export async function fetchForecast(lat: number, lon: number, signal?: AbortSignal): Promise<ForecastData> {
  const url =
    `${FORECAST_URL}?latitude=${lat}&longitude=${lon}` +
    `&current=${CURRENT_VARS}&hourly=${HOURLY_VARS}&daily=${DAILY_VARS}` +
    '&timezone=auto&forecast_days=7';

  const j = await fetchJson<ForecastResponse>(url, { signal });
  const H = j.hourly;
  const D = j.daily;
  const C = j.current;

  if (!H?.time?.length || !D?.time?.length || !C) {
    throw new AppError('empty');
  }

  const hourly: HourPoint[] = H.time.map((time: string, i: number) => ({
    time,
    temp: H.temperature_2m[i],
    feels: H.apparent_temperature[i],
    humidity: H.relative_humidity_2m[i],
    pop: H.precipitation_probability[i] ?? 0,
    precip: H.precipitation[i] ?? 0,
    code: H.weather_code[i],
    isDay: H.is_day[i] === 1,
    pressure: H.pressure_msl[i],
    visibility: (H.visibility[i] ?? 10000) / 1000,
    windSpeed: H.wind_speed_10m[i],
    windDir: H.wind_direction_10m[i],
    uv: H.uv_index[i] ?? 0,
  }));

  const daily: DayPoint[] = D.time.map((date: string, i: number) => ({
    date,
    code: D.weather_code[i],
    max: D.temperature_2m_max[i],
    min: D.temperature_2m_min[i],
    pop: D.precipitation_probability_max[i] ?? 0,
    precipSum: D.precipitation_sum[i] ?? 0,
    uvMax: D.uv_index_max[i] ?? 0,
    windMax: D.wind_speed_10m_max[i] ?? 0,
    windDir: D.wind_direction_10m_dominant[i] ?? 0,
    sunrise: String(D.sunrise[i] ?? '').slice(11, 16),
    sunset: String(D.sunset[i] ?? '').slice(11, 16),
  }));

  const currentHour = String(C.time).slice(0, 13);
  const found = hourly.findIndex(h => h.time.slice(0, 13) === currentHour);
  const nowIndex = found < 0 ? 0 : found;

  const current: CurrentWeather = {
    time: C.time,
    temp: C.temperature_2m,
    feels: C.apparent_temperature,
    humidity: C.relative_humidity_2m,
    isDay: C.is_day === 1,
    precip: C.precipitation ?? 0,
    code: C.weather_code,
    pressure: C.pressure_msl,
    windSpeed: C.wind_speed_10m,
    windDir: C.wind_direction_10m,
    uv: hourly[nowIndex].uv,
    visibility: hourly[nowIndex].visibility,
  };

  return { current, hourly, daily, nowIndex };
}

interface GeocodingResponse {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    country?: string;
  }>;
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<Place[]> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query.trim())}&count=10&language=vi&format=json`;
  const j = await fetchJson<GeocodingResponse>(url, { signal });
  return (j.results ?? []).map(r => ({
    name: r.name,
    sub: [r.admin1, r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lon: r.longitude,
  }));
}
