import { Pressable, Text, View } from 'react-native';

import { formatKrw } from '@/shared/format';
import type { RiskItem, RiskSeverity } from '@/shared/types';

import { Button } from '../Button';
import { ConfidenceTag } from '../ConfidenceTag';
import { useTheme } from '../theme';
import { getCauseCodeLabel } from './causeCodeLabels';
import { createStyles } from './RiskCauseCard.styles';

export interface RiskCauseCardProps {
  risk: RiskItem;
  /** 차트에서 이 period가 선택됐는지. 테두리 색뿐 아니라 문구로도 구분한다. */
  selected?: boolean;
  /** 카드를 누르면 차트 쪽 선택도 함께 맞추고 싶을 때(S09 결과 화면) 넘긴다. */
  onPress?: () => void;
  onPressEvidence?: (traceId: string) => void;
  testID?: string;
}

const SEVERITY_LABEL: Record<RiskSeverity, string> = {
  info: '안내',
  warning: '주의',
  critical: '위험',
};

const MAX_VISIBLE_CAUSES = 3;

function formatProbabilityPercent(probability: number): string {
  return `${Math.round(probability * 100)}%`;
}

// docs/frontend.md "핵심 UI 컴포넌트": severity를 색+텍스트로, 원인은 최대
// 3개까지 사람이 읽는 문구로 보여준다. probability가 null이면(계약상 선택
// 값) 표시하지 않는다 — 화면에서 값을 만들어내지 않는다. onPress를 주면 카드
// 전체가 눌림 대상이 된다(S09 결과 화면의 차트-카드 선택 동기화용) — 안의
// "근거 보기" 버튼은 별개의 Pressable이라 눌러도 이 onPress로 전파되지 않는다.
export function RiskCauseCard({
  risk,
  selected = false,
  onPress,
  onPressEvidence,
  testID,
}: RiskCauseCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const severityStyle = {
    info: styles.severityInfo,
    warning: styles.severityWarning,
    critical: styles.severityCritical,
  }[risk.severity];

  const visibleCauses = risk.cause_codes.slice(0, MAX_VISIBLE_CAUSES);
  const traceIds = risk.trace_ids ?? [];

  return (
    <Pressable
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      testID={testID}
    >
      <View style={styles.headerRow}>
        <Text style={styles.period}>
          {risk.period}
          {selected ? ' · 선택됨' : ''}
        </Text>
        <View style={[styles.severityChip, severityStyle]} testID={testID && `${testID}-severity`}>
          <Text style={styles.severityLabel}>{SEVERITY_LABEL[risk.severity]}</Text>
        </View>
      </View>

      <View style={styles.causeRow}>
        {visibleCauses.map((code) => (
          <View key={code} style={styles.causeChip}>
            <Text style={styles.causeLabel}>{getCauseCodeLabel(code)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.gap}>{formatKrw(risk.expected_gap_krw)}</Text>

      {risk.probability !== null && risk.probability !== undefined ? (
        <Text style={styles.probability}>
          부족 확률 {formatProbabilityPercent(risk.probability)}
        </Text>
      ) : null}

      <ConfidenceTag
        level={risk.confidence}
        source={risk.source}
        testID={testID && `${testID}-confidence`}
      />

      {onPressEvidence && traceIds.length > 0 ? (
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
    </Pressable>
  );
}
