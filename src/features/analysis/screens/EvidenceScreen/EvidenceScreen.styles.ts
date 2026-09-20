import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    timelineStep: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      borderLeftWidth: theme.layout.strongStroke,
      borderLeftColor: theme.colors.brand,
      paddingLeft: theme.spacing.md,
    },
    timelineNumber: {
      ...theme.typography.labelMedium,
      color: theme.colors.brand,
      paddingTop: theme.spacing.xl,
    },
    timelineCard: { flex: theme.layout.flex, minWidth: theme.layout.zero },
    content: {
      flexGrow: theme.layout.flex,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      gap: theme.spacing.lg,
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
