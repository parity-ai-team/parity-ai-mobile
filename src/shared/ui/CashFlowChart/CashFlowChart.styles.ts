import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { gap: theme.spacing.sm },
    monthHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
    },
    monthHeading: {
      flex: theme.layout.flex,
      minWidth: theme.layout.zero,
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    selectedSummary: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingBottom: theme.spacing.md,
    },
    monthButton: {
      width: theme.accessibility.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.background,
    },
    arrow: { ...theme.typography.headingLarge, color: theme.colors.textSecondary },
    disabled: { opacity: theme.layout.disabledOpacity },
    period: { ...theme.typography.labelMedium, color: theme.colors.textPrimary },
    amount: {
      ...theme.typography.chartAmount,
      ...theme.typography.numeric,
      color: theme.colors.brand,
      textAlign: 'center',
    },
    hint: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      flexShrink: theme.layout.flex,
    },
    legendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      flexShrink: theme.layout.flex,
    },
    forecastSwatch: {
      width: theme.spacing.md,
      height: theme.spacing.xs,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.brand,
    },
    floorSwatch: {
      width: theme.spacing.md,
      borderTopWidth: theme.layout.strongStroke,
      borderColor: theme.colors.severityCritical,
      borderStyle: 'dashed',
    },
    confirmedSwatch: {
      width: theme.spacing.md,
      borderTopWidth: theme.layout.strongStroke,
      borderColor: theme.colors.chartConfirmed,
      borderStyle: 'dashed',
    },
    unit: { ...theme.typography.chartLabel, color: theme.colors.textSecondary, marginLeft: 'auto' },
    chartArea: { width: theme.layout.full, minWidth: theme.layout.zero, position: 'relative' },
    hitOverlay: { position: 'absolute', left: theme.layout.zero, right: theme.layout.zero },
    hitArea: { position: 'absolute', top: theme.layout.zero, bottom: theme.layout.zero },
    dateRange: {
      ...theme.typography.chartLabel,
      color: theme.colors.textSecondary,
      textAlign: 'right',
    },
    insight: {
      backgroundColor: theme.colors.brandSoft,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    insightWarning: { backgroundColor: theme.colors.warningSoft },
    insightTitle: {
      ...theme.typography.labelMedium,
      color: theme.colors.brand,
      flexShrink: theme.layout.flex,
    },
    warningText: { color: theme.colors.severityWarning },
    disclosure: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: theme.layout.stroke,
      borderTopColor: theme.colors.border,
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    disclosureLabel: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
    guide: { gap: theme.spacing.sm, paddingBottom: theme.spacing.sm },
    monthList: { gap: theme.spacing.sm },
    monthRow: {
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      borderWidth: theme.layout.stroke,
      borderColor: theme.colors.border,
      gap: theme.spacing.xs,
    },
    monthRowSelected: { borderColor: theme.colors.brand, backgroundColor: theme.colors.brandSoft },
    monthRowHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    monthRowAmount: {
      ...theme.typography.labelMedium,
      ...theme.typography.numeric,
      color: theme.colors.brand,
    },
  });
}
