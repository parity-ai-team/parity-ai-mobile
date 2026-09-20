import { useState, type KeyboardEvent } from 'react';
import { Platform, Pressable, type GestureResponderEvent, type PressableProps } from 'react-native';
import { useTheme } from '../theme';
import { createStyles } from './InteractivePressable.styles';

// 표시 상태만 공통화하며 기존 이벤트와 접근성 이름은 그대로 전달한다.
export function InteractivePressable({ style, onFocus, onBlur, ...props }: PressableProps) {
  const styles = createStyles(useTheme());
  const [focused, setFocused] = useState(false);
  // RN Web의 기본 Space 처리는 button 역할만 지원하므로 선택 카드도 지원한다.
  const keyboardProps =
    Platform.OS === 'web' &&
    (props.accessibilityRole === 'checkbox' || props.accessibilityRole === 'radio')
      ? {
          onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            if (event.key === ' ' || event.key === 'Spacebar') {
              event.preventDefault();
              if (!event.repeat && !props.disabled) {
                props.onPress?.(event as unknown as GestureResponderEvent);
              }
            }
          },
        }
      : {};
  return (
    <Pressable
      {...props}
      {...keyboardProps}
      aria-checked={props['aria-checked'] ?? props.accessibilityState?.checked}
      aria-selected={props['aria-selected'] ?? props.accessibilityState?.selected}
      aria-expanded={props['aria-expanded'] ?? props.accessibilityState?.expanded}
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
