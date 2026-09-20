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

| 파일               | 내용                                  |
| ------------------ | ------------------------------------- |
| `colors.ts`        | 팔레트(비공개) + 의미 기반 색상 토큰  |
| `spacing.ts`       | 4pt 기준 간격 스케일                  |
| `radii.ts`         | 모서리 반경 스케일                    |
| `typography.ts`    | fontSize/lineHeight/fontWeight 프리셋 |
| `accessibility.ts` | 최소 터치 영역, hitSlop 계산기        |
| `tokens.ts`        | 위 토큰을 묶은 `theme` 객체           |
| `useTheme.ts`      | 컴포넌트에서 테마를 읽는 훅           |

## 테마 개편 규칙

- `layout.ts`: 768/1100px breakpoint, 560/1120px 컨테이너, 테두리·그림자·전환·차트 수치.
- 카드: 흰 배경, 24px 모서리, 24px 내부 여백. 페이지: 밝은 회색.
- 딥 틴 버튼의 흰 글자 대비는 4.87:1. 밝은 틴은 장식 그라데이션에만 사용한다.
- 보조 글자 대비는 흰 카드에서 5.54:1, 회색 페이지에서 5.14:1이다.
- 안내·주의·위험 배지의 흰 글자 대비는 각각 6.57:1, 6.64:1, 6.13:1이다.
- 눌림 상태는 불투명 배경색을 바꿔 대비를 유지한다. 민트 선택 배경 위 글자는 더 어두운 `brandPressed`를 사용한다.
- 그라데이션 위 본문은 불투명 민트 또는 딥 그린 패널에 배치해 위치에 따라 대비가 달라지지 않게 한다.
- `Page`, `Columns`, `Card`, `Chip`, `StepProgress`, `LoadingCards`는 화면 전용 비즈니스 상태를 갖지 않는 표현 컴포넌트다.
- `Button`의 `primary/secondary/text/pill` 변형은 모두 최소 44pt 터치 영역을 유지한다. `pill`은 작은 알약 모양을 위한 표현 변형이다.
