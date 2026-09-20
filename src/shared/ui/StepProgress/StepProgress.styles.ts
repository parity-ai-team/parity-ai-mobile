import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';
export function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: theme.spacing.sm },
    column: { flexDirection: 'column', gap: theme.spacing.xs },
    step: {
      flex: theme.layout.flex,
      paddingVertical: theme.spacing.sm,
      borderTopWidth: theme.layout.strongStroke,
      borderTopColor: theme.colors.border,
      gap: theme.spacing.xs,
    },
    stepVertical: {
      flex: theme.layout.zero,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderTopWidth: theme.layout.zero,
      borderLeftWidth: theme.layout.strongStroke,
      borderLeftColor: theme.colors.border,
    },
    current: { borderTopColor: theme.colors.brand },
    currentVertical: { borderLeftColor: theme.colors.brand },
    label: { ...theme.typography.labelMedium, color: theme.colors.textSecondary },
    currentLabel: { color: theme.colors.brand },
    status: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
  });
}
