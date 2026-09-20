import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/ui';
export function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: { gap: theme.spacing.lg },
    hero: {
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.deepGreen,
      gap: theme.spacing.xxxl,
      padding: theme.spacing.xl,
    },
    gradient: { position: 'absolute', top: theme.layout.zero, left: theme.layout.zero },
    heroIntro: {
      padding: theme.spacing.lg,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.mint,
      gap: theme.spacing.md,
    },
    eyebrow: { ...theme.typography.labelMedium, color: theme.colors.deepGreen },
    title: { ...theme.typography.headingLarge, color: theme.colors.deepGreen },
    heroBottom: {
      backgroundColor: theme.colors.deepGreen,
      padding: theme.spacing.lg,
      borderRadius: theme.radii.md,
      gap: theme.spacing.sm,
    },
    heroNumber: {
      ...theme.typography.display,
      ...theme.typography.numeric,
      color: theme.colors.mint,
    },
    heroCaption: { ...theme.typography.bodySmall, color: theme.colors.textInverse },
    sectionTitle: { ...theme.typography.headingSmall, color: theme.colors.textPrimary },
    body: { ...theme.typography.bodyMedium, color: theme.colors.textPrimary },
    notice: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
  });
}
