import type { ReactNode } from 'react';
import {
  ScrollView,
  View,
  useWindowDimensions,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { createStyles } from './Page.styles';

// footer는 스크롤 밖의 정상 레이아웃에 두어 글꼴 확대·키보드에서도 본문을 덮지 않는다.
export function Page({
  children,
  footer,
  wide = false,
  contentContainerStyle,
  ...props
}: ScrollViewProps & { footer?: ReactNode; wide?: boolean }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme);
  const size =
    wide && width >= theme.layout.desktop
      ? styles.wide
      : width >= theme.layout.tablet
        ? styles.narrow
        : undefined;
  return (
    <View style={styles.page}>
      <ScrollView
        {...props}
        keyboardShouldPersistTaps="handled"
        style={styles.scroll}
        contentContainerStyle={[styles.content, size, contentContainerStyle]}
      >
        {children}
      </ScrollView>
      {footer ? (
        <View style={styles.footer}>
          <View style={[styles.footerContent, size]}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

export function Columns({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme);
  return (
    <View style={[styles.columns, width >= theme.layout.desktop && styles.columnsWide]}>
      {children}
    </View>
  );
}

// width는 데스크톱(≥theme.layout.desktop)에서만 이 열의 폭을 고정할 때 쓴다
// (예: S04~S07 왼쪽 단계 목록, 값은 호출부가 theme.layout.sidebarWidth 같은
// 토큰으로 넘긴다). 좁은 화면에서는 Columns가 이미 한 열로 쌓으므로 항상
// 기본 flex:1(=전체 폭)로 되돌아간다. style은 그 밖의 재정의용이다.
export function Column({
  children,
  style,
  width,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  width?: number;
}) {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const styles = createStyles(theme);
  const fixed =
    width !== undefined && windowWidth >= theme.layout.desktop
      ? { width, flexGrow: theme.layout.zero, flexShrink: theme.layout.zero }
      : undefined;
  return (
    <View
      style={[
        styles.column,
        windowWidth >= theme.layout.desktop && styles.columnWide,
        fixed,
        style,
      ]}
    >
      {children}
    </View>
  );
}
