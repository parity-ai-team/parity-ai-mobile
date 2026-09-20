import { StyleSheet } from 'react-native';

import type { Theme } from '../theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      borderWidth: theme.layout.zero,
      borderColor: theme.colors.transparent,
      backgroundColor: theme.colors.surfaceMuted,
    },
    dot: {
      width: theme.layout.badgeIconSize,
      height: theme.layout.badgeIconSize,
      borderRadius: theme.radii.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      flexShrink: theme.layout.flex,
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      // 동적 글꼴 확대 시에도 잘리지 않도록 numberOfLines로 자르지 않는다.
    },
  });
}
