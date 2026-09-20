import { Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme';
import { createStyles } from './StepProgress.styles';

const steps = ['가구', '금융', '계획', '검토'] as const;

// 모바일·태블릿에서는 상단 가로 진행 표시, 데스크톱(≥1100)에서는 왼쪽 세로
// 단계 목록으로 보여준다. accessibilityLabel은 방향과 무관하게 동일하다.
export function StepProgress({ current }: { current: (typeof steps)[number] }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isDesktop = width >= theme.layout.desktop;

  return (
    <View
      style={[styles.row, isDesktop && styles.column]}
      accessibilityLabel={`입력 단계: ${current}`}
    >
      {steps.map((step) => (
        <View
          key={step}
          style={[
            styles.step,
            isDesktop && styles.stepVertical,
            step === current && (isDesktop ? styles.currentVertical : styles.current),
          ]}
        >
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
