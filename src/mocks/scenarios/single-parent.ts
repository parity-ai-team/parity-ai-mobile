import type {
  AlternativeComparisonResponse,
  AlternativeDetail,
  AnalysisResult,
  RiskItem,
  SafeContributionResult,
} from '@/shared/types';

import { toAlternativeSummary } from './build-alternatives';
import { buildCashflow } from './build-cashflow';
import { buildScenarioEvidenceFixtures } from './build-evidence';
import {
  buildTraceId,
  MOCK_GENERATED_AT,
  MOCK_VERSIONS,
  SYNTHETIC_LIMITATIONS,
  type MockAnalysisResponse,
} from './shared';

// 합성 데이터. docs/api/analysis-response-example.json / alternatives-response-example.json
// 구조 기준. 경산·한부모·불규칙 소득 시나리오. 소득 지연/양육비 미수령
// 토글(stress)에 따라 서로 다른 fixture 두 개를 둔다 — 어느 쪽을 쓸지는
// src/mocks/handlers.ts에서 요청 body를 보고 고른다.
const SCENARIO_SLUG = 'single_parent';

// 토글 off(기본): 돌봄비 급증 정도만 있고, 비상금·부족확률 기준을 통과해
// 안전 적립액이 나온다.
const baselineRisks: RiskItem[] = [
  {
    period: '2027-08',
    severity: 'info',
    cause_codes: ['EXPENSE_SPIKE'],
    expected_gap_krw: -180_000,
    probability: 0.12,
    confidence: 'low',
    source: 'derived',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'risk-baseline', '2027-08')],
  },
];

const baselineAlternativeDetails: AlternativeDetail[] = [
  {
    alternative_id: 'alt_single_parent_liquidity',
    kind: 'liquidity_protection',
    immediate_cash_change_krw: 400_000,
    future_cost_krw: 0,
    recovery_period_months: 1,
    action_burden: 'low',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'alt-baseline', 'liquidity')],
    actions: [
      {
        action_type: 'reduce_discretionary',
        amount_krw: 400_000,
        affected_event_ids: ['discretionary:2027-08'],
        affected_periods: ['2027-08'],
        shift_days: 0,
        shift_months: 0,
      },
    ],
    outcome: {
      minimum_cash_krw: 8_300_000,
      closing_cash_krw: 8_700_000,
      floor_breach_days: 0,
    },
  },
  {
    alternative_id: 'alt_single_parent_cost_min',
    kind: 'cost_minimization',
    immediate_cash_change_krw: 300_000,
    future_cost_krw: 0,
    recovery_period_months: 0,
    action_burden: 'low',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'alt-baseline', 'cost-min')],
    actions: [
      {
        action_type: 'defer_discretionary',
        amount_krw: 300_000,
        affected_event_ids: ['discretionary:2027-08'],
        affected_periods: ['2027-08'],
        shift_days: 0,
        shift_months: 1,
      },
    ],
    outcome: {
      minimum_cash_krw: 8_200_000,
      closing_cash_krw: 8_600_000,
      floor_breach_days: 0,
    },
  },
  {
    alternative_id: 'alt_single_parent_minimum_change',
    kind: 'minimum_change',
    immediate_cash_change_krw: 0,
    future_cost_krw: 0,
    recovery_period_months: 0,
    action_burden: 'low',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'alt-baseline', 'minimum-change')],
    actions: [
      {
        action_type: 'reduce_discretionary',
        amount_krw: 150_000,
        affected_event_ids: ['discretionary:2027-08'],
        affected_periods: ['2027-08'],
        shift_days: 0,
        shift_months: 0,
      },
    ],
    outcome: {
      minimum_cash_krw: 7_900_000,
      closing_cash_krw: 8_500_000,
      floor_breach_days: 0,
    },
  },
];

const baselineSafeContribution: SafeContributionResult = {
  eligible: true,
  monthly_amount_krw: 250_000,
  reason_codes: [],
  valid_until: '2027-12',
  trace_ids: [buildTraceId(SCENARIO_SLUG, 'safe-contribution-baseline', 'pass')],
};

