import { useState } from 'react';
import { Pressable, Text, type GestureResponderEvent } from 'react-native';

import { useTheme } from '../theme';
import { createStyles } from './Button.styles';

export interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'text' | 'pill';
  disabled?: boolean;
}

// 테마 컨벤션 검증용 예시 컴포넌트. 로직(Button.tsx)과 스타일
// (Button.styles.ts)을 분리하고, 색상·간격·모서리·타이포그래피·터치 영역을
// 전부 theme 토큰으로만 가져온다. src/shared/ui/theme/README.md 참고.
export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const isSecondary = variant !== 'primary';
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.base,
        isSecondary ? styles.secondary : styles.primary,
        variant === 'text' && styles.text,
        variant === 'pill' && styles.pill,
        focused && styles.focused,
        pressed && !disabled && (isSecondary ? styles.pressedSecondary : styles.pressed),
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.label,
          isSecondary && styles.labelSecondary,
          disabled && styles.labelDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
