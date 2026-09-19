import {
  financialFormSchema,
  fromEmploymentPlanInput,
  fromFinancialInput,
  fromHouseholdInput,
  fromStressInput,
  householdFormSchema,
  planFormSchema,
  toEmploymentPlanInput,
  toFinancialInput,
  toHouseholdInput,
  toStressInput,
} from '@/features/financial-input/schemas';

describe('householdFormSchema — 필수값·형식 검증', () => {
  const valid = {
    household: {
      expected_month: '2027-03',
      birth_order: '1',
      household_type: 'two_adult' as const,
      dependents: '0',
    },
  };

  it('올바른 값은 통과한다', () => {
    expect(householdFormSchema.safeParse(valid).success).toBe(true);
  });

  it.each(['expected_month', 'birth_order', 'dependents'] as const)(
    '%s가 빈 문자열이면 거부한다',
    (field) => {
      const result = householdFormSchema.safeParse({
        household: { ...valid.household, [field]: '' },
      });
      expect(result.success).toBe(false);
    },
  );

  it('household_type을 고르지 않으면(null) 거부한다', () => {
    const result = householdFormSchema.safeParse({
      household: { ...valid.household, household_type: null },
    });
    expect(result.success).toBe(false);
  });

  it('출산 순서가 음수면 거부한다', () => {
    const result = householdFormSchema.safeParse({
      household: { ...valid.household, birth_order: '-1' },
    });
    expect(result.success).toBe(false);
  });

  it('출산 순서가 0이면 거부한다(1 이상)', () => {
    const result = householdFormSchema.safeParse({
      household: { ...valid.household, birth_order: '0' },
    });
    expect(result.success).toBe(false);
  });

  it('출산 순서가 소수면 거부한다', () => {
    const result = householdFormSchema.safeParse({
      household: { ...valid.household, birth_order: '1.5' },
    });
    expect(result.success).toBe(false);
  });

  it('부양가족 수가 음수면 거부한다', () => {
    const result = householdFormSchema.safeParse({
      household: { ...valid.household, dependents: '-2' },
    });
    expect(result.success).toBe(false);
  });

  it.each(['2027-13', '2027-00', '2027', '27-03', 'march'])(
    '예정월 형식이 "%s"면 거부한다',
    (expected_month) => {
      const result = householdFormSchema.safeParse({
        household: { ...valid.household, expected_month },
      });
      expect(result.success).toBe(false);
    },
  );
});

describe('financialFormSchema — 필수값·음수·소수 검증', () => {
  const valid = {
    financial: {
      current_cash_krw: '12000000',
      emergency_floor_krw: '',
      monthly_income_krw: '5800000',
      fixed_obligations_krw: '3100000',
      monthly_discretionary_krw: '',
    },
  };

  it('올바른 값은 통과한다(선택 필드는 비워도 됨)', () => {
    expect(financialFormSchema.safeParse(valid).success).toBe(true);
  });

  it.each(['current_cash_krw', 'monthly_income_krw', 'fixed_obligations_krw'] as const)(
    '%s가 빈 문자열이면 거부한다',
    (field) => {
      const result = financialFormSchema.safeParse({
        financial: { ...valid.financial, [field]: '' },
      });
      expect(result.success).toBe(false);
    },
  );

  it('금액이 음수면 거부한다', () => {
    const result = financialFormSchema.safeParse({
      financial: { ...valid.financial, current_cash_krw: '-1000' },
    });
    expect(result.success).toBe(false);
  });

  it('금액이 소수면 거부한다', () => {
    const result = financialFormSchema.safeParse({
      financial: { ...valid.financial, current_cash_krw: '1000.5' },
    });
    expect(result.success).toBe(false);
  });

  it('선택 필드(emergency_floor_krw)에 음수를 넣으면 거부한다', () => {
    const result = financialFormSchema.safeParse({
      financial: { ...valid.financial, emergency_floor_krw: '-1' },
    });
    expect(result.success).toBe(false);
  });
});

