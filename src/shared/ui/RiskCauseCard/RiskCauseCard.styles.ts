import { StyleSheet } from 'react-native';

import type { Theme } from '../theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    period: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    severityChip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
    },
    severityInfo: { backgroundColor: theme.colors.severityInfo },
    severityWarning: { backgroundColor: theme.colors.severityWarning },
    severityCritical: { backgroundColor: theme.colors.severityCritical },
    severityLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textInverse,
    },
    causeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    causeChip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    causeLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    gap: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textPrimary,
    },
    probability: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    evidenceRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
  });
}
