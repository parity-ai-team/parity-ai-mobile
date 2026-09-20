// 모서리 반경 스케일.
export const radii = {
  none: 0,
  sm: 4,
  md: 12,
  lg: 24,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radii;
