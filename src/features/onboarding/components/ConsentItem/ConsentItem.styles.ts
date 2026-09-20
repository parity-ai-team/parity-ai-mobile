import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.xl,
      boxShadow: theme.layout.cardShadow,
      gap: theme.spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: theme.accessibility.minTouchTarget,
      gap: theme.spacing.sm,
    },
    box: {
      width: theme.spacing.xl,
      minHeight: theme.spacing.xl,
      borderRadius: theme.radii.sm,
      borderWidth: theme.layout.stroke,
      borderColor: theme.colors.inputBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    boxChecked: {
      backgroundColor: theme.colors.brand,
      borderColor: theme.colors.brand,
    },
    checkMark: {
      color: theme.colors.textInverse,
      ...theme.typography.labelMedium,
    },
    label: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
      flexShrink: theme.layout.flex,
      // 동적 글꼴 확대 시에도 잘리지 않도록 numberOfLines로 자르지 않는다.
    },
    description: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      paddingLeft: theme.spacing.xl + theme.spacing.sm,
    },
  });
}
