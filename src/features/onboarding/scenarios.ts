import type { AnalysisCreateRequest, DemoScenarioSummary } from '@/shared/types';

import { ONBOARDING_DATA_VERSION } from './constants';

// GET /v1/demo-scenarios(실서버 https://parity-ai-backend.onrender.com,
// 2026-09-20 확인)가 실제로 내려주는 scenario_id 문자열이다. 이전에 쓰던
// past_me_transition·single_parent_stress는 docs/api 예시에서 추측한 이름이라
// 서버 값과 달랐다 — api 모드에서 그 값을 보내면 422가 난다.
export type DemoScenarioId =
  | 'first_birth_dual_income'
  | 'second_birth_single_income'
  | 'second_birth_single_parent_irregular_income';

// 실제 DemoScenarioSummary 형태를 따르되, 이 화면(S03 선택 카드)이 쓰지 않는
// coverage는 뺀 부분집합만 쓴다. default_analysis는 features/financial-input
// 화면들이 데모 선택 시 폼을 미리 채우는 데 쓴다.
export type DemoScenarioMeta = Pick<
  DemoScenarioSummary,
  | 'scenario_id'
  | 'title'
  | 'description'
  | 'route'
  | 'data_badge'
  | 'data_version'
  | 'default_analysis'
> & { scenario_id: DemoScenarioId };

// 아래 세 default_analysis는 실서버 GET /v1/demo-scenarios 응답을 그대로
// 옮긴 값이다(2026-09-20 확인) — mock 계층이 아직 이 엔드포인트를 다루지
// 않아(src/mocks/README.md) 여기 상수로 둔다.
const FIRST_BIRTH_DEFAULT_ANALYSIS: AnalysisCreateRequest = {
  scenario_id: 'first_birth_dual_income',
  dataset_id: null,
  data_mode: 'synthetic',
  household: {
    expected_month: '2027-03',
    birth_order: 1,
    household_type: 'two_adult',
    dependents: 0,
  },
  financial: {
    current_cash_krw: 12_000_000,
    emergency_floor_krw: 6_000_000,
    monthly_income_krw: 5_800_000,
    fixed_obligations_krw: 3_100_000,
    monthly_discretionary_krw: 500_000,
  },
  plan: {
    leave_start: '2027-01',
    leave_months: 6,
  },
  stress: {
    income_delay_weeks: 0,
    child_support_missed: false,
  },
  alternative_preferences: {
    max_monthly_discretionary_reduction_krw: 200_000,
    discretionary_deferral_months: 1,
    allow_flexible_payment_dates: true,
  },
};

const SECOND_BIRTH_SINGLE_INCOME_DEFAULT_ANALYSIS: AnalysisCreateRequest = {
  scenario_id: 'second_birth_single_income',
  dataset_id: null,
  data_mode: 'synthetic',
  household: {
    expected_month: '2027-02',
    birth_order: 2,
    household_type: 'two_adult',
    dependents: 1,
  },
  financial: {
    current_cash_krw: 8_500_000,
    emergency_floor_krw: 6_000_000,
    monthly_income_krw: 3_600_000,
    fixed_obligations_krw: 3_120_000,
    monthly_discretionary_krw: 300_000,
  },
  plan: {
    leave_start: '2026-12',
    leave_months: 10,
  },
  stress: {
    income_delay_weeks: 0,
    child_support_missed: false,
  },
  alternative_preferences: {
    max_monthly_discretionary_reduction_krw: 150_000,
    discretionary_deferral_months: 1,
    allow_flexible_payment_dates: true,
  },
};

const SECOND_BIRTH_SINGLE_PARENT_DEFAULT_ANALYSIS: AnalysisCreateRequest = {
  scenario_id: 'second_birth_single_parent_irregular_income',
  dataset_id: null,
  data_mode: 'synthetic',
  household: {
    expected_month: '2027-01',
    birth_order: 2,
    household_type: 'single_parent',
    dependents: 1,
  },
  financial: {
    current_cash_krw: 4_200_000,
    emergency_floor_krw: 4_500_000,
    monthly_income_krw: 3_000_000,
    fixed_obligations_krw: 2_630_000,
    monthly_discretionary_krw: 200_000,
  },
  plan: {
    leave_start: null,
    leave_months: 0,
  },
  // 서버 기본값 자체가 지연·미수령을 포함한다(baseline이 곧 스트레스 상황).
  stress: {
    income_delay_weeks: 4,
    child_support_missed: true,
  },
  alternative_preferences: {
    max_monthly_discretionary_reduction_krw: 100_000,
    discretionary_deferral_months: 1,
    allow_flexible_payment_dates: true,
  },
};

export const DEMO_SCENARIOS: readonly DemoScenarioMeta[] = [
  {
    scenario_id: 'first_birth_dual_income',
    title: '초산 맞벌이',
    description: '확정 금융정보와 휴직·돌봄 계획을 우선하는 초산 기준 경로',
    route: 'first_birth',
    data_badge: 'synthetic',
    data_version: ONBOARDING_DATA_VERSION,
    default_analysis: FIRST_BIRTH_DEFAULT_ANALYSIS,
  },
  {
    scenario_id: 'second_birth_single_income',
    title: '경산 외벌이 전환',
    description: '첫째 출산 전후 Past Me와 현재 외벌이 조건의 차이를 반영하는 경산 경로',
    route: 'past_me',
    data_badge: 'synthetic',
    data_version: ONBOARDING_DATA_VERSION,
    default_analysis: SECOND_BIRTH_SINGLE_INCOME_DEFAULT_ANALYSIS,
  },
  {
    scenario_id: 'second_birth_single_parent_irregular_income',
    title: '경산 한부모 불규칙소득',
    description: '소득 지급 지연과 양육비 미수령을 독립 스트레스 조건으로 적용하는 경산 경로',
    route: 'single_parent_stress',
    data_badge: 'synthetic',
    data_version: ONBOARDING_DATA_VERSION,
    default_analysis: SECOND_BIRTH_SINGLE_PARENT_DEFAULT_ANALYSIS,
  },
];
