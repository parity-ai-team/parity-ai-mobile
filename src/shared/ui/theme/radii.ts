// 모서리 반경 스케일.
export const radii = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 20,
  device: 52,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radii;
