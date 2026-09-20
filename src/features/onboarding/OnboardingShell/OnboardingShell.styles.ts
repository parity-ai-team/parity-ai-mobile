import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/ui';
export function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: theme.layout.flex, backgroundColor: theme.colors.background },
    header: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: theme.layout.stroke,
      borderBottomColor: theme.colors.border,
      zIndex: theme.layout.headerZIndex,
    },
    headerRow: {
      minHeight: theme.layout.headerHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      flexShrink: theme.layout.flex,
    },
    brand: { ...theme.typography.headingSmall, color: theme.colors.deepGreen },
    stage: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      flexShrink: theme.layout.flex,
    },
  });
}
