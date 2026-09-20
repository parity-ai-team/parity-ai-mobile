import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/ui';
export function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: { gap: theme.spacing.lg },
    hero: {
      borderRadius: theme.radii.none,
      overflow: 'visible',
      backgroundColor: theme.colors.transparent,
      gap: theme.spacing.lg,
    },
    gradient: {
      position: 'absolute',
      top: theme.layout.zero,
      left: theme.layout.zero,
      opacity: theme.layout.zero,
    },
    heroPanel: {
      padding: theme.spacing.none,
      borderRadius: theme.radii.none,
      backgroundColor: theme.colors.transparent,
      gap: theme.spacing.md,
    },
    title: { ...theme.typography.headingLarge, color: theme.colors.textPrimary },
    mascot: {
      width: theme.layout.mascotSize,
      height: theme.layout.mascotSize,
      alignSelf: 'center',
      marginVertical: theme.spacing.sm,
    },
    heroNumber: {
      ...theme.typography.headingLarge,
      ...theme.typography.numeric,
      color: theme.colors.brand,
      textAlign: 'center',
    },
    heroCaption: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    sectionTitle: { ...theme.typography.headingSmall, color: theme.colors.textPrimary },
    body: { ...theme.typography.bodyMedium, color: theme.colors.textPrimary },
    bodyEmphasis: { color: theme.colors.brand },
    notice: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
  });
}
