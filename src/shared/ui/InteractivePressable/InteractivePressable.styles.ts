import { Platform, StyleSheet } from 'react-native';
import type { Theme } from '../theme';
export function createStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      minWidth: theme.accessibility.minTouchTarget,
      minHeight: theme.accessibility.minTouchTarget,
      ...(Platform.OS === 'web' ? { transition: theme.layout.transition } : {}),
    },
    pressed: { backgroundColor: theme.colors.brandSoft },
    focused: {
      outlineColor: theme.colors.brand,
      outlineWidth: theme.layout.strongStroke,
      outlineStyle: 'solid',
      outlineOffset: theme.layout.focusOffset,
    },
  });
}
