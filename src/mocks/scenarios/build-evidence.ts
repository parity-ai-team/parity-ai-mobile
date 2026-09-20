import type {
  AlternativeDetail,
  EvidenceInputFact,
  EvidenceOutputFact,
  EvidenceResponse,
  EvidenceRuleFact,
  RiskItem,
  SafeContributionResult,
} from '@/shared/types';

import { MOCK_GENERATED_AT } from './shared';

interface EvidenceContext {
  analysisId: string;
  revision: number;
  traceId: string;
}

function buildEvidenceResponse(
  context: EvidenceContext,
  resultType: EvidenceResponse['evidence']['result_type'],
  resultRef: string,
  inputs: EvidenceInputFact[],
  rules: EvidenceRuleFact[],
  outputs: EvidenceOutputFact[],
  explanationText: string,
): EvidenceResponse {
  return {
    request_id: `req_mock_evidence_${context.traceId}`,
    analysis_id: context.analysisId,
    revision: context.revision,
    evidence: {
      trace_id: context.traceId,
      result_type: resultType,
      result_ref: resultRef,
      inputs,
      rules,
      outputs,
      explanation: { text: explanationText, source: 'template', fallback_reason: null },
    },
    generated_at: MOCK_GENERATED_AT,
  };
}

function buildRiskEvidence(context: EvidenceContext, risk: RiskItem): EvidenceResponse {
  const inputs: EvidenceInputFact[] = risk.cause_codes.map((code, index) => ({
    name: `cause_code_${index + 1}`,
    value: code,
    source: risk.source,
  }));
  const rules: EvidenceRuleFact[] = [
    {
      rule_id: 'rule_cashflow_risk_detection',
      version: 'kr-daegu-2026-09',
      description: '월별 가용 현금이 비상금 기준 아래로 내려가는지 판정하는 규칙',
    },
  ];
  const outputs: EvidenceOutputFact[] = [
    { name: 'expected_gap_krw', value: String(risk.expected_gap_krw), unit: '원' },
    { name: 'severity', value: risk.severity, unit: null },
  ];
  const explanationText = `${risk.period}월은 ${risk.cause_codes.join(', ')} 요인이 겹쳐 예상 부족액이 ${risk.expected_gap_krw.toLocaleString('ko-KR')}원이에요.`;

  return buildEvidenceResponse(context, 'risk', `risk:${risk.period}`, inputs, rules, outputs, explanationText);
}

function buildAlternativeEvidence(context: EvidenceContext, detail: AlternativeDetail): EvidenceResponse {
  const inputs: EvidenceInputFact[] = detail.actions.map((action, index) => ({
    name: `action_${index + 1}_type`,
    value: action.action_type,
    source: 'derived',
  }));
  const rules: EvidenceRuleFact[] = [
    {
      rule_id: 'rule_alternative_constraint_search',
      version: 'kr-daegu-2026-09',
      description: '사용자가 허용한 범위 안에서 실행 가능한 대안을 찾는 규칙',
    },
  ];
  const outputs: EvidenceOutputFact[] = [
    { name: 'minimum_cash_krw', value: String(detail.outcome.minimum_cash_krw), unit: '원' },
    { name: 'closing_cash_krw', value: String(detail.outcome.closing_cash_krw), unit: '원' },
    { name: 'floor_breach_days', value: String(detail.outcome.floor_breach_days), unit: '일' },
  ];
  const explanationText = `이 대안은 ${detail.actions.length}건의 조치로 즉시 현금 ${detail.immediate_cash_change_krw.toLocaleString('ko-KR')}원을 확보해요. 실행 부담은 ${detail.action_burden}이에요.`;

  return buildEvidenceResponse(
    context,
    'alternative',
    `alternative:${detail.alternative_id}`,
    inputs,
    rules,
    outputs,
    explanationText,
  );
}

function buildSafeContributionEvidence(
  context: EvidenceContext,
  safeContribution: SafeContributionResult,
): EvidenceResponse {
  const reasonCodes = safeContribution.reason_codes ?? [];
  const inputs: EvidenceInputFact[] = reasonCodes.map((code, index) => ({
    name: `reason_code_${index + 1}`,
    value: code,
    source: 'policy_rule',
  }));
  const rules: EvidenceRuleFact[] = [
    {
      rule_id: 'rule_safe_contribution_gate',
      version: 'kr-daegu-2026-09',
      description: '비상금 기준과 부족확률 기준을 모두 통과해야 안전 적립을 허용하는 규칙',
    },
  ];
  const outputs: EvidenceOutputFact[] = [
    { name: 'eligible', value: String(safeContribution.eligible), unit: null },
    { name: 'monthly_amount_krw', value: String(safeContribution.monthly_amount_krw), unit: '원' },
  ];
  const explanationText = safeContribution.eligible
    ? `비상금·부족확률 기준을 통과해 ${safeContribution.valid_until}까지 월 ${safeContribution.monthly_amount_krw.toLocaleString('ko-KR')}원 적립이 안전해요.`
    : `${reasonCodes.join(', ')} 때문에 아직 안전한 적립 금액을 제시하지 않아요.`;

  return buildEvidenceResponse(
    context,
    'safe_contribution',
    'safe_contribution',
    inputs,
    rules,
    outputs,
    explanationText,
  );
}

export interface ScenarioEvidenceInput {
  analysisId: string;
  revision: number;
  risks: RiskItem[];
  alternatives: AlternativeDetail[];
  safeContribution: SafeContributionResult;
}

// 시나리오 하나(risks·alternatives·safe_contribution)가 참조하는 trace_id마다
// EvidenceResponse를 하나씩 만들어 trace_id를 key로 하는 표를 돌려준다. 각
// 값의 근거(원인 코드·조치·기준)를 새로 손으로 쓰지 않고, 이미 그 시나리오
// fixture에 있는 값에서 파생시켜 두 fixture가 어긋나지 않게 한다
// (build-alternatives.ts의 toAlternativeSummary와 같은 이유).
export function buildScenarioEvidenceFixtures({
  analysisId,
  revision,
  risks,
  alternatives,
  safeContribution,
}: ScenarioEvidenceInput): Record<string, EvidenceResponse> {
  const fixtures: Record<string, EvidenceResponse> = {};

  for (const risk of risks) {
    for (const traceId of risk.trace_ids ?? []) {
      fixtures[traceId] = buildRiskEvidence({ analysisId, revision, traceId }, risk);
    }
  }

  for (const alternative of alternatives) {
    for (const traceId of alternative.trace_ids ?? []) {
      fixtures[traceId] = buildAlternativeEvidence({ analysisId, revision, traceId }, alternative);
    }
  }

  for (const traceId of safeContribution.trace_ids ?? []) {
    fixtures[traceId] = buildSafeContributionEvidence({ analysisId, revision, traceId }, safeContribution);
  }

  return fixtures;
}
