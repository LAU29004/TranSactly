export const Colors = {
  background: '#111111',
  surface: '#1C1C1C',
  surfaceElevated: '#242424',
  border: '#2A2A2A',

  primary: '#F5C518',
  primaryLight: '#FFD84D',
  primaryDark: '#C9A000',

  textPrimary: '#FFFFFF',
  textSecondary: '#9A9A9A',
  textMuted: '#555555',

  credit: '#4CAF50',
  debit: '#F44336',

  tabBar: '#161616',
  tabBarActive: '#F5C518',
  tabBarInactive: '#555555',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.3 },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.2 },
};