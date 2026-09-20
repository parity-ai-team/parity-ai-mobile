import { useState } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import { useTheme } from '../theme';
import { createStyles } from './InteractivePressable.styles';

// 표시 상태만 공통화하며 기존 이벤트와 접근성 이름은 그대로 전달한다.
export function InteractivePressable({ style, onFocus, onBlur, ...props }: PressableProps) {
  const styles = createStyles(useTheme());
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      {...props}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={(state) => [
        styles.base,
        typeof style === 'function' ? style(state) : style,
        state.pressed && styles.pressed,
        focused && styles.focused,
      ]}
    />
  );
}
