import { fetchJson } from './http';

interface ReverseResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
}

export async function reverseGeocode(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<{ name: string; sub: string } | null> {
  try {
    const j = await fetchJson<ReverseResponse>(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`,
      { signal, timeoutMs: 6000 },
    );
    const name = j.city || j.locality || j.principalSubdivision;
    if (!name) return null;
    const sub = [j.city ? j.principalSubdivision : undefined, j.countryName].filter(Boolean).join(', ');
    return { name, sub };
  } catch {
    return null;
  }
}
