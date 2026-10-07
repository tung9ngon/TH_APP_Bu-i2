import { Tone } from '../types/weather';

export const colors = {
  bg: '#eff3f8',
  card: '#ffffff',
  text: '#111827',
  textBody: '#374151',
  textMuted: '#6b7280',
  textFaint: '#9ca3af',
  border: '#e5e7eb',
  divider: '#f3f4f6',
  surface: '#f9fafb',
  primary: '#3b82f6',
  primaryDark: '#326fd1',
  primarySoft: '#f5f9ff',
  primaryTint: '#d0e1fd',
  rain: '#326fd1',
  orange: '#f97316',
  cyan: '#06b6d3',
  teal: '#14b8a6',
  yellow: '#eab308',
  indigo: '#6366f1',
  slate: '#64748b',
  red: '#d9342b',
  redSoft: '#fff5f5',
  warnBg: '#fff8f3',
  warnBorder: '#feddc7',
  warnText: '#893f0c',
};

export const heroGradients: Record<Tone, string[]> = {
  clear: ['#326fd1', '#3b82f6', '#609af7'],
  cloudy: ['#465161', '#64748b', '#818ea1'],
  fog: ['#556376', '#818ea1'],
  rain: ['#204887', '#295bac', '#556376'],
  storm: ['#282d33', '#363885'],
  night: ['#183462', '#282960'],
};

export const tempRange = ['#85b2f9', '#fba86f'];
export const uvRange = ['#22c55e', '#eab308', '#f97316', '#ff3d32', '#a855f7'];

export const radius = { sm: 10, md: 12, lg: 20, xl: 28 };
export const shadow = {
  shadowColor: '#111827',
  shadowOpacity: 0.05,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};
