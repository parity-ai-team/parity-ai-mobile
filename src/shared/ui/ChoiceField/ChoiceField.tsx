import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { createStyles } from './ChoiceField.styles';

export interface ChoiceFieldOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface ChoiceFieldProps<TValue extends string> {
  label: string;
  options: readonly ChoiceFieldOption<TValue>[];
  value: TValue | null;
  onChange: (value: TValue) => void;
  hint?: string;
  error?: string;
  testID?: string;
}

// 라벨 + 선택형 칩 목록. 선택 상태는 테두리 색뿐 아니라 " · 선택됨" 텍스트로도
// 구분한다(src/features/onboarding/components/ScenarioCard와 동일한 패턴,
// docs/frontend.md "색상 외 텍스트·아이콘으로 구분").
export function ChoiceField<TValue extends string>({
  label,
  options,
  value,
  onChange,
  hint,
  error,
  testID,
}: ChoiceFieldProps<TValue>) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionRow} accessibilityRole="radiogroup" testID={testID}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              onPress={() => onChange(option.value)}
              style={[styles.option, selected && styles.optionSelected]}
              testID={testID && `${testID}-${option.value}`}
            >
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {option.label}
                {selected ? ' · 선택됨' : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {hint && !hasError ? <Text style={styles.hint}>{hint}</Text> : null}
      {hasError ? (
        <Text style={styles.error} accessibilityRole="alert">
          {`오류: ${error}`}
        </Text>
      ) : null}
    </View>
  );
}
