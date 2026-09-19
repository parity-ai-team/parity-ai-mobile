import { StyleSheet } from 'react-native';

import type { Theme } from '../theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.xs,
    },
    label: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    optionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    option: {
      // docs/frontend.md 접근성 기준: 터치 영역 최소 44×44pt
      minHeight: theme.accessibility.minTouchTarget,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    optionSelected: {
      borderColor: theme.colors.brand,
      borderWidth: 2,
    },
    optionLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    optionLabelSelected: {
      color: theme.colors.brand,
    },
    hint: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    error: {
      ...theme.typography.bodySmall,
      color: theme.colors.severityCritical,
    },
  });
}
