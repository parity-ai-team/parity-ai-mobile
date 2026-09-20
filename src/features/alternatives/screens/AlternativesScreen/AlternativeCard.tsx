import { Text, View } from 'react-native';

import { formatKrw } from '@/shared/format';
import type { AlternativeDetail, AlternativeOutcome } from '@/shared/types';
import { Button, useTheme } from '@/shared/ui';

import { getActionBurdenLabel, getActionTypeLabel, getAlternativeKindLabel } from '../../labels';
import { createStyles } from './AlternativesScreen.styles';

export interface AlternativeCardProps {
  detail: AlternativeDetail;
  baseline: AlternativeOutcome;
  onPressEvidence: (traceId: string) => void;
  testID?: string;
}

// 기준선(현상유지) 대비 이 대안의 결과가 나빠지는 지표가 있으면 색이 아니라
// 문구로 표시한다(docs/frontend.md "색상 외 텍스트·아이콘으로 ... 구분").
// minimum_cash_krw·closing_cash_krw는 낮을수록, floor_breach_days는
// 많을수록 기준선보다 나쁘다.
function isWorseThanBaseline(
  metric: 'minimum_cash_krw' | 'closing_cash_krw' | 'floor_breach_days',
  outcome: AlternativeOutcome,
  baseline: AlternativeOutcome,
): boolean {
  if (metric === 'floor_breach_days') {
    return outcome.floor_breach_days > baseline.floor_breach_days;
  }
  return outcome[metric] < baseline[metric];
}

export function AlternativeCard({
  detail,
  baseline,
  onPressEvidence,
  testID,
}: AlternativeCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const traceIds = detail.trace_ids ?? [];

  const minimumWorse = isWorseThanBaseline('minimum_cash_krw', detail.outcome, baseline);
  const closingWorse = isWorseThanBaseline('closing_cash_krw', detail.outcome, baseline);
  const breachWorse = isWorseThanBaseline('floor_breach_days', detail.outcome, baseline);

  return (
    <View style={styles.card} testID={testID}>
      <Text style={styles.cardTitle}>{getAlternativeKindLabel(detail.kind)}</Text>

      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>즉시 현금 변화</Text>
        <Text style={styles.metricValue}>{formatKrw(detail.immediate_cash_change_krw)}</Text>
      </View>
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>미래 비용</Text>
        <Text style={styles.metricValue}>{formatKrw(detail.future_cost_krw)}</Text>
      </View>
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>회복 기간</Text>
        <Text style={styles.metricValue}>{`${detail.recovery_period_months}개월`}</Text>
      </View>

      <View style={styles.burdenRow}>
        <Text style={styles.metricLabel}>실행 부담</Text>
        <View style={styles.burdenChip}>
          <Text style={styles.burdenLabel}>{getActionBurdenLabel(detail.action_burden)}</Text>
        </View>
      </View>

      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>최저 현금</Text>
        <View>
          <Text style={styles.metricValue}>{formatKrw(detail.outcome.minimum_cash_krw)}</Text>
          {minimumWorse ? <Text style={styles.metricWorse}>기준선보다 낮아요</Text> : null}
        </View>
      </View>
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>기말 현금</Text>
        <View>
          <Text style={styles.metricValue}>{formatKrw(detail.outcome.closing_cash_krw)}</Text>
          {closingWorse ? <Text style={styles.metricWorse}>기준선보다 낮아요</Text> : null}
        </View>
      </View>
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>비상금 기준 하회 일수</Text>
        <View>
          <Text style={styles.metricValue}>{`${detail.outcome.floor_breach_days}일`}</Text>
          {breachWorse ? <Text style={styles.metricWorse}>기준선보다 길어요</Text> : null}
        </View>
      </View>

      {detail.actions.length > 0 ? (
        <View style={styles.actionList}>
          {detail.actions.map((action, index) => (
            <Text key={`${action.action_type}-${index}`} style={styles.actionRow}>
              {`${getActionTypeLabel(action.action_type)} · ${formatKrw(action.amount_krw)}`}
              {action.affected_periods.length > 0 ? ` · ${action.affected_periods.join(', ')}` : ''}
            </Text>
          ))}
        </View>
      ) : null}

      {traceIds.length > 0 ? (
        <View style={styles.evidenceRow}>
          {traceIds.map((traceId, index) => (
            <Button
              key={traceId}
              label={traceIds.length > 1 ? `근거 보기 ${index + 1}` : '근거 보기'}
              variant="secondary"
              onPress={() => onPressEvidence(traceId)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
