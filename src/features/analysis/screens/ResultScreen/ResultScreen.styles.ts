import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    summary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.transparent,
      boxShadow: theme.layout.shadowNone,
    },
    summaryPeriod: {
      ...theme.typography.headingSmall,
      ...theme.typography.numeric,
      color: theme.colors.deepGreen,
    },
    summaryAmount: {
      ...theme.typography.headingLarge,
      ...theme.typography.numeric,
      color: theme.colors.textPrimary,
    },
    content: {
      flexGrow: theme.layout.flex,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    title: {
      ...theme.typography.headingLarge,
      color: theme.colors.textPrimary,
    },
    sectionTitle: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    chartCard: {
      boxShadow: theme.layout.shadowNone,
    },
    summaryMetricRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    summaryMetric: {
      minWidth: theme.layout.zero,
      gap: theme.spacing.xs,
    },
    summaryAmountMetric: {
      flex: theme.layout.flex,
      minWidth: theme.layout.zero,
      alignItems: 'flex-end',
      gap: theme.spacing.xs,
    },
    metricLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    body: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      // 동적 글꼴 확대 시에도 잘리지 않도록 numberOfLines로 자르지 않는다.
    },
    riskList: {
      gap: theme.spacing.md,
    },
    actionRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: { flex: theme.layout.flex },
  });
}