const baselineResult: AnalysisResult = {
  cashflow: buildCashflow(
    '2027-05',
    `${SCENARIO_SLUG}_baseline`,
    {
      confirmed_cash_krw: 9_000_000,
      p20_krw: 7_600_000,
      p50_krw: 8_500_000,
      p80_krw: 9_400_000,
      emergency_floor_krw: 5_000_000,
    },
    [
      {
        period: '2027-08',
        confirmed_cash_krw: 7_900_000,
        p20_krw: 6_500_000,
        p50_krw: 7_300_000,
        p80_krw: 8_200_000,
      },
      {
        period: '2027-09',
        confirmed_cash_krw: 8_200_000,
        p20_krw: 6_800_000,
        p50_krw: 7_700_000,
        p80_krw: 8_600_000,
      },
    ],
  ),
  risks: baselineRisks,
  alternatives: baselineAlternativeDetails.map(toAlternativeSummary),
  safe_contribution: baselineSafeContribution,
  // 1.7.0에서 추가된 nullable 필드. 이 mock 시나리오들은 생활비 맥락을
  // 다루지 않아 null로 둔다.
  living_cost_context: null,
};

// 토글 on: 소득 지연 또는 양육비 미수령이 겹치며 위험월이 앞당겨지고
// 더 큰 폭으로 비상금 기준선 아래로 떨어진다. 안전 적립은 보류로 전환된다.
const stressedRisks: RiskItem[] = [
  {
    period: '2027-07',
    severity: 'critical',
    cause_codes: ['INCOME_DROP', 'RESTRICTED_FUND_MISMATCH'],
    expected_gap_krw: -1_100_000,
    probability: 0.85,
    confidence: 'high',
    source: 'derived',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'risk-stressed', '2027-07')],
  },
];

const stressedAlternativeDetails: AlternativeDetail[] = [
  {
    alternative_id: 'alt_single_parent_stressed_liquidity',
    kind: 'liquidity_protection',
    immediate_cash_change_krw: 1_100_000,
    future_cost_krw: 150_000,
    recovery_period_months: 2,
    action_burden: 'medium',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'alt-stressed', 'liquidity')],
    actions: [
      {
        action_type: 'move_flexible_payment',
        amount_krw: 1_100_000,
        affected_event_ids: ['sch_support:2027-07-10'],
        affected_periods: ['2027-07'],
        shift_days: 10,
        shift_months: 0,
      },
    ],
    outcome: {
      minimum_cash_krw: 5_500_000,
      closing_cash_krw: 7_200_000,
      floor_breach_days: 2,
    },
  },
  {
    alternative_id: 'alt_single_parent_stressed_cost_min',
    kind: 'cost_minimization',
    immediate_cash_change_krw: 800_000,
    future_cost_krw: 0,
    recovery_period_months: 1,
    action_burden: 'medium',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'alt-stressed', 'cost-min')],
    actions: [
      {
        action_type: 'reduce_discretionary',
        amount_krw: 800_000,
        affected_event_ids: ['discretionary:2027-06', 'discretionary:2027-07'],
        affected_periods: ['2027-06', '2027-07'],
        shift_days: 0,
        shift_months: 0,
      },
    ],
    outcome: {
      minimum_cash_krw: 5_200_000,
      closing_cash_krw: 7_000_000,
      floor_breach_days: 5,
    },
  },
  {
    alternative_id: 'alt_single_parent_stressed_minimum_change',
    kind: 'minimum_change',
    immediate_cash_change_krw: 0,
    future_cost_krw: 0,
    recovery_period_months: 0,
    action_burden: 'low',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'alt-stressed', 'minimum-change')],
    actions: [
      {
        action_type: 'defer_discretionary',
        amount_krw: 350_000,
        affected_event_ids: ['discretionary:2027-07'],
        affected_periods: ['2027-07'],
        shift_days: 0,
        shift_months: 1,
      },
    ],
    outcome: {
      minimum_cash_krw: 4_400_000,
      closing_cash_krw: 6_800_000,
      floor_breach_days: 14,
    },
  },
];

const stressedSafeContribution: SafeContributionResult = {
  eligible: false,
  monthly_amount_krw: 0,
  reason_codes: ['BELOW_EMERGENCY_FLOOR'],
  valid_until: '2027-06',
  trace_ids: [buildTraceId(SCENARIO_SLUG, 'safe-contribution-stressed', 'hold')],
};

