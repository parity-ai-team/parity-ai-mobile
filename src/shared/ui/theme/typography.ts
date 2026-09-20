// docs/frontend.md 접근성 완료 조건: "동적 글꼴 확대 200%에서 잘림 없음".
// 아래 fontSize는 배율 100% 기준값이고, 실제 렌더링 크기는 OS 접근성 글꼴
// 배율을 따른다. 이 값들을 쓰는 Text에는 allowFontScaling={false}를 넣지
// 않는다(RN 기본값 true를 유지해 OS 배율이 항상 적용되게 한다).
export const typography = {
  bodySmall: { fontSize: 13, lineHeight: 20, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyLarge: { fontSize: 17, lineHeight: 24, fontWeight: '400' as const },
  labelMedium: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
  headingSmall: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  headingLarge: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  display: { fontSize: 36, lineHeight: 48, fontWeight: '700' as const },
  numeric: { fontVariant: ['tabular-nums'] as 'tabular-nums'[] },
} as const;

export type TypographyToken = keyof typeof typography;
