export type Tone = 'clear' | 'cloudy' | 'fog' | 'rain' | 'storm' | 'night';

export interface Place {
  name: string;
  sub?: string;
  lat: number;
  lon: number;
  gps?: boolean;
}

export interface CurrentWeather {
  time: string;
  temp: number;
  feels: number;
  humidity: number;
  isDay: boolean;
  precip: number;
  code: number;
  pressure: number;
  windSpeed: number;
  windDir: number;
  uv: number;
  visibility: number; // km
}

export interface HourPoint {
  time: string; // "2026-10-07T14:00" (giờ địa phương)
  temp: number;
  feels: number;
  humidity: number;
  pop: number; // % khả năng mưa
  precip: number; // mm
  code: number;
  isDay: boolean;
  pressure: number;
  visibility: number; // km
  windSpeed: number;
  windDir: number;
  uv: number;
}

export interface DayPoint {
  date: string; // "2026-10-07"
  code: number;
  max: number;
  min: number;
  pop: number;
  precipSum: number;
  uvMax: number;
  windMax: number;
  windDir: number;
  sunrise: string; // "05:58"
  sunset: string;
}

export interface Forecast {
  place: Place;
  current: CurrentWeather;
  hourly: HourPoint[];
  daily: DayPoint[];
  nowIndex: number; // vị trí giờ hiện tại trong mảng hourly
  fetchedAt: number;
}

export type AppErrorType = 'network' | 'timeout' | 'server' | 'empty';

export class AppError extends Error {
  type: AppErrorType;
  constructor(type: AppErrorType, message?: string) {
    super(message ?? type);
    this.type = type;
    this.name = 'AppError';
  }
}
