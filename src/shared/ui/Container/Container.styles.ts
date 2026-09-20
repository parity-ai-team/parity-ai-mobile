import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      width: theme.layout.full,
      alignSelf: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    tablet: { maxWidth: theme.layout.contentMax },
    desktop: { maxWidth: theme.layout.wideMax },
  });
}
