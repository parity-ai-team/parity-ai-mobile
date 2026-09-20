import { Page } from '@/shared/ui/Page/Page';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { useFinancialInputSession } from '@/features/financial-input';
import { apiRequest, ApiError, endpoints } from '@/shared/api';
import { formatKrw } from '@/shared/format';
import type { EvidenceResponse, EvidenceTrace, ExplanationSource } from '@/shared/types';
import {
  CAUSE_CODE_LABEL,
  LoadingCards,
  Card,
  Button,
  getCauseCodeLabel,
  useTheme,
} from '@/shared/ui';

import { DATA_SOURCE_LABEL } from '@/shared/ui/ConfidenceTag/labels';

import { createStyles } from './EvidenceScreen.styles';

const EXPLANATION_SOURCE_LABEL: Record<ExplanationSource, string> = {
  template: '계산 결과 안내',
  llm: 'AI가 쉽게 풀어쓴 설명',
};

const ACTION_TYPE_LABEL: Record<string, string> = {
  reduce_discretionary: '선택 지출 줄이기',
  defer_discretionary: '급하지 않은 지출 미루기',
  move_flexible_payment: '조정 가능한 납부일 옮기기',
};

const OUTPUT_LABEL: Record<string, string> = {
  expected_gap_krw: '예상 부족액',
  severity: '위험 정도',
  minimum_cash_krw: '12개월 중 가장 적게 남는 돈',
  closing_cash_krw: '12개월 뒤 남는 돈',
  floor_breach_days: '비상금이 부족한 기간',
  eligible: '안전 적립 가능 여부',
  monthly_amount_krw: '매달 안전하게 적립할 수 있는 금액',
};

const SEVERITY_LABEL: Record<string, string> = {
  info: '안내',
  warning: '주의가 필요해요',
  critical: '빠른 대비가 필요해요',
};

function getInputLabel(name: string): string {
  const causeMatch = /^cause_code_(\d+)$/.exec(name);
  if (causeMatch) return `부족이 예상되는 이유 ${causeMatch[1]}`;

  const actionMatch = /^action_(\d+)_type$/.exec(name);
  if (actionMatch) return `비교한 방법 ${actionMatch[1]}`;

  const reasonMatch = /^reason_code_(\d+)$/.exec(name);
  if (reasonMatch) return `판단 이유 ${reasonMatch[1]}`;

  return '계산에 반영한 정보';
}

function getInputValue(name: string, value: string): string {
  if (name.startsWith('cause_code_') || name.startsWith('reason_code_')) {
    const label = getCauseCodeLabel(value);
    return label === value ? '기타 현금 변동 요인' : label;
  }

  if (name.startsWith('action_')) {
    return ACTION_TYPE_LABEL[value] ?? '기타 조정 방법';
  }

  return value;
}

function getOutputValue(name: string, value: string, unit: string | null): string {
  if (name.endsWith('_krw') || unit === '원') {
    const amount = Number(value);
    return Number.isFinite(amount) ? formatKrw(amount) : '금액을 확인할 수 없어요';
  }

  if (name === 'severity') return SEVERITY_LABEL[value] ?? '확인이 필요해요';
  if (name === 'eligible') return value === 'true' ? '가능해요' : '아직은 어려워요';
  if (name === 'floor_breach_days') return `${Number(value).toLocaleString('ko-KR')}일`;
  return unit ? `${value}${unit}` : value;
}

function getRuleExplanation(ruleId: string, fallback: string): string {
  const labels: Record<string, string> = {
    rule_cashflow_risk_detection: '매달 남는 돈이 꼭 지켜야 할 비상금보다 적어지는지 확인했어요.',
    rule_alternative_constraint_search:
      '바꾸기로 허용한 항목 안에서 실행할 수 있는 방법만 비교했어요.',
    rule_safe_contribution_gate: '비상금과 생활비가 충분히 남는 경우에만 적립 가능으로 판단했어요.',
  };
  return labels[ruleId] ?? fallback;
}

