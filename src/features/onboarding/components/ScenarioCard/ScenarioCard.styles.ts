import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      boxShadow: theme.layout.cardShadow,
      minHeight: theme.accessibility.minTouchTarget,
      padding: theme.spacing.xl,
      borderRadius: theme.radii.lg,
      borderWidth: theme.layout.stroke,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.xs,
    },
    cardSelected: {
      backgroundColor: theme.colors.brandSoft,
      borderColor: theme.colors.brand,
      borderWidth: theme.layout.strongStroke,
    },
    title: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    description: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      // 동적 글꼴 확대 시에도 잘리지 않도록 numberOfLines로 자르지 않는다.
    },
  });
}
