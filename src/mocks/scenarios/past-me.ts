import type {
  AlternativeComparisonResponse,
  AlternativeDetail,
  AnalysisResult,
  RiskItem,
  SafeContributionResult,
} from '@/shared/types';

import { toAlternativeSummary } from './build-alternatives';
import { buildCashflow } from './build-cashflow';
import {
  buildTraceId,
  MOCK_GENERATED_AT,
  MOCK_VERSIONS,
  SYNTHETIC_LIMITATIONS,
  type MockAnalysisResponse,
} from './shared';

// 합성 데이터. docs/api/analysis-response-example.json 구조 기준. 경산·외벌이
// 전환 시나리오(Past Me 기준 + 현재 조건 보정). 휴직급여 지급이 지연되며
// 2027-10에 비상금 기준선 아래로 떨어지고(first_birth보다 더 큰 폭),
// 2028-07까지 걸쳐 회복한다 — 연도 경계를 넘는 12개월 구간도 함께 검증한다.
const SCENARIO_SLUG = 'past_me';

const risks: RiskItem[] = [
  {
    period: '2027-10',
    severity: 'critical',
    cause_codes: ['PAYMENT_DELAY', 'LOAN_DUE'],
    expected_gap_krw: -1_450_000,
    probability: 0.72,
    confidence: 'medium',
    source: 'derived',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'risk', '2027-10')],
  },
];

const alternativeDetails: AlternativeDetail[] = [
  {
    alternative_id: 'alt_past_me_liquidity',
    kind: 'liquidity_protection',
    immediate_cash_change_krw: 1_150_000,
    future_cost_krw: 300_000,
    recovery_period_months: 2,
    action_burden: 'medium',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'alt', 'liquidity')],
    actions: [
      {
        action_type: 'move_flexible_payment',
        amount_krw: 1_150_000,
        affected_event_ids: ['sch_loan:2027-10-05'],
        affected_periods: ['2027-10'],
        shift_days: 7,
        shift_months: 0,
      },
    ],
    outcome: {
      minimum_cash_krw: 5_200_000,
      closing_cash_krw: 8_200_000,
      floor_breach_days: 0,
    },
  },
  {
    alternative_id: 'alt_past_me_cost_min',
    kind: 'cost_minimization',
    immediate_cash_change_krw: 900_000,
    future_cost_krw: 0,
    recovery_period_months: 1,
    action_burden: 'medium',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'alt', 'cost-min')],
    actions: [
      {
        action_type: 'reduce_discretionary',
        amount_krw: 900_000,
        affected_event_ids: ['discretionary:2027-09', 'discretionary:2027-10'],
        affected_periods: ['2027-09', '2027-10'],
        shift_days: 0,
        shift_months: 0,
      },
    ],
    outcome: {
      minimum_cash_krw: 4_950_000,
      closing_cash_krw: 8_100_000,
      floor_breach_days: 3,
    },
  },
  {
    alternative_id: 'alt_past_me_minimum_change',
    kind: 'minimum_change',
    immediate_cash_change_krw: 0,
    future_cost_krw: 0,
    recovery_period_months: 0,
    action_burden: 'low',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'alt', 'minimum-change')],
    actions: [
      {
        action_type: 'defer_discretionary',
        amount_krw: 400_000,
        affected_event_ids: ['discretionary:2027-10'],
        affected_periods: ['2027-10'],
        shift_days: 0,
        shift_months: 1,
      },
    ],
    outcome: {
      minimum_cash_krw: 4_050_000,
      closing_cash_krw: 8_000_000,
      floor_breach_days: 9,
    },
  },
];

const safeContribution: SafeContributionResult = {
  eligible: false,
  monthly_amount_krw: 0,
  reason_codes: ['SHORTAGE_RISK_HIGH'],
  valid_until: '2027-09',
  trace_ids: [buildTraceId(SCENARIO_SLUG, 'safe-contribution', 'hold')],
};

const result: AnalysisResult = {
  cashflow: buildCashflow(
    '2027-08',
    SCENARIO_SLUG,
    {
      confirmed_cash_krw: 7_000_000,
      p20_krw: 5_600_000,
      p50_krw: 6_400_000,
      p80_krw: 7_300_000,
      emergency_floor_krw: 5_500_000,
    },
    [
      {
        period: '2027-09',
        confirmed_cash_krw: 5_800_000,
        p20_krw: 4_300_000,
        p50_krw: 5_100_000,
        p80_krw: 6_000_000,
      },
      {
        period: '2027-10',
        confirmed_cash_krw: 4_050_000,
        p20_krw: 2_800_000,
        p50_krw: 3_600_000,
        p80_krw: 4_500_000,
      },
      {
        period: '2027-11',
        confirmed_cash_krw: 5_100_000,
        p20_krw: 3_800_000,
        p50_krw: 4_600_000,
        p80_krw: 5_500_000,
      },
      {
        period: '2027-12',
        confirmed_cash_krw: 5_900_000,
        p20_krw: 4_600_000,
        p50_krw: 5_400_000,
        p80_krw: 6_300_000,
      },
      {
        period: '2028-07',
        confirmed_cash_krw: 8_200_000,
        p20_krw: 6_800_000,
        p50_krw: 7_700_000,
        p80_krw: 8_600_000,
      },
    ],
  ),
  risks,
  alternatives: alternativeDetails.map(toAlternativeSummary),
  safe_contribution: safeContribution,
};

export const pastMeFixture: MockAnalysisResponse = {
  request_id: 'req_mock_past_me',
  analysis_id: 'ana_mock_past_me_transition',
  status: 'ready',
  revision: 1,
  versions: MOCK_VERSIONS,
  result,
  limitations: [...SYNTHETIC_LIMITATIONS],
  input_hash: 'sha256:mock-past-me-input',
  result_hash: 'sha256:mock-past-me-result',
  random_seed: 2,
  generated_at: MOCK_GENERATED_AT,
};

export const pastMeAlternativesFixture: AlternativeComparisonResponse = {
  request_id: 'req_mock_past_me_alternatives',
  analysis_id: pastMeFixture.analysis_id,
  revision: pastMeFixture.revision,
  current_state: {
    minimum_cash_krw: 4_050_000,
    closing_cash_krw: 8_200_000,
    floor_breach_days: 12,
  },
  alternatives: alternativeDetails,
  model_version: MOCK_VERSIONS.model,
  generated_at: MOCK_GENERATED_AT,
};
