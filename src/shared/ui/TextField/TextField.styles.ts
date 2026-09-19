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
    input: {
      // docs/frontend.md 접근성 기준: 터치 영역 최소 44×44pt
      minHeight: theme.accessibility.minTouchTarget,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
      ...theme.typography.bodyMedium,
    },
    inputError: {
      borderColor: theme.colors.severityCritical,
      borderWidth: 2,
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
