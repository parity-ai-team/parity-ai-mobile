import { Text, View } from 'react-native';
import { useTheme } from '../theme';
import { createStyles } from './StepProgress.styles';

const steps = ['가구', '금융', '계획', '검토'] as const;
export function StepProgress({ current }: { current: (typeof steps)[number] }) {
  const styles = createStyles(useTheme());
  return (
    <View style={styles.row} accessibilityLabel={`입력 단계: ${current}`}>
      {steps.map((step) => (
        <View key={step} style={[styles.step, step === current && styles.current]}>
          <Text style={[styles.label, step === current && styles.currentLabel]}>{step}</Text>
          <Text style={styles.status}>
            {step === current
              ? '진행 중'
              : steps.indexOf(step) < steps.indexOf(current)
                ? '완료'
                : '예정'}
          </Text>
        </View>
      ))}
    </View>
  );
}
