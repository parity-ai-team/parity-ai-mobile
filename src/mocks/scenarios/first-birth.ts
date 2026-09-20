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

// 합성 데이터. docs/api/analysis-response-example.json 구조 기준. 초산·맞벌이
// 가구(current_cash 12,000,000 / emergency_floor 6,000,000 / leave_start
// 2027-01)를 가정한 ready 응답이다. 2027-04에 소득 감소와 카드 대금이 겹치며
// 비상금 기준선 근처까지 내려갔다가 연말까지 회복한다.
const SCENARIO_SLUG = 'first_birth';

const risks: RiskItem[] = [
  {
    period: '2027-04',
    severity: 'warning',
    cause_codes: ['INCOME_DROP', 'CARD_DUE_COLLISION'],
    expected_gap_krw: -650_000,
    probability: 0.45,
    confidence: 'medium',
    source: 'derived',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'risk', '2027-04')],
  },
];

const alternativeDetails: AlternativeDetail[] = [
  {
    alternative_id: 'alt_first_birth_liquidity',
    kind: 'liquidity_protection',
    immediate_cash_change_krw: 1_200_000,
    future_cost_krw: 0,
    recovery_period_months: 2,
    action_burden: 'medium',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'alt', 'liquidity')],
    actions: [
      {
        action_type: 'reduce_discretionary',
        amount_krw: 1_200_000,
        affected_event_ids: ['discretionary:2027-03', 'discretionary:2027-04'],
        affected_periods: ['2027-03', '2027-04'],
        shift_days: 0,
        shift_months: 0,
      },
    ],
    outcome: {
      minimum_cash_krw: 7_450_000,
      closing_cash_krw: 8_700_000,
      floor_breach_days: 0,
    },
  },
  {
    alternative_id: 'alt_first_birth_cost_min',
    kind: 'cost_minimization',
    immediate_cash_change_krw: 1_200_000,
    future_cost_krw: 1_200_000,
    recovery_period_months: 3,
    action_burden: 'medium',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'alt', 'cost-min')],
    actions: [
      {
        action_type: 'move_flexible_payment',
        amount_krw: 2_400_000,
        affected_event_ids: ['sch_card:2027-04-14'],
        affected_periods: ['2027-04'],
        shift_days: 5,
        shift_months: 0,
      },
    ],
    outcome: {
      minimum_cash_krw: 7_450_000,
      closing_cash_krw: 8_700_000,
      floor_breach_days: 0,
    },
  },
  {
    alternative_id: 'alt_first_birth_minimum_change',
    kind: 'minimum_change',
    immediate_cash_change_krw: 0,
    future_cost_krw: 0,
    recovery_period_months: 0,
    action_burden: 'low',
    trace_ids: [buildTraceId(SCENARIO_SLUG, 'alt', 'minimum-change')],
    actions: [
      {
        action_type: 'defer_discretionary',
        amount_krw: 600_000,
        affected_event_ids: ['discretionary:2027-04'],
        affected_periods: ['2027-04'],
        shift_days: 0,
        shift_months: 1,
      },
    ],
    outcome: {
      minimum_cash_krw: 6_250_000,
      closing_cash_krw: 7_500_000,
      floor_breach_days: 0,
    },
  },
];

const safeContribution: SafeContributionResult = {
  eligible: false,
  monthly_amount_krw: 0,
  reason_codes: ['BELOW_EMERGENCY_FLOOR'],
  valid_until: '2027-03',
  trace_ids: [buildTraceId(SCENARIO_SLUG, 'safe-contribution', 'hold')],
};

const result: AnalysisResult = {
  cashflow: buildCashflow(
    '2027-01',
    SCENARIO_SLUG,
    {
      confirmed_cash_krw: 9_500_000,
      p20_krw: 8_000_000,
      p50_krw: 9_000_000,
      p80_krw: 10_000_000,
      emergency_floor_krw: 6_000_000,
    },
    [
      {
        period: '2027-01',
        confirmed_cash_krw: 8_400_000,
        p20_krw: 6_900_000,
        p50_krw: 7_900_000,
        p80_krw: 8_800_000,
      },
      {
        period: '2027-02',
        confirmed_cash_krw: 7_600_000,
        p20_krw: 6_300_000,
        p50_krw: 7_100_000,
        p80_krw: 8_000_000,
      },
      {
        period: '2027-03',
        confirmed_cash_krw: 6_900_000,
        p20_krw: 5_800_000,
        p50_krw: 6_500_000,
        p80_krw: 7_300_000,
      },
      {
        period: '2027-04',
        confirmed_cash_krw: 6_250_000,
        p20_krw: 5_100_000,
        p50_krw: 5_900_000,
        p80_krw: 6_700_000,
      },
      {
        period: '2027-05',
        confirmed_cash_krw: 6_800_000,
        p20_krw: 5_600_000,
        p50_krw: 6_400_000,
        p80_krw: 7_200_000,
      },
      {
        period: '2027-06',
        confirmed_cash_krw: 7_500_000,
        p20_krw: 6_200_000,
        p50_krw: 7_100_000,
        p80_krw: 7_900_000,
      },
    ],
  ),
  risks,
  alternatives: alternativeDetails.map(toAlternativeSummary),
  safe_contribution: safeContribution,
  // 1.7.0에서 추가된 nullable 필드. 이 mock 시나리오들은 생활비 맥락을
  // 다루지 않아 null로 둔다.
  living_cost_context: null,
};

export const firstBirthFixture: MockAnalysisResponse = {
  request_id: 'req_mock_first_birth',
  analysis_id: 'ana_mock_first_birth_dual_income',
  status: 'ready',
  revision: 1,
  versions: MOCK_VERSIONS,
  result,
  limitations: [...SYNTHETIC_LIMITATIONS],
  input_hash: 'sha256:mock-first-birth-input',
  result_hash: 'sha256:mock-first-birth-result',
  random_seed: 1,
  generated_at: MOCK_GENERATED_AT,
};

export const firstBirthAlternativesFixture: AlternativeComparisonResponse = {
  request_id: 'req_mock_first_birth_alternatives',
  analysis_id: firstBirthFixture.analysis_id,
  revision: firstBirthFixture.revision,
  current_state: {
    minimum_cash_krw: 6_250_000,
    closing_cash_krw: 7_500_000,
    floor_breach_days: 0,
  },
  alternatives: alternativeDetails,
  model_version: MOCK_VERSIONS.model,
  generated_at: MOCK_GENERATED_AT,
};

export const firstBirthEvidenceFixtures = buildScenarioEvidenceFixtures({
  analysisId: firstBirthFixture.analysis_id,
  revision: firstBirthFixture.revision,
  risks,
  alternatives: alternativeDetails,
  safeContribution,
});
