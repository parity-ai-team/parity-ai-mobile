import { Text, View } from 'react-native';

import { formatKrw } from '@/shared/format';
import type { RiskItem, RiskSeverity } from '@/shared/types';

import { Button } from '../Button';
import { ConfidenceTag } from '../ConfidenceTag';
import { useTheme } from '../theme';
import { getCauseCodeLabel } from './causeCodeLabels';
import { createStyles } from './RiskCauseCard.styles';

export interface RiskCauseCardProps {
  risk: RiskItem;
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
// 값) 표시하지 않는다 — 화면에서 값을 만들어내지 않는다.
export function RiskCauseCard({ risk, onPressEvidence, testID }: RiskCauseCardProps) {
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
    <View style={styles.card} testID={testID}>
      <View style={styles.headerRow}>
        <Text style={styles.period}>{risk.period}</Text>
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
        <Text style={styles.probability}>부족 확률 {formatProbabilityPercent(risk.probability)}</Text>
      ) : null}

      <ConfidenceTag level={risk.confidence} source={risk.source} testID={testID && `${testID}-confidence`} />

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
    </View>
  );
}
