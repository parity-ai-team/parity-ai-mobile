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

function getDeltaCopy(delta: number): string {
  if (delta === 0) return '현재 계획과 같아요';
  return `현재보다 ${formatKrw(Math.abs(delta))} ${delta > 0 ? '더 남아요' : '덜 남아요'}`;
}

function getDayDeltaCopy(days: number, baselineDays: number): string {
  const delta = days - baselineDays;
  if (delta === 0) return '현재와 같아요';
  return `현재보다 ${Math.abs(delta)}일 ${delta < 0 ? '짧아요' : '길어요'}`;
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

  const closingWorse = isWorseThanBaseline('closing_cash_krw', detail.outcome, baseline);
  const breachWorse = isWorseThanBaseline('floor_breach_days', detail.outcome, baseline);
  const minimumDelta = detail.outcome.minimum_cash_krw - baseline.minimum_cash_krw;
  const closingDelta = detail.outcome.closing_cash_krw - baseline.closing_cash_krw;
  const minimumTone =
    minimumDelta > 0
      ? styles.effectPositive
      : minimumDelta < 0
        ? styles.effectNegative
        : styles.effectNeutral;

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{getAlternativeKindLabel(detail.kind)}</Text>
        <View style={styles.burdenChip}>
          <Text
            style={styles.burdenLabel}
          >{`실행 부담 ${getActionBurdenLabel(detail.action_burden)}`}</Text>
        </View>
      </View>

      <View style={[styles.effectPanel, minimumDelta < 0 && styles.effectPanelNegative]}>
        <Text style={styles.effectLabel}>현재 계획과 비교하면</Text>
        <Text style={[styles.effectAmount, minimumTone]}>
          {minimumDelta === 0
            ? '변화 없음'
            : `${minimumDelta > 0 ? '+' : '-'}${formatKrw(Math.abs(minimumDelta))}`}
        </Text>
        <Text style={styles.effectCopy}>{getDeltaCopy(minimumDelta)}</Text>
        <Text style={styles.effectCaption}>가장 적게 남는 돈 기준</Text>
      </View>

      <View style={styles.outcomeGrid}>
        <View style={styles.outcomeMetric}>
          <Text style={styles.metricLabel}>12개월 뒤 남는 돈</Text>
          <Text style={styles.outcomeValue}>{formatKrw(detail.outcome.closing_cash_krw)}</Text>
          <Text style={[styles.deltaLabel, closingWorse && styles.deltaNegative]}>
            {getDeltaCopy(closingDelta)}
          </Text>
        </View>
        <View style={styles.outcomeMetric}>
          <Text style={styles.metricLabel}>비상금 부족 기간</Text>
          <Text style={styles.outcomeValue}>{`${detail.outcome.floor_breach_days}일`}</Text>
          <Text style={[styles.deltaLabel, breachWorse && styles.deltaNegative]}>
            {getDayDeltaCopy(detail.outcome.floor_breach_days, baseline.floor_breach_days)}
          </Text>
        </View>
      </View>

      <View style={styles.quickMetrics}>
        <View style={styles.quickMetric}>
          <Text style={styles.metricLabel}>지금 확보</Text>
          <Text style={styles.metricValue}>{formatKrw(detail.immediate_cash_change_krw)}</Text>
        </View>
        <View style={styles.quickMetric}>
          <Text style={styles.metricLabel}>나중에 드는 비용</Text>
          <Text style={styles.metricValue}>{formatKrw(detail.future_cost_krw)}</Text>
        </View>
        <View style={styles.quickMetric}>
          <Text style={styles.metricLabel}>회복 기간</Text>
          <Text style={styles.metricValue}>{`${detail.recovery_period_months}개월`}</Text>
        </View>
      </View>

      {detail.actions.length > 0 ? (
        <View style={styles.actionList}>
          <Text style={styles.actionTitle}>이렇게 바꿔요</Text>
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
              variant="pill"
              onPress={() => onPressEvidence(traceId)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
