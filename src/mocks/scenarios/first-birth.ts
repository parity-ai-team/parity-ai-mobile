import type { AnalysisResult, SuccessEnvelope } from '@/shared/types';

import { buildCashflow } from './build-cashflow';
import { MOCK_GENERATED_AT, MOCK_VERSIONS, SYNTHETIC_LIMITATIONS } from './shared';

// 합성 데이터. docs/integration.md "POST /v1/analyses" 요청 예시와 같은 입력
// (current_cash 12,000,000 / emergency_floor 6,000,000 / leave_start 2027-01)을
// 가정한 ready 응답이다. 2027-04에 소득 감소와 카드 대금이 겹치며 비상금
// 기준선 근처까지 내려갔다가 연말까지 회복한다.
const result: AnalysisResult = {
  cashflow: buildCashflow(
    '2027-01',
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
  risks: [
    {
      period: '2027-04',
      severity: 'warning',
      cause_codes: ['INCOME_DROP', 'CARD_DUE_COLLISION'],
      expected_gap_krw: -650_000,
      trace_ids: ['trc_mock_first_birth_01', 'trc_mock_first_birth_02'],
    },
  ],
  alternatives: [
    {
      option_id: 'baseline',
      label: '현상유지',
      is_baseline: true,
      min_cash_krw: 6_250_000,
      shortage_probability: 0.18,
      total_cost_krw: 0,
      recovery_months: 0,
    },
    {
      option_id: 'extend_leave_1m',
      label: '육아휴직 1개월 연장',
      is_baseline: false,
      min_cash_krw: 5_400_000,
      shortage_probability: 0.27,
      total_cost_krw: 1_200_000,
      recovery_months: 3,
    },
  ],
  safe_contribution: {
    eligible: false,
    monthly_amount_krw: 0,
    reason_codes: ['BELOW_EMERGENCY_FLOOR'],
    valid_until: '2027-03',
  },
};

export const firstBirthFixture: SuccessEnvelope<AnalysisResult> = {
  request_id: 'req_mock_first_birth',
  analysis_id: 'ana_mock_first_birth_dual_income',
  status: 'ready',
  revision: 1,
  versions: MOCK_VERSIONS,
  result,
  limitations: SYNTHETIC_LIMITATIONS,
  generated_at: MOCK_GENERATED_AT,
};
