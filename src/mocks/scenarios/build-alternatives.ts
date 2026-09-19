import type { AlternativeDetail, AlternativeSummary } from '@/shared/types';

// AnalysisResult.alternatives(AlternativeSummary[], 최대 3개)와
// GET .../alternatives 응답(AlternativeDetail[])은 alternative_id·kind 등
// 핵심 필드를 공유한다(docs/api/analysis-response-example.json의 result.alternatives가
// docs/api/alternatives-response-example.json의 alternatives에서 actions·outcome만
// 뺀 부분집합). 두 fixture가 값을 따로 손으로 맞추다 어긋나지 않도록, 상세
// 정의 하나에서 요약을 파생시킨다.
export function toAlternativeSummary(detail: AlternativeDetail): AlternativeSummary {
  const {
    alternative_id,
    kind,
    immediate_cash_change_krw,
    future_cost_krw,
    recovery_period_months,
    action_burden,
    trace_ids,
  } = detail;

  return {
    alternative_id,
    kind,
    immediate_cash_change_krw,
    future_cost_krw,
    recovery_period_months,
    action_burden,
    trace_ids,
  };
}
