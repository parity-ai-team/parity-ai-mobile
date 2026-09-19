import type { AnalysisCreateRequest, DemoScenarioSummary } from '@/shared/types';

import { ONBOARDING_DATA_VERSION } from './constants';

// src/mocks/handlers.ts가 실제로 라우팅하는 scenario_id 문자열을 그대로 쓴다.
// mock 계층은 아직 GET /v1/demo-scenarios를 다루지 않아(src/mocks/README.md
// 참고) 목록 자체는 여기 메타데이터로 정의한다.
export type DemoScenarioId =
  'first_birth_dual_income' | 'past_me_transition' | 'single_parent_stress';

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

// docs/api/openapi-1.5.0.json DemoScenarioListResponse 예시의 first_birth_dual_income
// default_analysis를 그대로 쓴다. past_me_transition·single_parent_stress는
// 같은 필드 구조로 만든 합성 값이다 — 두 값의 서사(past_me: 외벌이 전환,
// single_parent: 한부모)는 src/mocks/scenarios의 mock 결과 fixture와 맞췄다.
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
};

const PAST_ME_DEFAULT_ANALYSIS: AnalysisCreateRequest = {
  scenario_id: 'past_me_transition',
  dataset_id: null,
  data_mode: 'synthetic',
  household: {
    expected_month: '2027-08',
    birth_order: 2,
    household_type: 'two_adult',
    dependents: 1,
  },
  financial: {
    current_cash_krw: 8_000_000,
    emergency_floor_krw: 5_500_000,
    monthly_income_krw: 4_200_000,
    fixed_obligations_krw: 2_600_000,
    monthly_discretionary_krw: 400_000,
  },
  plan: {
    leave_start: '2027-08',
    leave_months: 4,
  },
  stress: {
    income_delay_weeks: 0,
    child_support_missed: false,
  },
};

const SINGLE_PARENT_DEFAULT_ANALYSIS: AnalysisCreateRequest = {
  scenario_id: 'single_parent_stress',
  dataset_id: null,
  data_mode: 'synthetic',
  household: {
    expected_month: '2027-05',
    birth_order: 2,
    household_type: 'single_parent',
    dependents: 1,
  },
  financial: {
    current_cash_krw: 9_000_000,
    emergency_floor_krw: 5_000_000,
    monthly_income_krw: 3_800_000,
    fixed_obligations_krw: 2_200_000,
    monthly_discretionary_krw: 350_000,
  },
  plan: {
    leave_start: '2027-05',
    leave_months: 3,
  },
  // 기본값은 지연·미수령 없음(baseline). S06에서 사용자가 이 값을 바꾸면
  // src/mocks/handlers.ts가 stressed fixture로 라우팅한다.
  stress: {
    income_delay_weeks: 0,
    child_support_missed: false,
  },
};

export const DEMO_SCENARIOS: readonly DemoScenarioMeta[] = [
  {
    scenario_id: 'first_birth_dual_income',
    title: '초산 · 맞벌이',
    description: '처음 출산을 준비하는 맞벌이 가구 예시로 비교해요.',
    route: 'first_birth',
    data_badge: 'synthetic',
    data_version: ONBOARDING_DATA_VERSION,
    default_analysis: FIRST_BIRTH_DEFAULT_ANALYSIS,
  },
  {
    scenario_id: 'past_me_transition',
    title: '경산 · 외벌이 전환',
    description: '외벌이로 전환하는 경산 가구 예시로 비교해요.',
    route: 'past_me',
    data_badge: 'synthetic',
    data_version: ONBOARDING_DATA_VERSION,
    default_analysis: PAST_ME_DEFAULT_ANALYSIS,
  },
  {
    scenario_id: 'single_parent_stress',
    title: '경산 · 한부모',
    description: '지원금 지연 상황까지 포함한 한부모 가구 예시로 비교해요.',
    route: 'single_parent_stress',
    data_badge: 'synthetic',
    data_version: ONBOARDING_DATA_VERSION,
    default_analysis: SINGLE_PARENT_DEFAULT_ANALYSIS,
  },
];
