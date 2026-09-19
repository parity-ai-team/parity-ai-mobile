import type { AnalysisResult, SuccessEnvelope } from '@/shared/types';

import { buildCashflow } from './build-cashflow';
import { MOCK_GENERATED_AT, MOCK_VERSIONS, SYNTHETIC_LIMITATIONS } from './shared';

// 합성 데이터. 경산·한부모·불규칙 소득 시나리오. 소득 지연/양육비 미수령
// 토글(stress)에 따라 서로 다른 fixture 두 개를 둔다 — 어느 쪽을 쓸지는
// src/mocks/handlers.ts에서 요청 body를 보고 고른다.

// 토글 off(기본): 돌봄비 급증 정도만 있고, 비상금·부족확률 기준을 통과해
// 안전 적립액이 나온다.
const baselineResult: AnalysisResult = {
  cashflow: buildCashflow(
    '2027-05',
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
  risks: [
    {
      period: '2027-08',
      severity: 'info',
      cause_codes: ['EXPENSE_SPIKE'],
      expected_gap_krw: -180_000,
      trace_ids: ['trc_mock_single_parent_01'],
    },
  ],
  alternatives: [
    {
      option_id: 'baseline',
      label: '현상유지',
      is_baseline: true,
      min_cash_krw: 7_900_000,
      shortage_probability: 0.06,
      total_cost_krw: 0,
      recovery_months: 0,
    },
    {
      option_id: 'childcare_subsidy',
      label: '돌봄비 지원 신청',
      is_baseline: false,
      min_cash_krw: 8_300_000,
      shortage_probability: 0.03,
      total_cost_krw: 0,
      recovery_months: 1,
    },
  ],
  safe_contribution: {
    eligible: true,
    monthly_amount_krw: 250_000,
    reason_codes: [],
    valid_until: '2027-12',
  },
};

// 토글 on: 소득 지연 또는 양육비 미수령이 겹치며 위험월이 앞당겨지고
// 더 큰 폭으로 비상금 기준선 아래로 떨어진다. 안전 적립은 보류로 전환된다.
const stressedResult: AnalysisResult = {
  cashflow: buildCashflow(
    '2027-05',
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
  risks: [
    {
      period: '2027-07',
      severity: 'critical',
      cause_codes: ['INCOME_DROP', 'RESTRICTED_FUND_MISMATCH'],
      expected_gap_krw: -1_100_000,
      trace_ids: ['trc_mock_single_parent_stressed_01', 'trc_mock_single_parent_stressed_02'],
    },
  ],
  alternatives: [
    {
      option_id: 'baseline',
      label: '현상유지',
      is_baseline: true,
      min_cash_krw: 4_400_000,
      shortage_probability: 0.29,
      total_cost_krw: 0,
      recovery_months: 0,
    },
    {
      option_id: 'apply_child_support_enforcement',
      label: '양육비 이행 지원 신청',
      is_baseline: false,
      min_cash_krw: 5_500_000,
      shortage_probability: 0.19,
      total_cost_krw: 150_000,
      recovery_months: 2,
    },
  ],
  safe_contribution: {
    eligible: false,
    monthly_amount_krw: 0,
    reason_codes: ['BELOW_EMERGENCY_FLOOR'],
    valid_until: '2027-06',
  },
};

export const singleParentFixture: SuccessEnvelope<AnalysisResult> = {
  request_id: 'req_mock_single_parent_baseline',
  analysis_id: 'ana_mock_single_parent_stress_baseline',
  status: 'ready',
  revision: 1,
  versions: MOCK_VERSIONS,
  result: baselineResult,
  limitations: SYNTHETIC_LIMITATIONS,
  generated_at: MOCK_GENERATED_AT,
};

export const singleParentStressedFixture: SuccessEnvelope<AnalysisResult> = {
  request_id: 'req_mock_single_parent_stressed',
  analysis_id: 'ana_mock_single_parent_stress_stressed',
  status: 'ready',
  revision: 1,
  versions: MOCK_VERSIONS,
  result: stressedResult,
  limitations: SYNTHETIC_LIMITATIONS,
  generated_at: MOCK_GENERATED_AT,
};
