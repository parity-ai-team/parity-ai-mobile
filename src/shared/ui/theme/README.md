# 테마·스타일 컨벤션

디자인을 다른 도구로 교체할 때 이 폴더의 토큰 파일만 바꾸면 되도록,
화면/컴포넌트 로직과 스타일 값을 분리한다.

## 규칙

1. **하드코딩 금지.** 색상·간격·모서리·타이포그래피 값을 컴포넌트에 직접
   쓰지 않는다. 항상 `useTheme()`으로 받은 토큰만 참조한다.
2. **로직과 스타일 파일 분리.** 컴포넌트는 `Component.tsx`(로직/JSX)와
   `Component.styles.ts`(스타일)로 나눈다. `Component.styles.ts`는
   `createStyles(theme: Theme)` 형태의 팩토리 함수 하나만 export한다.
   `src/shared/ui/Button`을 예시로 참고한다.
3. **44×44pt 터치 영역.** 터치 가능한 요소는 `theme.accessibility.minTouchTarget`
   이상의 `minHeight`/`minWidth`를 갖거나, 시각적으로 더 작게 그려야 한다면
   `getMinTouchHitSlop()`으로 hitSlop을 계산한다.
4. **동적 글꼴 200% 대응.** 텍스트를 고정 `height`나 `numberOfLines`로
   자르지 않는다. 컨테이너는 `minHeight`를 쓰고, 핵심 정보는 줄바꿈으로
   흘러가게 둔다. `Text`에 `allowFontScaling={false}`를 쓰지 않는다.
5. **팔레트가 아니라 의미 토큰.** `colors.ts`의 `palette`처럼 원시 값을 둔
   레이어가 있다면, 컴포넌트는 그 원시 값이 아니라 의미가 붙은 토큰
   (`colors.brand`, `colors.severityWarning` 등)만 참조한다.

## 토큰 목록

| 파일               | 내용                                    |
| ------------------ | --------------------------------------- |
| `colors.ts`        | 팔레트(비공개) + 의미 기반 색상 토큰    |
| `spacing.ts`       | 4pt 기준 간격 스케일                    |
| `radii.ts`         | 모서리 반경 스케일                      |
| `typography.ts`    | fontSize/lineHeight/fontWeight 프리셋   |
| `accessibility.ts` | 최소 터치 영역, hitSlop 계산기          |
| `tokens.ts`        | 위 토큰을 묶은 `theme` 객체             |
| `useTheme.ts`       | 컴포넌트에서 테마를 읽는 훅             |
