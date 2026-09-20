import { InteractivePressable as Pressable } from '@/shared/ui/InteractivePressable/InteractivePressable';
import { Text, View } from 'react-native';

import { useTheme } from '@/shared/ui';

import { createStyles } from './ConsentItem.styles';

export interface ConsentItemProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: (next: boolean) => void;
  testID?: string;
}

// S02 동의 화면의 체크 항목 하나. 체크 표시는 색뿐 아니라 "✓" 텍스트로도
// 구분한다(docs/frontend.md "색상 외 텍스트·아이콘으로 구분").
export function ConsentItem({ label, description, checked, onToggle, testID }: ConsentItemProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
        accessibilityHint={description}
        onPress={() => onToggle(!checked)}
        style={styles.row}
        testID={testID}
      >
        <View style={[styles.box, checked && styles.boxChecked]}>
          {checked && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}
