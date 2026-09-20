import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    summary: { backgroundColor: theme.colors.surface, borderColor: theme.colors.brand },
    summaryPeriod: {
      ...theme.typography.headingLarge,
      ...theme.typography.numeric,
      color: theme.colors.deepGreen,
    },
    summaryAmount: {
      ...theme.typography.display,
      ...theme.typography.numeric,
      color: theme.colors.textPrimary,
    },
    content: {
      flexGrow: theme.layout.flex,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    title: {
      ...theme.typography.headingLarge,
      color: theme.colors.textPrimary,
    },
    sectionTitle: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    body: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      // 동적 글꼴 확대 시에도 잘리지 않도록 numberOfLines로 자르지 않는다.
    },
    riskList: {
      gap: theme.spacing.md,
    },
    actionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
  });
}