describe('planFormSchema — 범위·날짜 형식 검증', () => {
  const valid = {
    plan: { leave_start: '', leave_months: '' },
    stress: { income_delay_weeks: '', child_support_missed: 'false' as const },
  };

  it('전부 비워도 통과한다(서버 기본값 적용 대상)', () => {
    expect(planFormSchema.safeParse(valid).success).toBe(true);
  });

  it('leave_months가 범위(0~12)를 벗어나면 거부한다', () => {
    const result = planFormSchema.safeParse({
      ...valid,
      plan: { ...valid.plan, leave_months: '13' },
    });
    expect(result.success).toBe(false);
  });

  it('income_delay_weeks가 범위(0~52)를 벗어나면 거부한다', () => {
    const result = planFormSchema.safeParse({
      ...valid,
      stress: { ...valid.stress, income_delay_weeks: '53' },
    });
    expect(result.success).toBe(false);
  });

  it('leave_months가 음수면 거부한다', () => {
    const result = planFormSchema.safeParse({
      ...valid,
      plan: { ...valid.plan, leave_months: '-1' },
    });
    expect(result.success).toBe(false);
  });

  it('leave_start 형식이 잘못되면 거부한다', () => {
    const result = planFormSchema.safeParse({
      ...valid,
      plan: { ...valid.plan, leave_start: '2027/01' },
    });
    expect(result.success).toBe(false);
  });
});

describe('폼 → AnalysisCreateRequest 하위 타입 변환', () => {
  it('toHouseholdInput은 문자열을 숫자로 바꾸고 값을 그대로 옮긴다', () => {
    expect(
      toHouseholdInput({
        expected_month: '2027-03',
        birth_order: '1',
        household_type: 'two_adult',
        dependents: '2',
      }),
    ).toEqual({
      expected_month: '2027-03',
      birth_order: 1,
      household_type: 'two_adult',
      dependents: 2,
    });
  });

  it('toFinancialInput은 빈 emergency_floor_krw를 null로, 빈 monthly_discretionary_krw를 0으로 바꾼다', () => {
    expect(
      toFinancialInput({
        current_cash_krw: '12000000',
        emergency_floor_krw: '',
        monthly_income_krw: '5800000',
        fixed_obligations_krw: '3100000',
        monthly_discretionary_krw: '',
      }),
    ).toEqual({
      current_cash_krw: 12_000_000,
      emergency_floor_krw: null,
      monthly_income_krw: 5_800_000,
      fixed_obligations_krw: 3_100_000,
      monthly_discretionary_krw: 0,
    });
  });

  it('toFinancialInput은 값이 있으면 숫자로 바꿔 그대로 옮긴다', () => {
    expect(
      toFinancialInput({
        current_cash_krw: '1',
        emergency_floor_krw: '6000000',
        monthly_income_krw: '2',
        fixed_obligations_krw: '3',
        monthly_discretionary_krw: '500000',
      }),
    ).toMatchObject({ emergency_floor_krw: 6_000_000, monthly_discretionary_krw: 500_000 });
  });

  it('toEmploymentPlanInput은 빈 값을 서버 기본값(null, 0)으로 바꾼다', () => {
    expect(toEmploymentPlanInput({ leave_start: '', leave_months: '' })).toEqual({
      leave_start: null,
      leave_months: 0,
    });
  });

  it('toStressInput은 child_support_missed 문자열을 boolean으로 바꾼다', () => {
    expect(toStressInput({ income_delay_weeks: '', child_support_missed: 'true' })).toEqual({
      income_delay_weeks: 0,
      child_support_missed: true,
    });
    expect(toStressInput({ income_delay_weeks: '4', child_support_missed: 'false' })).toEqual({
      income_delay_weeks: 4,
      child_support_missed: false,
    });
  });

  it('from*Input()은 to*Input()의 역변환이다(왕복 유지)', () => {
    const household = toHouseholdInput({
      expected_month: '2027-05',
      birth_order: '2',
      household_type: 'single_parent',
      dependents: '1',
    });
    expect(toHouseholdInput(fromHouseholdInput(household))).toEqual(household);

    const financial = toFinancialInput({
      current_cash_krw: '9000000',
      emergency_floor_krw: '5000000',
      monthly_income_krw: '3800000',
      fixed_obligations_krw: '2200000',
      monthly_discretionary_krw: '350000',
    });
    expect(toFinancialInput(fromFinancialInput(financial))).toEqual(financial);

    const plan = toEmploymentPlanInput({ leave_start: '2027-05', leave_months: '3' });
    expect(toEmploymentPlanInput(fromEmploymentPlanInput(plan))).toEqual(plan);

    const stress = toStressInput({ income_delay_weeks: '2', child_support_missed: 'true' });
    expect(toStressInput(fromStressInput(stress))).toEqual(stress);
  });
});
