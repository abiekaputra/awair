export const palette = {
  ink: '#10231E',
  muted: '#62736D',
  canvas: '#F3F7F4',
  surface: '#FFFFFF',
  border: '#DDE8E2',
  primary: '#0B6E4F',
  primaryDark: '#074B38',
  accent: '#C8F169',
  danger: '#B42318',
  warning: '#9A6700',
  info: '#175CD3',
} as const;

export const categoryColors: Record<string, string> = {
  Good: '#16855B',
  Moderate: '#9A6700',
  'Unhealthy for Sensitive Groups': '#B54708',
  Unhealthy: '#B42318',
  'Very Unhealthy': '#7A271A',
  Hazardous: '#581C87',
};
