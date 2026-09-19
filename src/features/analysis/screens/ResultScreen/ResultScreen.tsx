import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useFinancialInputSession } from '@/features/financial-input';
import { isResultUsable } from '@/shared/types';
import {
  Button,
  CashFlowChart,
  DataModeBadge,
  LimitationsNotice,
  RiskCauseCard,
  SafeContributionGate,
  useTheme,
} from '@/shared/ui';

import { createStyles } from './ResultScreen.styles';

function goToEvidence(traceId: string) {
  router.push({ pathname: '/evidence/[traceId]', params: { traceId } });
}

// S09 결과 화면(/analysis/result). docs/decisions/result-usable-status.md:
// isResultUsable(status)이면 ready·limited 둘 다 결과를 그대로 보여주고,
// limited일 때는 limitations를 오류가 아닌 안내 문구로 보여준다. 화면은
// 서버 응답을 그대로 그릴 뿐 금액을 다시 계산하지 않는다.
export default function ResultScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { analysisResponse } = useFinancialInputSession();
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  if (!analysisResponse) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>결과를 찾을 수 없어요</Text>
        <Text style={styles.body}>세션이 만료됐어요. 검토 화면에서 다시 시작해 주세요.</Text>
        <Button label="검토 화면으로" onPress={() => router.push('/review')} />
      </ScrollView>
    );
  }

  const { status, result, limitations, versions } = analysisResponse;

  if (!isResultUsable(status) || !result) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <DataModeBadge mode="synthetic" dataVersion={versions.data} />
        <Text style={styles.title}>아직 결과를 보여드릴 수 없어요</Text>
        <Text style={styles.body}>
          현재 상태: {status}. 입력을 다시 확인하거나 잠시 후 다시 시도해 주세요.
        </Text>
        <Button label="입력 수정" onPress={() => router.push('/plan')} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <DataModeBadge mode="synthetic" dataVersion={versions.data} />
      <LimitationsNotice limitations={limitations ?? []} testID="result-limitations" />

      <Text style={styles.title}>분석 결과</Text>

      <CashFlowChart
        points={result.cashflow}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        testID="result-chart"
      />

      <Text style={styles.sectionTitle}>위험 시점</Text>
      {result.risks.length === 0 ? (
        <Text style={styles.body}>현재 가정에서 뚜렷한 위험월이 없어요.</Text>
      ) : (
        <View style={styles.riskList}>
          {result.risks.map((risk) => (
            <RiskCauseCard
              key={risk.period}
              risk={risk}
              selected={risk.period === selectedPeriod}
              onPress={() => setSelectedPeriod(risk.period)}
              onPressEvidence={goToEvidence}
              testID={`result-risk-${risk.period}`}
            />
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>안전 적립</Text>
      <SafeContributionGate
        result={result.safe_contribution}
        onPressEvidence={goToEvidence}
        testID="result-safe-contribution"
      />

      <View style={styles.actionRow}>
        <Button label="입력 수정" variant="secondary" onPress={() => router.push('/plan')} />
        <Button label="대안 비교" onPress={() => router.push('/alternatives')} />
      </View>
    </ScrollView>
  );
}
