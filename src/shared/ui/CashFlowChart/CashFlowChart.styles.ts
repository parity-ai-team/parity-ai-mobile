import { StyleSheet } from 'react-native';

import type { Theme } from '../theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.sm,
    },
    legendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    legendSwatch: {
      width: theme.spacing.lg,
      height: theme.spacing.xs,
      borderRadius: theme.radii.sm,
    },
    legendLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    chartScroll: { flexGrow: theme.layout.flex },
    chartArea: {
      width: theme.layout.full,
      position: 'relative',
    },
    hitOverlay: {
      position: 'absolute',
      left: theme.layout.zero,
      right: theme.layout.zero,
    },
    hitArea: {
      position: 'absolute',
      top: theme.layout.zero,
      bottom: theme.layout.zero,
    },
    toggleRow: {
      alignItems: 'flex-start',
    },
    table: {
      minWidth: theme.layout.tableMinWidth,
      borderWidth: theme.layout.stroke,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      overflow: 'hidden',
    },
    tableHeaderRow: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    tableRow: {
      minHeight: theme.accessibility.minTouchTarget,
      alignItems: 'center',
      flexDirection: 'row',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderTopWidth: theme.layout.stroke,
      borderTopColor: theme.colors.border,
    },
    tableRowSelected: {
      backgroundColor: theme.colors.surface,
    },
    tableCell: {
      ...theme.typography.numeric,
      padding: theme.spacing.xs,
      flex: theme.layout.flex,
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    tableHeaderCell: {
      padding: theme.spacing.xs,
      flex: theme.layout.flex,
      ...theme.typography.labelMedium,
      color: theme.colors.textSecondary,
    },
  });
}
