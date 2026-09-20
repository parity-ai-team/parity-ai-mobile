import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      flexGrow: theme.layout.flex,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.xl,
    },
    title: {
      ...theme.typography.headingLarge,
      color: theme.colors.textPrimary,
    },
    intro: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      // 동적 글꼴 확대 시에도 잘리지 않도록 numberOfLines로 자르지 않는다.
    },
    sectionTitle: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.sm,
    },
    row: {
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.none,
      borderBottomWidth: theme.layout.stroke,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.xs,
    },
    rowLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    rowValue: {
      ...theme.typography.numeric,
      ...theme.typography.bodyLarge,
      color: theme.colors.textPrimary,
    },
    rowOrigin: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    rowError: {
      ...theme.typography.bodySmall,
      color: theme.colors.severityCritical,
    },
    generalError: {
      ...theme.typography.bodyMedium,
      color: theme.colors.severityCritical,
    },
    incompleteNotice: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
  });
}
