import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { fetchForecast } from '../api/openMeteo';
import { reverseGeocode } from '../api/reverseGeocode';
import { AppError, Forecast, Place } from '../types/weather';

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

interface WeatherContextValue {
  forecast: Forecast | null;
  place: Place | null;
  status: LoadStatus;
  error: AppError | null;
  loadPlace: (place: Place) => Promise<void>;
  refresh: () => void;
}

const WeatherContext = createContext<WeatherContextValue | null>(null);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [error, setError] = useState<AppError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadPlace = useCallback(async (target: Place) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setPlace(target);
    setStatus('loading');
    setError(null);

    try {
      const [data, geo] = await Promise.all([
        fetchForecast(target.lat, target.lon, ctrl.signal),
        target.name ? Promise.resolve(null) : reverseGeocode(target.lat, target.lon, ctrl.signal),
      ]);
      if (ctrl.signal.aborted) return;

      const resolved: Place = {
        ...target,
        name: target.name || geo?.name || 'Vị trí hiện tại',
        sub: target.sub || geo?.sub,
      };
      setPlace(resolved);
      setForecast({ ...data, place: resolved, fetchedAt: Date.now() });
      setStatus('success');
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError(e instanceof AppError ? e : new AppError('network'));
      setStatus('error');
    }
  }, []);

  const refresh = useCallback(() => {
    if (place) loadPlace(place);
  }, [place, loadPlace]);

  const value = useMemo(
    () => ({ forecast, place, status, error, loadPlace, refresh }),
    [forecast, place, status, error, loadPlace, refresh],
  );

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather phải được dùng bên trong <WeatherProvider>');
  return ctx;
}
