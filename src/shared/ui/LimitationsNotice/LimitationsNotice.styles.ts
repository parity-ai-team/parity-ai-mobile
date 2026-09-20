import { StyleSheet } from 'react-native';

import type { Theme } from '../theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.xs,
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      borderWidth: theme.layout.zero,
      borderColor: theme.colors.transparent,
      backgroundColor: theme.colors.brandSoft,
    },
    item: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      // 동적 글꼴 확대 시에도 잘리지 않도록 numberOfLines로 자르지 않는다.
    },
  });
}
