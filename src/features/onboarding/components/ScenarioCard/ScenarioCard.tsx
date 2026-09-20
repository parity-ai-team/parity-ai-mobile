import { InteractivePressable as Pressable } from '@/shared/ui/InteractivePressable/InteractivePressable';
import { Text } from 'react-native';

import { useTheme } from '@/shared/ui';

import { createStyles } from './ScenarioCard.styles';

export interface ScenarioCardProps {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  /** api 모드의 "직접 입력"처럼 지금은 고를 수 없는 카드에 쓴다. */
  disabled?: boolean;
  testID?: string;
}

// S03 시나리오 카드 하나(데모 3개 + 직접 입력). 선택 상태는 테두리 색뿐 아니라
// 제목에 붙는 "· 선택됨" 텍스트로도 구분한다(docs/frontend.md "색상 외
// 텍스트·아이콘으로 구분"). disabled도 같은 원칙 — accessibilityState.disabled
// 외에 description 문구 자체를 호출부가 바꿔서 이유를 알려준다.
export function ScenarioCard({
  title,
  description,
  selected,
  onPress,
  disabled = false,
  testID,
}: ScenarioCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={title}
      accessibilityHint={description}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[styles.card, selected && styles.cardSelected]}
      testID={testID}
    >
      <Text style={styles.title}>
        {title}
        {selected ? ' · 선택됨' : ''}
      </Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}
