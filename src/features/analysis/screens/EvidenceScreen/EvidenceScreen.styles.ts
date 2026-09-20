import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    timelineStep: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    timelineNumber: {
      ...theme.typography.labelMedium,
      color: theme.colors.brand,
      backgroundColor: theme.colors.brandSoft,
      borderRadius: theme.radii.full,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    timelineCard: {
      flex: theme.layout.flex,
      minWidth: theme.layout.zero,
      gap: theme.spacing.md,
      boxShadow: theme.layout.shadowNone,
    },
    content: {
      flexGrow: theme.layout.flex,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    title: {
      ...theme.typography.headingLarge,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    sectionTitle: {
      ...theme.typography.headingSmall,
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
      borderWidth: theme.layout.zero,
      borderColor: theme.colors.transparent,
      backgroundColor: theme.colors.surfaceMuted,
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
