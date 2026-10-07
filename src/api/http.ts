import { AppError } from '../types/weather';

interface FetchOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

/** fetch + parse JSON, có timeout và chuẩn hoá lỗi thành AppError. */
export async function fetchJson<T>(url: string, opts: FetchOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 12000);
  const onAbort = () => controller.abort();
  opts.signal?.addEventListener('abort', onAbort);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new AppError('server', `HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof AppError) throw e;
    if (opts.signal?.aborted) throw e; // người gọi chủ động huỷ
    if (controller.signal.aborted) throw new AppError('timeout');
    throw new AppError('network');
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onAbort);
  }
}
