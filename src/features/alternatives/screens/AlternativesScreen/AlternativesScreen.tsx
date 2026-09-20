import { Page } from '@/shared/ui/Page/Page';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';

import { useFinancialInputSession } from '@/features/financial-input';
import { apiRequest, ApiError, endpoints } from '@/shared/api';
import { formatKrw } from '@/shared/format';
import { isResultUsable } from '@/shared/types';
import type { AlternativeComparisonResponse } from '@/shared/types';
import { Card, CashFlowChart, LoadingCards, Button, useTheme } from '@/shared/ui';

import { AlternativeCard } from './AlternativeCard';
import { createStyles } from './AlternativesScreen.styles';

function goToEvidence(traceId: string) {
  router.push({ pathname: '/evidence/[traceId]', params: { traceId } });
}

// S10 대안 비교 화면(/alternatives). GET /v1/analyses/{id}/alternatives를
// 호출해 현상유지(current_state)를 기준선 카드로, 나머지 대안을 비교 카드로
// 보여준다. docs/frontend.md "선택 아닌 비교" — 어떤 대안이 낫다고 정하지
// 않고("권장" 문구 금지) 지표를 나란히 보여주기만 한다. isResultUsable이
// 아니면(ready/limited가 아니면) 진입시키지 않는다.
export default function AlternativesScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isDesktop = width >= theme.layout.desktop;
  const { analysisResponse } = useFinancialInputSession();

  const [showChart, setShowChart] = useState(false);
  const [comparison, setComparison] = useState<AlternativeComparisonResponse | null>(null);
  // analysisId·usable이 정해지면 이 화면에서 딱 한 번만 조회하므로(라우트를
  // 벗어나기 전까지 바뀌지 않는다), effect 진입 시점에 다시 true로 되돌릴
  // 필요가 없다 — react-hooks/set-state-in-effect가 지적하는 "effect 안에서
  // setState를 동기 호출"을 피하기 위해 초기값을 true로만 둔다.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analysisId = analysisResponse?.analysis_id ?? null;
  const usable = analysisResponse ? isResultUsable(analysisResponse.status) : false;

  useEffect(() => {
    if (!analysisId || !usable) {
      return;
    }

    let cancelled = false;

    apiRequest<AlternativeComparisonResponse>({
      method: 'GET',
      path: endpoints.alternatives(analysisId),
    })
      .then(({ data }) => {
        if (!cancelled) {
          setComparison(data);
        }
      })
      .catch((caught) => {
        if (cancelled) {
          return;
        }
        setError(
          caught instanceof ApiError
            ? caught.message
            : '대안을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [analysisId, usable]);

  if (!analysisResponse || !usable) {
    return (
      <Page wide contentContainerStyle={styles.content}>
        <Text style={styles.title}>대안 비교</Text>
        <Text style={styles.body}>
          결과가 준비돼야 대안을 비교할 수 있어요. 먼저 결과 화면에서 분석 상태를 확인해 주세요.
        </Text>
        <Button label="결과 화면으로" onPress={() => router.push('/analysis/result')} />
      </Page>
    );
  }

  if (loading) {
    return (
      <Page wide contentContainerStyle={styles.content}>
        <LoadingCards testID="alternatives-loading" />
        <Text style={styles.body}>대안을 불러오는 중이에요…</Text>
      </Page>
    );
  }

  if (error || !comparison) {
    return (
      <Page wide contentContainerStyle={styles.content}>
        <Text style={styles.title}>대안을 불러오지 못했어요</Text>
        <Text style={styles.body}>{error ?? '잠시 후 다시 시도해 주세요.'}</Text>
        <Button label="결과 화면으로" onPress={() => router.push('/analysis/result')} />
      </Page>
    );
  }

  const { current_state: baseline, alternatives } = comparison;

  return (
    <Page
      wide
      contentContainerStyle={styles.content}
      testID="alternatives-screen"
      footer={
        <Button
          label="결과 화면으로"
          variant="secondary"
          onPress={() => router.push('/analysis/result')}
        />
      }
    >
      <Text style={styles.title}>대안 비교</Text>
      <Text style={styles.intro}>
        각 대안을 적용했을 때 가장 적게 남는 돈이 현재보다 얼마나 달라지는지 먼저 확인해 보세요.
      </Text>

      <Button
        label={showChart ? '현재 흐름 접기' : '현재 흐름 다시 보기'}
        variant="text"
        onPress={() => setShowChart(!showChart)}
      />
      {showChart ? (
        <Card>
          <Text style={styles.cardTitle}>현재 상태의 현금흐름</Text>
          <Text style={styles.body}>현재 상태의 12개월 흐름과 대안별 지표를 함께 살펴보세요.</Text>
          <CashFlowChart points={analysisResponse.result?.cashflow ?? []} />
        </Card>
      ) : null}

      {/*
        현상유지 카드는 좁은 화면(<1100)에서는 그냥 맨 위 일반 흐름으로 보여준다.
        데스크톱에서만 왼쪽 고정 폭 레일로 옮기고 그 레일 안에서만 sticky를 준다
        — 이전에는 Page의 stickyHeaderIndices로 화면 전체 폭에서 이 카드를
        고정했더니, 스크롤할 때 카드가 오른쪽 대안 목록 위까지 덮어버렸다.
        position: sticky는 네이티브 Yoga가 모르는 값이라 웹에서만 적용한다.
      */}
      <View style={[styles.comparisonRow, isDesktop && styles.comparisonRowWide]}>
        <View style={[styles.baselineColumn, isDesktop && styles.baselineColumnWide]}>
          <View style={[styles.card, styles.baselineCard]} testID="alternatives-baseline">
            <Text style={styles.baselineEyebrow}>비교 기준</Text>
            <Text style={styles.cardTitle}>현재 계획 그대로 유지</Text>
            <View style={styles.baselineHero}>
              <Text style={styles.metricLabel}>가장 적게 남는 돈</Text>
              <Text style={styles.baselineAmount}>{formatKrw(baseline.minimum_cash_krw)}</Text>
            </View>
            <View style={styles.baselineMetrics}>
              <View style={styles.baselineMetric}>
                <Text style={styles.metricLabel}>12개월 뒤</Text>
                <Text style={styles.metricValue}>{formatKrw(baseline.closing_cash_krw)}</Text>
              </View>
              <View style={styles.baselineMetric}>
                <Text style={styles.metricLabel}>비상금 부족</Text>
                <Text style={styles.metricValue}>{`${baseline.floor_breach_days}일`}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.alternativesColumn}>
          <View style={styles.cardList}>
            {alternatives.map((detail) => (
              <AlternativeCard
                key={detail.alternative_id}
                detail={detail}
                baseline={baseline}
                onPressEvidence={goToEvidence}
                testID={`alternatives-card-${detail.alternative_id}`}
              />
            ))}
          </View>
        </View>
      </View>
    </Page>
  );
}
