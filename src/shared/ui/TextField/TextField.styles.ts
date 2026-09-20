import { StyleSheet } from 'react-native';

import type { Theme } from '../theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.sm,
    },
    label: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: theme.layout.stroke,
      borderColor: theme.colors.inputBorder,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surface,
    },
    focused: {
      borderColor: theme.colors.brand,
      outlineColor: theme.colors.brand,
      outlineWidth: theme.layout.strongStroke,
      outlineStyle: 'solid',
      outlineOffset: theme.layout.focusOffset,
    },
    unit: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      paddingRight: theme.spacing.lg,
    },
    input: {
      flex: theme.layout.flex,
      minWidth: theme.layout.zero,
      paddingVertical: theme.spacing.md,
      ...theme.typography.numeric,
      // docs/frontend.md 접근성 기준: 터치 영역 최소 44×44pt
      minHeight: theme.accessibility.minTouchTarget,
      borderWidth: theme.layout.zero,
      borderColor: theme.colors.transparent,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
      ...theme.typography.bodyMedium,
    },
    inputError: {
      borderColor: theme.colors.severityCritical,
      borderWidth: theme.layout.strongStroke,
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
