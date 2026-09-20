import type { PropsWithChildren } from 'react';
import { Text, View, type ViewProps } from 'react-native';
import { useTheme } from '../theme';
import { createStyles } from './Surface.styles';
export function Card({ children, style, ...props }: PropsWithChildren<ViewProps>) {
  const styles = createStyles(useTheme());
  return (
    <View {...props} style={[styles.card, style]}>
      {children}
    </View>
  );
}
export function Chip({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'brand' | 'warning' | 'critical';
}) {
  const styles = createStyles(useTheme());
  return (
    <View style={[styles.chip, styles[tone]]}>
      <Text style={[styles.label, styles[`${tone}Label`]]}>{label}</Text>
    </View>
  );
}
export function LoadingCards({ testID }: { testID?: string }) {
  const styles = createStyles(useTheme());
  return (
    <View
      style={styles.card}
      accessibilityRole="progressbar"
      accessibilityLabel="??? ???? ???"
      testID={testID}
    >
      <Text style={styles.label}>?? ?? ? ???? ?? ? ?? ??</Text>
      <View style={styles.skeleton} />
      <View style={styles.skeleton} />
    </View>
  );
}
