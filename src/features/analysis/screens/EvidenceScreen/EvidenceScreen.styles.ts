import { StyleSheet } from 'react-native';

import type { Theme } from '@/shared/ui';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    timelineStep: {
      width: theme.layout.full,
    },
    timelineBadge: {
      backgroundColor: theme.colors.brandSoft,
      borderRadius: theme.radii.full,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    timelineNumber: {
      ...theme.typography.bodySmall,
      color: theme.colors.brand,
      fontWeight: theme.typography.labelMedium.fontWeight,
    },
    timelineCard: {
      width: theme.layout.full,
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      gap: theme.spacing.sm,
      boxShadow: theme.layout.shadowNone,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    content: {
      flexGrow: theme.layout.flex,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    title: {
      ...theme.typography.headingSmall,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    sectionTitle: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
      flexShrink: theme.layout.flex,
    },
    body: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    factList: {
      gap: theme.spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: theme.layout.stroke,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    rowCopy: {
      flex: theme.layout.flex,
      minWidth: theme.layout.zero,
      gap: theme.spacing.xs,
    },
    rowLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    rowValue: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
    },
    sourceLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.brand,
    },
    ruleRow: {
      backgroundColor: theme.colors.brandSoft,
      borderRadius: theme.radii.sm,
      padding: theme.spacing.sm,
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: theme.layout.stroke,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    resultValue: {
      ...theme.typography.labelMedium,
      ...theme.typography.numeric,
      color: theme.colors.brand,
      textAlign: 'right',
    },
    resultValueCritical: {
      color: theme.colors.severityCritical,
    },
    explanationCard: {
      backgroundColor: theme.colors.brandSoft,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      boxShadow: theme.layout.shadowNone,
    },
    explanationTitle: {
      ...theme.typography.labelMedium,
      color: theme.colors.deepGreen,
    },
    explanationSourceBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.full,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    explanationSource: {
      ...theme.typography.bodySmall,
      color: theme.colors.brand,
    },
  });
}
