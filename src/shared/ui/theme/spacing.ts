// 4pt 기준 간격 스케일. 컴포넌트는 숫자를 직접 쓰지 않고 이 스케일만 참조한다.
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export type SpacingToken = keyof typeof spacing;
