import { accessibility } from './accessibility';
import { colors } from './colors';
import { radii } from './radii';
import { spacing } from './spacing';
import { typography } from './typography';

// 단일 테마 객체. 디자인을 다른 도구로 교체할 때는 colors/spacing/radii/
// typography/accessibility 각 파일의 값만 바꾸면 되고, 이 객체의 키 구조와
// 이를 참조하는 컴포넌트 코드는 바꿀 필요가 없다.
export const theme = {
  colors,
  spacing,
  radii,
  typography,
  accessibility,
} as const;

export type Theme = typeof theme;
