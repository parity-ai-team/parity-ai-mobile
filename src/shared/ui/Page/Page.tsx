import type { ReactNode } from 'react';
import { ScrollView, View, useWindowDimensions, type ScrollViewProps } from 'react-native';
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

export function Column({ children }: { children: ReactNode }) {
  const styles = createStyles(useTheme());
  return <View style={styles.column}>{children}</View>;
}
