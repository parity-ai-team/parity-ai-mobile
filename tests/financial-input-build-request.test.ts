import { buildAnalysisCreateRequest, mapFieldErrorsByPath } from '@/features/financial-input';
import type {
  EmploymentPlanInput,
  FinancialInput,
  HouseholdInput,
  StressInput,
} from '@/shared/types';

const household: HouseholdInput = {
  expected_month: '2027-03',
  birth_order: 1,
  household_type: 'two_adult',
  dependents: 0,
};
const financial: FinancialInput = {
  current_cash_krw: 12_000_000,
  emergency_floor_krw: 6_000_000,
  monthly_income_krw: 5_800_000,
  fixed_obligations_krw: 3_100_000,
  monthly_discretionary_krw: 500_000,
};
const plan: EmploymentPlanInput = { leave_start: '2027-01', leave_months: 6 };
const stress: StressInput = { income_delay_weeks: 0, child_support_missed: false };

describe('buildAnalysisCreateRequest', () => {
  it('데모 기반이면 scenario_id를 채우고 data_mode는 synthetic으로 고정한다', () => {
    const request = buildAnalysisCreateRequest({
      origin: 'demo',
      scenarioId: 'first_birth_dual_income',
      household,
      financial,
      plan,
      stress,
    });

    expect(request).toEqual({
      scenario_id: 'first_birth_dual_income',
      dataset_id: null,
      household,
      financial,
      plan,
      stress,
      data_mode: 'synthetic',
    });
  });

  it('직접 입력이면 scenario_id를 null로 보낸다', () => {
    const request = buildAnalysisCreateRequest({
      origin: 'manual',
      scenarioId: null,
      household,
      financial,
      plan,
      stress,
    });

    expect(request.scenario_id).toBeNull();
  });

  it('입력값을 다시 계산하지 않고 그대로 옮긴다', () => {
    const request = buildAnalysisCreateRequest({
      origin: 'manual',
      scenarioId: null,
      household,
      financial,
      plan,
      stress,
    });

    expect(request.household).toBe(household);
    expect(request.financial).toBe(financial);
    expect(request.plan).toBe(plan);
    expect(request.stress).toBe(stress);
  });
});

describe('mapFieldErrorsByPath', () => {
  it('field_errors를 경로별 메시지 맵으로 바꾼다', () => {
    expect(
      mapFieldErrorsByPath([
        { path: 'financial.current_cash_krw', reason: 'greater_than_equal' },
        { path: 'household.expected_month', reason: 'invalid_format' },
      ]),
    ).toEqual({
      'financial.current_cash_krw': 'greater_than_equal',
      'household.expected_month': 'invalid_format',
    });
  });

  it('빈 배열이면 빈 객체를 반환한다', () => {
    expect(mapFieldErrorsByPath([])).toEqual({});
  });
});
