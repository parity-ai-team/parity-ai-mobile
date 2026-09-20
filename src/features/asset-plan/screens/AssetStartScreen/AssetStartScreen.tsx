import { Page } from '@/shared/ui/Page/Page';
import { router } from 'expo-router';
import { Text } from 'react-native';

import { useFinancialInputSession } from '@/features/financial-input';
import { isResultUsable } from '@/shared/types';
import { Button, DataModeBadge, SafeContributionGate, useTheme } from '@/shared/ui';

import { createStyles } from './AssetStartScreen.styles';

function goToEvidence(traceId: string) {
  router.push({ pathname: '/evidence/[traceId]', params: { traceId } });
}

// S11 안전 적립 게이트 화면(/asset-start). docs/frontend.md "자산출발 화면은
// 비상금 기준과 부족확률 기준을 통과한 경우에만 안전 적립액을 노출한다" —
// 별도 API 없이 세션에 있는 분석 결과의 safe_contribution만 그대로 보여준다
// (docs/api/openapi-1.5.0.json에 asset-plan 엔드포인트가 없다). 시작을
// 유도하는 문구나 상품 CTA는 만들지 않는다(SafeContributionGate 참고).
export default function AssetStartScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { analysisResponse } = useFinancialInputSession();

  if (!analysisResponse) {
    return (
      <Page wide contentContainerStyle={styles.content}>
        <Text style={styles.title}>안전 적립</Text>
        <Text style={styles.body}>세션이 만료됐어요. 검토 화면에서 다시 시작해 주세요.</Text>
        <Button label="검토 화면으로" onPress={() => router.push('/review')} />
      </Page>
    );
  }

  const { status, result, versions } = analysisResponse;

  if (!isResultUsable(status) || !result) {
    return (
      <Page wide contentContainerStyle={styles.content}>
        <DataModeBadge mode="synthetic" dataVersion={versions.data} />
        <Text style={styles.title}>아직 안전 적립을 판단할 수 없어요</Text>
        <Text style={styles.body}>현재 상태: {status}. 결과가 준비된 뒤 다시 확인해 주세요.</Text>
        <Button label="결과 화면으로" onPress={() => router.push('/analysis/result')} />
      </Page>
    );
  }

  return (
    <Page wide contentContainerStyle={styles.content} testID="asset-start-screen">
      <DataModeBadge mode="synthetic" dataVersion={versions.data} />

      <Text style={styles.title}>안전 적립</Text>
      <Text style={styles.intro}>
        비상금과 부족확률 기준을 통과한 경우에만 안전 적립 금액을 보여줘요.
      </Text>

      <SafeContributionGate
        result={result.safe_contribution}
        onPressEvidence={goToEvidence}
        testID="asset-start-safe-contribution"
      />

      <Button
        label="결과 화면으로"
        variant="secondary"
        onPress={() => router.push('/analysis/result')}
      />
    </Page>
  );
}
