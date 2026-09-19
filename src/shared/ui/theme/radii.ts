// 모서리 반경 스케일.
export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radii;
