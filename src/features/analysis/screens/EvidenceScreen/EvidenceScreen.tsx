import { Page } from '@/shared/ui/Page/Page';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { useFinancialInputSession } from '@/features/financial-input';
import { apiRequest, ApiError, endpoints } from '@/shared/api';
import type { EvidenceResponse, EvidenceTrace, ExplanationSource } from '@/shared/types';
import { LoadingCards, Card, Button, ConfidenceTag, useTheme } from '@/shared/ui';

import { createStyles } from './EvidenceScreen.styles';

const EXPLANATION_SOURCE_LABEL: Record<ExplanationSource, string> = {
  template: '템플릿 문구',
  llm: 'AI 생성 문구',
};

// S12 근거 화면(/evidence/[traceId]). GET /v1/analyses/{id}/evidence/{trace_id}로
// 이 수치가 어떤 입력·규칙·산출로 만들어졌는지 보여준다. analysis_id는 세션의
// 분석 응답에서 가져오고(별도로 저장하지 않는다), trace_id는 라우트
// 파라미터로 받는다. 404·기타 오류는 안내 문구와 뒤로 가기만 제공한다.
export default function EvidenceScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { traceId } = useLocalSearchParams<{ traceId: string }>();
  const { analysisResponse } = useFinancialInputSession();

  const [evidence, setEvidence] = useState<EvidenceTrace | null>(null);
  // analysisId·traceId가 정해지면 이 화면에서 딱 한 번만 조회하므로(라우트를
  // 벗어나기 전까지 바뀌지 않는다), effect 진입 시점에 다시 true로 되돌릴
  // 필요가 없다 — react-hooks/set-state-in-effect가 지적하는 "effect 안에서
  // setState를 동기 호출"을 피하기 위해 초기값을 true로만 둔다.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analysisId = analysisResponse?.analysis_id ?? null;

  useEffect(() => {
    if (!analysisId || !traceId) {
      return;
    }

    let cancelled = false;

    apiRequest<EvidenceResponse>({
      method: 'GET',
      path: endpoints.evidence(analysisId, traceId),
    })
      .then(({ data }) => {
        if (!cancelled) {
          setEvidence(data.evidence);
        }
      })
      .catch((caught) => {
        if (cancelled) {
          return;
        }
        if (caught instanceof ApiError && caught.status === 404) {
          setError('요청한 근거를 찾을 수 없어요.');
        } else {
          setError('근거를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [analysisId, traceId]);

  if (!analysisResponse || !analysisId) {
    return (
      <Page contentContainerStyle={styles.content}>
        <Text style={styles.title}>근거</Text>
        <Text style={styles.body}>세션이 만료됐어요. 검토 화면에서 다시 시작해 주세요.</Text>
        <Button label="검토 화면으로" onPress={() => router.push('/review')} />
      </Page>
    );
  }

  if (loading) {
    return (
      <Page contentContainerStyle={styles.content}>
        <LoadingCards testID="evidence-loading" />
        <Text style={styles.body}>근거를 불러오는 중이에요…</Text>
      </Page>
    );
  }

  if (error || !evidence) {
    return (
      <Page contentContainerStyle={styles.content}>
        <Text style={styles.title}>근거를 표시할 수 없어요</Text>
        <Text style={styles.body}>{error ?? '요청한 근거를 찾을 수 없어요.'}</Text>
        <Button label="뒤로 가기" onPress={() => router.back()} />
      </Page>
    );
  }

  return (
    <Page contentContainerStyle={styles.content} testID="evidence-screen">
      <Text style={styles.title}>근거</Text>
      <Text style={styles.subtitle}>{`추적 ID: ${evidence.trace_id}`}</Text>

      <View style={styles.timelineStep}>
        <Text style={styles.timelineNumber}>01</Text>
        <Card style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>입력</Text>
          <View style={styles.factList}>
            {evidence.inputs.map((input) => (
              <View key={input.name} style={styles.row} testID={`evidence-input-${input.name}`}>
                <Text style={styles.rowLabel}>{input.name}</Text>
                <Text style={styles.rowValue}>{input.value}</Text>
                <ConfidenceTag source={input.source} />
              </View>
            ))}
          </View>
        </Card>
      </View>
      <View style={styles.timelineStep}>
        <Text style={styles.timelineNumber}>02</Text>
        <Card style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>규칙</Text>
          <View style={styles.factList}>
            {evidence.rules.map((rule) => (
              <View key={rule.rule_id} style={styles.row}>
                <Text style={styles.rowLabel}>{rule.description}</Text>
                <Text style={styles.rowValue}>{`${rule.rule_id} · v${rule.version}`}</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>
      <View style={styles.timelineStep}>
        <Text style={styles.timelineNumber}>03</Text>
        <Card style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>산출</Text>
          <View style={styles.factList}>
            {evidence.outputs.map((output) => (
              <View key={output.name} style={styles.row}>
                <Text style={styles.rowLabel}>{output.name}</Text>
                <Text style={styles.rowValue}>
                  {output.unit ? `${output.value}${output.unit}` : output.value}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </View>
      <Card>
        <Text style={styles.sectionTitle}>설명</Text>
        <Text style={styles.body}>{evidence.explanation.text}</Text>
        <Text style={styles.explanationSource}>
          {EXPLANATION_SOURCE_LABEL[evidence.explanation.source]}
        </Text>
      </Card>
      <Button
        label="결과 화면으로"
        variant="secondary"
        onPress={() => router.push('/analysis/result')}
      />
    </Page>
  );
}
