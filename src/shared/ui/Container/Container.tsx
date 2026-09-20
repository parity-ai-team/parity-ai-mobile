import type { ReactNode } from 'react';
import { View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { createStyles } from './Container.styles';

export interface ContainerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// 헤더(OnboardingShell)와 화면 본문(Page)이 같은 폭·좌우 여백을 쓰게 하는
// 단일 컨테이너. breakpoint 값(theme.layout.tablet/desktop)과 최대 폭
// (theme.layout.contentMax/wideMax)은 src/shared/ui/Page/Page.tsx가
// wide=true일 때 쓰는 값과 반드시 같아야 헤더-본문 폭이 어긋나지 않는다 —
// Page 쪽은 tests/responsive-page.test.tsx가 그 값들을 고정해 둔다.
export function Container({ children, style }: ContainerProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme);
  const size =
    width >= theme.layout.desktop
      ? styles.desktop
      : width >= theme.layout.tablet
        ? styles.tablet
        : undefined;

  return <View style={[styles.base, size, style]}>{children}</View>;
}
