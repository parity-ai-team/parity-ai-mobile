import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      flexGrow: theme.layout.flex,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    title: {
      ...theme.typography.headingLarge,
      color: theme.colors.textPrimary,
    },
    intro: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    uploadCard: {
      alignItems: 'stretch',
    },
    uploadIcon: {
      width: theme.accessibility.minTouchTarget,
      height: theme.accessibility.minTouchTarget,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    uploadHeaderText: {
      flex: theme.layout.flex,
    },
    cardTitle: {
      ...theme.typography.headingSmall,
      color: theme.colors.textPrimary,
      flexShrink: theme.layout.flex,
    },
    cardBody: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    fileName: {
      ...theme.typography.labelMedium,
      color: theme.colors.deepGreen,
    },
    statusCard: {
      backgroundColor: theme.colors.brandSoft,
    },
    warningCard: {
      backgroundColor: theme.colors.warningSoft,
    },
    statusTitle: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    statusText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    recurringText: {
      ...theme.typography.labelMedium,
      color: theme.colors.brandPressed,
    },
    sectionTitle: {
      ...theme.typography.headingSmall,
      color: theme.colors.textPrimary,
    },
    reviewList: {
      gap: theme.spacing.md,
    },
    reviewCard: {
      gap: theme.spacing.md,
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
    },
    merchant: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
      flex: theme.layout.flex,
    },
    date: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    predictionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    prediction: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    predictionStrong: {
      ...theme.typography.labelMedium,
      color: theme.colors.deepGreen,
    },
    error: {
      ...theme.typography.bodySmall,
      color: theme.colors.severityCritical,
    },
    empty: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingVertical: theme.spacing.lg,
    },
  });
}
