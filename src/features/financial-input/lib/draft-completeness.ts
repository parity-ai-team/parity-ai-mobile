import type {
  EmploymentPlanInput,
  FinancialInput,
  HouseholdInput,
  StressInput,
} from '@/shared/types';

// S07 검토 화면이 draft(Partial)를 AnalysisCreateRequest로 조립하기 전에
// 필수 필드가 다 채워졌는지 확인하는 타입 가드. 정상 흐름(S04→S05→S06→S07)이면
// 항상 true이지만, 화면을 건너뛰고 /review로 바로 들어오는 경우를 대비한
// 방어 확인이다.
export function isHouseholdComplete(value: Partial<HouseholdInput>): value is HouseholdInput {
  return (
    typeof value.expected_month === 'string' &&
    value.expected_month !== '' &&
    typeof value.birth_order === 'number' &&
    (value.household_type === 'two_adult' || value.household_type === 'single_parent') &&
    typeof value.dependents === 'number'
  );
}

export function isFinancialComplete(value: Partial<FinancialInput>): value is FinancialInput {
  return (
    typeof value.current_cash_krw === 'number' &&
    typeof value.monthly_income_krw === 'number' &&
    typeof value.fixed_obligations_krw === 'number' &&
    (value.emergency_floor_krw === null || typeof value.emergency_floor_krw === 'number') &&
    typeof value.monthly_discretionary_krw === 'number'
  );
}

export function isPlanComplete(value: Partial<EmploymentPlanInput>): value is EmploymentPlanInput {
  return (
    (value.leave_start === null || typeof value.leave_start === 'string') &&
    typeof value.leave_months === 'number'
  );
}

export function isStressComplete(value: Partial<StressInput>): value is StressInput {
  return (
    typeof value.income_delay_weeks === 'number' && typeof value.child_support_missed === 'boolean'
  );
}
