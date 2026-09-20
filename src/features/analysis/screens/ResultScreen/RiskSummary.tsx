import { Text } from 'react-native';
import type { RiskItem } from '@/shared/types';
import { formatKrw } from '@/shared/format';
import { Card, Chip, useTheme } from '@/shared/ui';
import { createStyles } from './ResultScreen.styles';

// 서버가 반환한 위험 항목 중 예상 부족액이 가장 낮은 항목을 요약한다.
// 금액·확률·위험도는 재계산하지 않고 응답값 그대로 표시한다.
export function RiskSummary({ risks }: { risks: readonly RiskItem[] }) {
  const styles = createStyles(useTheme());
  const worst = risks.reduce<RiskItem | undefined>(
    (current, risk) =>
      !current || risk.expected_gap_krw < current.expected_gap_krw ? risk : current,
    undefined,
  );
  return (
    <Card style={styles.summary} testID="result-summary">
      <Chip label="12개월 현금흐름 요약" tone="brand" />
      <Text style={styles.sectionTitle}>가장 부족해지는 달</Text>
      {worst ? (
        <>
          <Text style={styles.summaryPeriod}>{worst.period}</Text>
          <Text style={styles.body}>예상 부족액</Text>
          <Text style={styles.summaryAmount}>{formatKrw(worst.expected_gap_krw)}</Text>
          <Text style={styles.body}>현재 입력과 가정을 기준으로 계산한 값이에요.</Text>
        </>
      ) : (
        <Text style={styles.summaryPeriod}>표시할 위험월 없음</Text>
      )}
    </Card>
  );
}
