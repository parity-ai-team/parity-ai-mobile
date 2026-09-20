import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.brandSoft,
    },
    icon: {
      width: theme.layout.controlHeight,
      height: theme.layout.controlHeight,
      flexShrink: theme.layout.zero,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surface,
    },
    copy: {
      flex: theme.layout.flex,
      minWidth: theme.layout.zero,
      gap: theme.spacing.xs,
    },
    title: {
      ...theme.typography.labelMedium,
      color: theme.colors.deepGreen,
    },
    body: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
  });
}
