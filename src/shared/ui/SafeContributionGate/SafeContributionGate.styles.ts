import { StyleSheet } from 'react-native';

import type { Theme } from '../theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      boxShadow: theme.layout.cardShadow,
      padding: theme.spacing.xl,
      borderRadius: theme.radii.lg,
      borderWidth: theme.layout.stroke,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.sm,
    },
    title: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    status: { ...theme.typography.display, color: theme.colors.success },
    statusHeld: { color: theme.colors.severityWarning },
    amount: {
      ...theme.typography.numeric,
      ...theme.typography.headingLarge,
      color: theme.colors.success,
    },
    body: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      // 동적 글꼴 확대 시에도 잘리지 않도록 numberOfLines로 자르지 않는다.
    },
    reasonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    reasonChip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      borderWidth: theme.layout.stroke,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.warningSoft,
    },
    reasonLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
    },
    evidenceRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
  });
}
