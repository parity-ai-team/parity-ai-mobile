import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      flexGrow: theme.layout.flex,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    title: {
      ...theme.typography.headingSmall,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    body: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      // 동적 글꼴 확대 시에도 잘리지 않도록 numberOfLines로 자르지 않는다.
    },
  });
}