const stressedResult: AnalysisResult = {
  cashflow: buildCashflow(
    '2027-05',
    `${SCENARIO_SLUG}_stressed`,
    {
      confirmed_cash_krw: 9_000_000,
      p20_krw: 7_600_000,
      p50_krw: 8_500_000,
      p80_krw: 9_400_000,
      emergency_floor_krw: 5_000_000,
    },
    [
      {
        period: '2027-06',
        confirmed_cash_krw: 6_800_000,
        p20_krw: 5_300_000,
        p50_krw: 6_100_000,
        p80_krw: 7_000_000,
      },
      {
        period: '2027-07',
        confirmed_cash_krw: 4_400_000,
        p20_krw: 3_000_000,
        p50_krw: 3_800_000,
        p80_krw: 4_700_000,
      },
      {
        period: '2027-08',
        confirmed_cash_krw: 5_600_000,
        p20_krw: 4_200_000,
        p50_krw: 5_000_000,
        p80_krw: 5_900_000,
      },
    ],
  ),
  risks: stressedRisks,
  alternatives: stressedAlternativeDetails.map(toAlternativeSummary),
  safe_contribution: stressedSafeContribution,
  // 1.7.0에서 추가된 nullable 필드. 이 mock 시나리오들은 생활비 맥락을
  // 다루지 않아 null로 둔다.
  living_cost_context: null,
};

export const singleParentFixture: MockAnalysisResponse = {
  request_id: 'req_mock_single_parent_baseline',
  analysis_id: 'ana_mock_single_parent_stress_baseline',
  status: 'ready',
  revision: 1,
  versions: MOCK_VERSIONS,
  result: baselineResult,
  limitations: [...SYNTHETIC_LIMITATIONS],
  input_hash: 'sha256:mock-single-parent-baseline-input',
  result_hash: 'sha256:mock-single-parent-baseline-result',
  random_seed: 3,
  generated_at: MOCK_GENERATED_AT,
};

export const singleParentStressedFixture: MockAnalysisResponse = {
  request_id: 'req_mock_single_parent_stressed',
  analysis_id: 'ana_mock_single_parent_stress_stressed',
  status: 'ready',
  revision: 1,
  versions: MOCK_VERSIONS,
  result: stressedResult,
  limitations: [...SYNTHETIC_LIMITATIONS],
  input_hash: 'sha256:mock-single-parent-stressed-input',
  result_hash: 'sha256:mock-single-parent-stressed-result',
  random_seed: 4,
  generated_at: MOCK_GENERATED_AT,
};

export const singleParentAlternativesFixture: AlternativeComparisonResponse = {
  request_id: 'req_mock_single_parent_baseline_alternatives',
  analysis_id: singleParentFixture.analysis_id,
  revision: singleParentFixture.revision,
  current_state: {
    minimum_cash_krw: 7_900_000,
    closing_cash_krw: 8_700_000,
    floor_breach_days: 0,
  },
  alternatives: baselineAlternativeDetails,
  model_version: MOCK_VERSIONS.model,
  generated_at: MOCK_GENERATED_AT,
};

export const singleParentStressedAlternativesFixture: AlternativeComparisonResponse = {
  request_id: 'req_mock_single_parent_stressed_alternatives',
  analysis_id: singleParentStressedFixture.analysis_id,
  revision: singleParentStressedFixture.revision,
  current_state: {
    minimum_cash_krw: 4_400_000,
    closing_cash_krw: 6_800_000,
    floor_breach_days: 18,
  },
  alternatives: stressedAlternativeDetails,
  model_version: MOCK_VERSIONS.model,
  generated_at: MOCK_GENERATED_AT,
};

export const singleParentEvidenceFixtures = buildScenarioEvidenceFixtures({
  analysisId: singleParentFixture.analysis_id,
  revision: singleParentFixture.revision,
  risks: baselineRisks,
  alternatives: baselineAlternativeDetails,
  safeContribution: baselineSafeContribution,
});

export const singleParentStressedEvidenceFixtures = buildScenarioEvidenceFixtures({
  analysisId: singleParentStressedFixture.analysis_id,
  revision: singleParentStressedFixture.revision,
  risks: stressedRisks,
  alternatives: stressedAlternativeDetails,
  safeContribution: stressedSafeContribution,
});
