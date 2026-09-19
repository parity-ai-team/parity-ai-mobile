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
      width: 14,
      height: 3,
      borderRadius: theme.radii.sm,
    },
    legendLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    chartArea: {
      width: '100%',
    },
    toggleRow: {
      alignItems: 'flex-start',
    },
    table: {
      borderWidth: 1,
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
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    tableRowSelected: {
      backgroundColor: theme.colors.surface,
    },
    tableCell: {
      flex: 1,
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    tableHeaderCell: {
      flex: 1,
      ...theme.typography.labelMedium,
      color: theme.colors.textSecondary,
    },
  });
}
