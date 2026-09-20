import { Text, View } from 'react-native';

import { formatKrw } from '@/shared/format';
import type { SafeContributionResult } from '@/shared/types';

import { Button } from '../Button';
import { getCauseCodeLabel } from '../RiskCauseCard';
import { useTheme } from '../theme';
import { createStyles } from './SafeContributionGate.styles';

export interface SafeContributionGateProps {
  result: SafeContributionResult;
  onPressEvidence?: (traceId: string) => void;
  testID?: string;
}

// docs/frontend.md "핵심 UI 컴포넌트" SafeContributionGate: "통과 전 상품 CTA
// 금지" — eligible이 false여도 이 컴포넌트는 가입/개설 등 상품성 버튼을 전혀
// 그리지 않는다(MVP 제외 목록: 실제 자녀계좌 개설). eligible이 false일 때는
// reason_codes를 RiskCauseCard와 같은 CauseCode 라벨로 보여준다.
export function SafeContributionGate({
  result,
  onPressEvidence,
  testID,
}: SafeContributionGateProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const reasonCodes = result.reason_codes ?? [];
  const traceIds = result.trace_ids ?? [];

  return (
    <View style={styles.card} testID={testID}>
      <Text style={styles.title}>안전 적립</Text>

      {result.eligible ? (
        <>
          <Text style={styles.amount}>{formatKrw(result.monthly_amount_krw)}</Text>
          <Text style={styles.body}>
            비상금·부족확률 기준을 통과해 이 금액까지는 자녀 자산을 시작해도 안전해요.
            {`\n${result.valid_until}까지 유효한 판단이에요.`}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.body}>
            아직 비상금·부족확률 기준을 통과하지 못해 안전한 적립 금액을 제시하지 않아요.
          </Text>
          {reasonCodes.length > 0 ? (
            <View style={styles.reasonRow}>
              {reasonCodes.map((code) => (
                <View key={code} style={styles.reasonChip}>
                  <Text style={styles.reasonLabel}>{getCauseCodeLabel(code)}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}

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
