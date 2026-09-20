import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { useFinancialInputSession } from '@/features/financial-input';
import { apiRequest, ApiError, endpoints } from '@/shared/api';
import { formatKrw } from '@/shared/format';
import { isResultUsable } from '@/shared/types';
import type { AlternativeComparisonResponse } from '@/shared/types';
import { Button, DataModeBadge, useTheme } from '@/shared/ui';

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
  const { analysisResponse } = useFinancialInputSession();

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
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>대안 비교</Text>
        <Text style={styles.body}>
          결과가 준비돼야 대안을 비교할 수 있어요. 먼저 결과 화면에서 분석 상태를 확인해 주세요.
        </Text>
        <Button label="결과 화면으로" onPress={() => router.push('/analysis/result')} />
      </ScrollView>
    );
  }

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <ActivityIndicator size="large" color={theme.colors.brand} testID="alternatives-loading" />
        <Text style={styles.body}>대안을 불러오는 중이에요…</Text>
      </ScrollView>
    );
  }

  if (error || !comparison) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>대안을 불러오지 못했어요</Text>
        <Text style={styles.body}>{error ?? '잠시 후 다시 시도해 주세요.'}</Text>
        <Button label="결과 화면으로" onPress={() => router.push('/analysis/result')} />
      </ScrollView>
    );
  }

  const { current_state: baseline, alternatives } = comparison;

  return (
    <ScrollView contentContainerStyle={styles.content} testID="alternatives-screen">
      <DataModeBadge mode="synthetic" dataVersion={analysisResponse.versions.data} />

      <Text style={styles.title}>대안 비교</Text>
      <Text style={styles.intro}>
        현상유지와 대안의 지표를 나란히 비교해요. 이 화면은 어떤 대안이 더 낫다고 정하지 않아요.
      </Text>

      <View style={[styles.card, styles.baselineCard]} testID="alternatives-baseline">
        <Text style={styles.cardTitle}>현재 상태(현상유지)</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>최저 현금</Text>
          <Text style={styles.metricValue}>{formatKrw(baseline.minimum_cash_krw)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>기말 현금</Text>
          <Text style={styles.metricValue}>{formatKrw(baseline.closing_cash_krw)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>비상금 기준 하회 일수</Text>
          <Text style={styles.metricValue}>{`${baseline.floor_breach_days}일`}</Text>
        </View>
      </View>

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

      <Button label="결과 화면으로" variant="secondary" onPress={() => router.push('/analysis/result')} />
    </ScrollView>
  );
}
