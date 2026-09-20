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
    heroPanel: {
      padding: theme.spacing.lg,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.mint,
      gap: theme.spacing.md,
    },
    title: { ...theme.typography.headingLarge, color: theme.colors.deepGreen },
    heroNumber: {
      ...theme.typography.display,
      ...theme.typography.numeric,
      color: theme.colors.brand,
    },
    heroCaption: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
    sectionTitle: { ...theme.typography.headingSmall, color: theme.colors.textPrimary },
    body: { ...theme.typography.bodyMedium, color: theme.colors.textPrimary },
    bodyEmphasis: { color: theme.colors.brand },
    notice: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
  });
}
