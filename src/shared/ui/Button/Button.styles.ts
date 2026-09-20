import { Platform, StyleSheet } from 'react-native';

import type { Theme } from '../theme';

// 스타일 계산은 이 파일에만 둔다. Button.tsx는 theme 토큰과 여기서 만든
// 스타일 객체만 참조하고, 색상·간격 같은 원시 값을 직접 쓰지 않는다.
export function createStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      ...(Platform.OS === 'web' ? { transition: theme.layout.transition } : {}),
      alignItems: 'center',
      justifyContent: 'center',
      // docs/frontend.md 접근성 기준: 터치 영역 최소 44×44pt
      minHeight: theme.accessibility.minTouchTarget,
      minWidth: theme.accessibility.minTouchTarget,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.md,
    },
    text: { backgroundColor: theme.colors.transparent, borderColor: theme.colors.transparent },
    pill: { borderRadius: theme.radii.full, paddingVertical: theme.spacing.sm },
    focused: {
      ...(Platform.OS === 'web'
        ? {
            outlineWidth: theme.layout.strongStroke,
            outlineStyle: 'solid' as const,
            outlineColor: theme.colors.brand,
            outlineOffset: theme.layout.focusOffset,
          }
        : { borderWidth: theme.layout.strongStroke, borderColor: theme.colors.deepGreen }),
    },
    primary: {
      backgroundColor: theme.colors.brand,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: theme.layout.stroke,
      borderColor: theme.colors.border,
    },
    pressed: {
      opacity: theme.layout.pressedOpacity,
    },
    disabled: {
      backgroundColor: theme.colors.disabledSurface,
    },
    label: {
      ...theme.typography.labelMedium,
      color: theme.colors.textInverse,
      // 동적 글꼴 200% 확대 시에도 잘리지 않도록 numberOfLines로 자르지 않는다.
    },
    labelSecondary: {
      color: theme.colors.textPrimary,
    },
    labelDisabled: {
      color: theme.colors.disabledText,
    },
  });
}
