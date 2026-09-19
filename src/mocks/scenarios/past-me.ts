import type { AnalysisResult, SuccessEnvelope } from '@/shared/types';

import { buildCashflow } from './build-cashflow';
import { MOCK_GENERATED_AT, MOCK_VERSIONS, SYNTHETIC_LIMITATIONS } from './shared';

// 합성 데이터. 경산·외벌이 전환 시나리오(Past Me 기준 + 현재 조건 보정).
// 휴직급여 지급이 지연되며 2027-10에 비상금 기준선 아래로 떨어지고
// (first_birth보다 더 큰 폭), 2028-07까지 걸쳐 회복한다 — 연도 경계를
// 넘는 12개월 구간도 함께 검증한다.
const result: AnalysisResult = {
  cashflow: buildCashflow(
    '2027-08',
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
  risks: [
    {
      period: '2027-10',
      severity: 'critical',
      cause_codes: ['PAYMENT_DELAY', 'LOAN_DUE'],
      expected_gap_krw: -1_450_000,
      trace_ids: ['trc_mock_past_me_01'],
    },
  ],
  alternatives: [
    {
      option_id: 'baseline',
      label: '현상유지',
      is_baseline: true,
      min_cash_krw: 4_050_000,
      shortage_probability: 0.34,
      total_cost_krw: 0,
      recovery_months: 0,
    },
    {
      option_id: 'leave_pay_advance',
      label: '육아휴직급여 선지급 신청',
      is_baseline: false,
      min_cash_krw: 5_200_000,
      shortage_probability: 0.21,
      total_cost_krw: 300_000,
      recovery_months: 2,
    },
  ],
  safe_contribution: {
    eligible: false,
    monthly_amount_krw: 0,
    reason_codes: ['SHORTAGE_RISK_HIGH'],
    valid_until: '2027-09',
  },
};

export const pastMeFixture: SuccessEnvelope<AnalysisResult> = {
  request_id: 'req_mock_past_me',
  analysis_id: 'ana_mock_past_me_transition',
  status: 'ready',
  revision: 1,
  versions: MOCK_VERSIONS,
  result,
  limitations: SYNTHETIC_LIMITATIONS,
  generated_at: MOCK_GENERATED_AT,
};
