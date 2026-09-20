import { useState } from 'react';
import { Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { useTheme } from '../theme';
import { createStyles } from './TextField.styles';

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  testID?: string;
  unit?: string;
}

function formatKrw(value: string) {
  if (!/^\d+$/.test(value)) return value;
  const normalized = value.replace(/^0+(?=\d)/, '');
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 라벨 + 입력 + 힌트/오류 텍스트가 한 세트인 입력 필드. docs/frontend.md
// 접근성 완료 조건: 모든 입력에 label·hint·오류 문구를 연결하고, 오류는
// 색상뿐 아니라 "오류: " 텍스트로도 구분한다.
export function TextField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  hint,
  error,
  keyboardType = 'default',
  testID,
  unit,
}: TextFieldProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const isKrw = unit === '원';
  const displayValue = isKrw ? formatKrw(value) : value;
  const displayPlaceholder =
    isKrw && placeholder ? formatKrw(placeholder.replace(/\D/g, '')) : placeholder;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, focused && styles.focused, hasError && styles.inputError]}>
        <TextInput
          value={displayValue}
          onChangeText={(text) => onChangeText(isKrw ? text.replace(/,/g, '') : text)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder={displayPlaceholder}
          keyboardType={keyboardType}
          style={styles.input}
          placeholderTextColor={theme.colors.textSecondary}
          accessibilityLabel={label}
          accessibilityHint={hint}
          testID={testID}
        />
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {hint && !hasError ? <Text style={styles.hint}>{hint}</Text> : null}
      {hasError ? (
        <Text style={styles.error} accessibilityRole="alert" testID={testID && `${testID}-error`}>
          {`오류: ${error}`}
        </Text>
      ) : null}
    </View>
  );
}
