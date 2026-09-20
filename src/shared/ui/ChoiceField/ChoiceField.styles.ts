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
      minWidth: theme.accessibility.minTouchTarget,
      paddingVertical: theme.spacing.sm,
      flexShrink: theme.layout.flex,
      // docs/frontend.md 접근성 기준: 터치 영역 최소 44×44pt
      minHeight: theme.layout.controlHeight,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.md,
      borderWidth: theme.layout.zero,
      borderColor: theme.colors.transparent,
      backgroundColor: theme.colors.surfaceMuted,
    },
    optionSelected: {
      backgroundColor: theme.colors.brandSoft,
      borderColor: theme.colors.brand,
      borderWidth: theme.layout.zero,
    },
    optionLabel: {
      flexShrink: theme.layout.flex,
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    optionLabelSelected: {
      color: theme.colors.brandPressed,
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