function humanizeExplanation(text: string): string {
  return Object.entries(CAUSE_CODE_LABEL).reduce(
    (result, [code, label]) => result.split(code).join(label),
    text
      .replace(/\bmedium\b/g, '보통')
      .replace(/\blow\b/g, '낮음')
      .replace(/\bhigh\b/g, '높음'),
  );
}

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
      <Page wide contentContainerStyle={styles.content}>
        <Text style={styles.title}>근거</Text>
        <Text style={styles.body}>세션이 만료됐어요. 검토 화면에서 다시 시작해 주세요.</Text>
        <Button label="검토 화면으로" onPress={() => router.push('/review')} />
      </Page>
    );
  }

  if (loading) {
    return (
      <Page wide contentContainerStyle={styles.content}>
        <LoadingCards testID="evidence-loading" />
        <Text style={styles.body}>근거를 불러오는 중이에요…</Text>
      </Page>
    );
  }

  if (error || !evidence) {
    return (
      <Page wide contentContainerStyle={styles.content}>
        <Text style={styles.title}>근거를 표시할 수 없어요</Text>
        <Text style={styles.body}>{error ?? '요청한 근거를 찾을 수 없어요.'}</Text>
        <Button label="뒤로 가기" onPress={() => router.back()} />
      </Page>
    );
  }

  return (
    <Page
      wide
      contentContainerStyle={styles.content}
      testID="evidence-screen"
      footer={<Button label="원래 화면으로 돌아가기" onPress={() => router.back()} />}
    >
      <Text style={styles.title}>왜 이런 결과가 나왔나요?</Text>
      <Text style={styles.subtitle}>입력한 정보가 결과로 이어진 과정을 쉽게 보여드려요.</Text>

      <View style={styles.timelineStep}>
        <Card style={styles.timelineCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.timelineBadge}>
              <Text style={styles.timelineNumber}>01</Text>
            </View>
            <Text style={styles.sectionTitle}>무엇을 반영했나요?</Text>
          </View>
          <View style={styles.factList}>
            {evidence.inputs.length === 0 ? (
              <Text style={styles.body}>추가로 표시할 입력 정보가 없어요.</Text>
            ) : null}
            {evidence.inputs.map((input) => (
              <View key={input.name} style={styles.row} testID={`evidence-input-${input.name}`}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowLabel}>{getInputLabel(input.name)}</Text>
                  <Text style={styles.rowValue}>{getInputValue(input.name, input.value)}</Text>
                </View>
                <Text style={styles.sourceLabel}>{DATA_SOURCE_LABEL[input.source]}</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>
      <View style={styles.timelineStep}>
        <Card style={styles.timelineCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.timelineBadge}>
              <Text style={styles.timelineNumber}>02</Text>
            </View>
            <Text style={styles.sectionTitle}>어떤 기준을 적용했나요?</Text>
          </View>
          <View style={styles.factList}>
            {evidence.rules.length === 0 ? (
              <Text style={styles.body}>상세 기준이 제공되지 않았어요.</Text>
            ) : null}
            {evidence.rules.map((rule) => (
              <View key={rule.rule_id} style={styles.ruleRow}>
                <Text style={styles.rowValue}>
                  {getRuleExplanation(rule.rule_id, rule.description)}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </View>
      <View style={styles.timelineStep}>
        <Card style={styles.timelineCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.timelineBadge}>
              <Text style={styles.timelineNumber}>03</Text>
            </View>
            <Text style={styles.sectionTitle}>그래서 어떤 값이 나왔나요?</Text>
          </View>
          <View style={styles.factList}>
            {evidence.outputs.length === 0 ? (
              <Text style={styles.body}>상세 금액이 제공되지 않았어요.</Text>
            ) : null}
            {evidence.outputs.map((output) => (
              <View key={output.name} style={styles.resultRow}>
                <Text style={styles.resultLabel}>{OUTPUT_LABEL[output.name] ?? '계산 결과'}</Text>
                <Text
                  style={[
                    styles.resultValue,
                    output.name === 'expected_gap_krw' && styles.resultValueCritical,
                  ]}
                >
                  {getOutputValue(output.name, output.value, output.unit)}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </View>
      <Card style={styles.explanationCard}>
        <Text style={styles.explanationTitle}>한 줄로 정리하면</Text>
        <Text style={styles.body}>{humanizeExplanation(evidence.explanation.text)}</Text>
        <View style={styles.explanationSourceBadge}>
          <Text style={styles.explanationSource}>
            {EXPLANATION_SOURCE_LABEL[evidence.explanation.source]}
          </Text>
        </View>
      </Card>
    </Page>
  );
}
