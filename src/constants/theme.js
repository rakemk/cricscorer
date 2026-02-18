// Theme constants - matching original Bootstrap-based styling
export const COLORS = {
  // Primary colors
  primary: '#337ab7',
  primaryDark: '#23527c',
  success: '#5cb85c',
  danger: '#d9534f',
  warning: '#f0ad4e',
  info: '#5bc0de',

  // Cricket-specific colors
  runs: '#28a745',
  wicket: '#dc3545',
  extras: '#ffc107',
  dots: '#6c757d',

  // UI colors
  background: '#f5f5f5',
  card: '#ffffff',
  border: '#ddd',
  text: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  white: '#ffffff',
  black: '#000000',

  // Status colors
  live: '#28a745',
  completed: '#6c757d',
  upcoming: '#17a2b8',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    hero: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
