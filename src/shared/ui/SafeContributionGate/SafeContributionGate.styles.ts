import { StyleSheet } from 'react-native';

import type { Theme } from '../theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      boxShadow: theme.layout.cardShadow,
      padding: theme.spacing.lg,
      borderRadius: theme.radii.lg,
      borderWidth: theme.layout.zero,
      borderColor: theme.colors.transparent,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    title: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    statusChip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.brandSoft,
    },
    statusChipHeld: { backgroundColor: theme.colors.warningSoft },
    status: { ...theme.typography.labelMedium, color: theme.colors.success },
    statusHeld: { color: theme.colors.severityWarning },
    amount: {
      ...theme.typography.numeric,
      ...theme.typography.headingSmall,
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
      borderWidth: theme.layout.zero,
      borderColor: theme.colors.transparent,
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
