import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      flexGrow: theme.layout.flex,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    title: {
      ...theme.typography.headingSmall,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    sectionTitle: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    body: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    factList: {
      gap: theme.spacing.sm,
    },
    row: {
      padding: theme.spacing.sm,
      borderRadius: theme.radii.sm,
      borderWidth: theme.layout.stroke,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.xs,
    },
    rowLabel: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    rowValue: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    explanationSource: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
  });
}
