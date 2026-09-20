import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';
export function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.xl,
      borderRadius: theme.radii.lg,
      borderWidth: theme.layout.zero,
      borderColor: theme.colors.transparent,
      gap: theme.spacing.lg,
      boxShadow: theme.layout.cardShadow,
      minWidth: theme.layout.zero,
    },
    chip: {
      alignSelf: 'flex-start',
      borderRadius: theme.radii.full,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
    },
    label: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
    neutral: { backgroundColor: theme.colors.surfaceMuted },
    neutralLabel: { color: theme.colors.textSecondary },
    brand: { backgroundColor: theme.colors.brandSoft },
    brandLabel: { color: theme.colors.deepGreen },
    warning: { backgroundColor: theme.colors.warningSoft },
    warningLabel: { color: theme.colors.severityWarning },
    critical: { backgroundColor: theme.colors.criticalSoft },
    criticalLabel: { color: theme.colors.severityCritical },
    skeleton: {
      minHeight: theme.layout.skeletonHeight,
      backgroundColor: theme.colors.disabledSurface,
      borderRadius: theme.radii.md,
    },
  });
}
