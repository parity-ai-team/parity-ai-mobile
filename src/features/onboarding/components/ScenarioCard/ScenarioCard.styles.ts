import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      boxShadow: theme.layout.cardShadow,
      minHeight: theme.accessibility.minTouchTarget,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.lg,
      borderWidth: theme.layout.zero,
      borderColor: theme.colors.transparent,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.xs,
    },
    cardSelected: {
      backgroundColor: theme.colors.brandSoft,
      borderColor: theme.colors.transparent,
      borderWidth: theme.layout.zero,
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
