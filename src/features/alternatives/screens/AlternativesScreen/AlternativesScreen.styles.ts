import { Platform, StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      flexGrow: theme.layout.flex,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    comparisonRow: {
      gap: theme.spacing.md,
    },
    comparisonRowWide: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    baselineColumn: {
      width: theme.layout.full,
    },
    baselineColumnWide: {
      width: theme.layout.sidebarWidth,
      zIndex: theme.layout.stickyZIndex,
      ...(Platform.OS === 'web'
        ? {
            position: 'sticky' as const,
            top: theme.layout.headerHeight + theme.spacing.lg,
          }
        : {}),
    },
    alternativesColumn: {
      flex: theme.layout.flex,
      minWidth: theme.layout.zero,
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
      boxShadow: theme.layout.shadowNone,
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
      borderWidth: theme.layout.zero,
      borderColor: theme.colors.transparent,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.sm,
    },
    baselineCard: {
      backgroundColor: theme.colors.brandSoft,
      borderColor: theme.colors.transparent,
    },
    baselineEyebrow: {
      ...theme.typography.bodySmall,
      color: theme.colors.brand,
    },
    baselineHero: {
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    baselineAmount: {
      ...theme.typography.chartAmount,
      ...theme.typography.numeric,
      color: theme.colors.deepGreen,
    },
    baselineMetrics: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    baselineMetric: {
      flex: theme.layout.flex,
      minWidth: theme.layout.zero,
      gap: theme.spacing.xs,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    cardTitle: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    quickMetrics: {
      flexDirection: 'row',
      padding: theme.spacing.sm,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surfaceMuted,
    },
    quickMetric: {
      flex: theme.layout.flex,
      minWidth: theme.layout.zero,
      gap: theme.spacing.xs,
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
    },
    quickMetricDivider: {
      borderLeftWidth: theme.layout.stroke,
      borderLeftColor: theme.colors.border,
    },
    quickMetricLabel: {
      ...theme.typography.chartLabel,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    quickMetricValue: {
      ...theme.typography.bodySmall,
      ...theme.typography.numeric,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    effectPanel: {
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.brandSoft,
      gap: theme.spacing.xs,
    },
    effectPanelNegative: {
      backgroundColor: theme.colors.criticalSoft,
    },
    effectLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    effectAmount: {
      ...theme.typography.chartAmount,
      ...theme.typography.numeric,
    },
    effectPositive: {
      color: theme.colors.brand,
    },
    effectNegative: {
      color: theme.colors.severityCritical,
    },
    effectNeutral: {
      color: theme.colors.textPrimary,
    },
    effectCopy: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    effectCaption: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    resultList: {
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceMuted,
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    resultRowDivider: {
      borderTopWidth: theme.layout.stroke,
      borderTopColor: theme.colors.border,
    },
    resultCopy: {
      flex: theme.layout.flex,
      minWidth: theme.layout.zero,
      gap: theme.spacing.xs,
    },
    resultLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    resultValue: {
      ...theme.typography.labelMedium,
      ...theme.typography.numeric,
      color: theme.colors.textPrimary,
      textAlign: 'right',
      flexShrink: theme.layout.zero,
    },
    deltaLabel: {
      ...theme.typography.chartLabel,
      color: theme.colors.brand,
    },
    deltaNegative: {
      color: theme.colors.severityCritical,
    },
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
    burdenChip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      borderWidth: theme.layout.zero,
      borderColor: theme.colors.transparent,
      backgroundColor: theme.colors.surfaceMuted,
    },
    burdenLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    actionList: {
      gap: theme.spacing.sm,
    },
    actionTitle: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    actionItem: {
      padding: theme.spacing.sm,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surfaceMuted,
      gap: theme.spacing.xs,
    },
    actionName: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    actionMeta: {
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
