import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';
export function createStyles(theme: Theme) {
  return StyleSheet.create({
    page: {
      flex: theme.layout.flex,
      minHeight: theme.layout.zero,
      backgroundColor: theme.colors.background,
    },
    scroll: { flex: theme.layout.flex },
    content: {
      width: theme.layout.full,
      alignSelf: 'center',
      flexGrow: theme.layout.flex,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xxxl,
      gap: theme.spacing.xl,
    },
    narrow: { maxWidth: theme.layout.contentMax },
    wide: { maxWidth: theme.layout.wideMax },
    footer: {
      backgroundColor: theme.colors.surface,
      borderTopWidth: theme.layout.zero,
      borderTopColor: theme.colors.transparent,
      boxShadow: theme.layout.cardShadow,
    },
    footerContent: {
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      width: theme.layout.full,
      alignSelf: 'center',
    },
    columns: { gap: theme.spacing.xl },
    columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
    column: { flex: theme.layout.flex, minWidth: theme.layout.zero, gap: theme.spacing.lg },
  });
}
