import { theme } from './tokens';

// 지금은 단일 정적 테마만 제공한다. 다크모드나 브랜드별 테마 전환이
// 필요해지면 이 훅 내부만 Context 기반으로 바꾸면 되고, 컴포넌트 쪽
// 사용법(const theme = useTheme())은 바뀌지 않는다.
export function useTheme() {
  return theme;
}
