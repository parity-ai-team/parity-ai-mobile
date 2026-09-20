import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    title: {
      ...theme.typography.headingSmall,
      color: theme.colors.textPrimary,
    },
    intro: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    body: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    cardList: {
      gap: theme.spacing.md,
    },
    card: {
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.sm,
    },
    baselineCard: {
      borderColor: theme.colors.brand,
    },
    cardTitle: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    metricLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    metricValue: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    metricWorse: {
      ...theme.typography.bodySmall,
      color: theme.colors.severityCritical,
    },
    burdenRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      alignItems: 'center',
    },
    burdenChip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    burdenLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    actionList: {
      gap: theme.spacing.xs,
    },
    actionRow: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    evidenceRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    footerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
  });
}
