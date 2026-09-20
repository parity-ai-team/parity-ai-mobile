import { StyleSheet } from 'react-native';

import type { Theme } from '../theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      boxShadow: theme.layout.cardShadow,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.lg,
      borderWidth: theme.layout.zero,
      borderColor: theme.colors.transparent,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.xs,
    },
    cardSelected: {
      borderColor: theme.colors.transparent,
      borderWidth: theme.layout.zero,
      backgroundColor: theme.colors.brandSoft,
    },
    selectionArea: {
      gap: theme.spacing.xs,
    },
    headerRow: {
      flexWrap: 'wrap',
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
    severityInfo: { backgroundColor: theme.colors.brandSoft },
    severityWarning: { backgroundColor: theme.colors.warningSoft },
    severityCritical: { backgroundColor: theme.colors.criticalSoft },
    severityLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    causeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    causeChip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      borderWidth: theme.layout.zero,
      borderColor: theme.colors.transparent,
      backgroundColor: theme.colors.surfaceMuted,
    },
    causeLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    gap: {
      ...theme.typography.numeric,
      ...theme.typography.headingSmall,
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
