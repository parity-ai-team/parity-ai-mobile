// 원시 팔레트. 디자인을 교체할 때는 이 값만 바꾼다 — 컴포넌트는 palette가 아니라
// 아래 colors(의미 기반 토큰)만 참조해야 한다.
const palette = {
  white: '#FFFFFF',
  black: '#111111',
  gray50: '#F7F8FA',
  gray100: '#EEF0F3',
  gray200: '#DDE1E6',
  gray400: '#9AA1AC',
  gray600: '#5B6270',
  gray800: '#2B2F38',
  blue500: '#3D5AFE',
  blue600: '#2F46D1',
  red500: '#E5484D',
  amber500: '#F5A524',
  green500: '#2E9E63',
} as const;

// 의미 기반 색상 토큰. severity*는 docs/frontend.md의 위험 심각도
// (info/warning/critical)와 1:1로 대응한다.
export const colors = {
  background: palette.white,
  surface: palette.gray50,
  border: palette.gray200,
  textPrimary: palette.gray800,
  textSecondary: palette.gray600,
  textInverse: palette.white,
  brand: palette.blue500,
  brandPressed: palette.blue600,
  severityInfo: palette.blue500,
  severityWarning: palette.amber500,
  severityCritical: palette.red500,
  success: palette.green500,
  disabledSurface: palette.gray100,
  disabledText: palette.gray400,
  // DataModeBadge 전용 토큰. docs/frontend.md "핵심 UI 컴포넌트": synthetic/
  // verified/assumed를 색+텍스트로 구분한다. severity*와 값을 공유해도 의미가
  // 다르므로(위험도 아님) 별도 키로 둔다.
  dataModeSynthetic: palette.blue500,
  dataModeVerified: palette.green500,
  dataModeAssumed: palette.amber500,
} as const;

export type ColorToken = keyof typeof colors;
