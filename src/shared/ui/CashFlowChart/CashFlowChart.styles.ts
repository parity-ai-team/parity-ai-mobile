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
      flex: theme.layout.flex,
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    tableHeaderCell: {
      flex: theme.layout.flex,
      ...theme.typography.labelMedium,
      color: theme.colors.textSecondary,
    },
  });
}
