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
      boxShadow: theme.layout.cardShadow,
      padding: theme.spacing.xl,
      borderRadius: theme.radii.lg,
      borderWidth: theme.layout.stroke,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.sm,
    },
    baselineCard: {
      backgroundColor: theme.colors.brandSoft,
      borderColor: theme.colors.brand,
    },
    cardTitle: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    metricColumn: { flex: theme.layout.flex, minWidth: theme.layout.zero, alignItems: 'flex-end' },
    metricRow: {
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: theme.layout.stroke,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    metricLabel: {
      flex: theme.layout.flex,
      minWidth: theme.layout.zero,
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    metricValue: {
      ...theme.typography.numeric,
      flexShrink: theme.layout.flex,
      textAlign: 'right',
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    metricWorse: {
      backgroundColor: theme.colors.criticalSoft,
      borderRadius: theme.radii.sm,
      padding: theme.spacing.xs,
      ...theme.typography.bodySmall,
      color: theme.colors.severityCritical,
    },
    burdenRow: {
      flexWrap: 'wrap',
      flexDirection: 'row',
      gap: theme.spacing.xs,
      alignItems: 'center',
    },
    burdenChip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      borderWidth: theme.layout.stroke,
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
