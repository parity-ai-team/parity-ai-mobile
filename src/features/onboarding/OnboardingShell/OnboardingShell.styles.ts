import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/ui';
export function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: theme.layout.flex, backgroundColor: theme.colors.background },
    header: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: theme.layout.stroke,
      borderBottomColor: theme.colors.border,
    },
    badgeBar: {
      width: theme.layout.full,
      maxWidth: theme.layout.wideMax,
      alignSelf: 'center',
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    brand: { ...theme.typography.headingSmall, color: theme.colors.deepGreen },
    stage: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
  });
}
