import { z } from 'zod';

import type { ChoiceFieldOption } from '@/shared/ui';
import type { EmploymentPlanInput, StressInput } from '@/shared/types';

import { optionalIntRangeString, optionalMonthString } from './fields';

// child_support_missed는 boolean이지만 ChoiceField는 문자열 값을 다루므로
// 폼 안에서는 'true'/'false' 문자열로 두고 toStressInput()에서 boolean으로
// 바꾼다.
export const BOOLEAN_CHOICE_OPTIONS: readonly ChoiceFieldOption<'true' | 'false'>[] = [
  { value: 'false', label: '아니오' },
  { value: 'true', label: '예' },
];

export const planFormSchema = z.object({
  plan: z.object({
    leave_start: optionalMonthString(),
    leave_months: optionalIntRangeString({ min: 0, max: 12 }),
  }),
  stress: z.object({
    income_delay_weeks: optionalIntRangeString({ min: 0, max: 52 }),
    child_support_missed: z.enum(['true', 'false']),
  }),
});

export type PlanFormValues = z.infer<typeof planFormSchema>;

export const EMPTY_PLAN_FORM_VALUES: PlanFormValues = {
  plan: {
    leave_start: '',
    leave_months: '',
  },
  stress: {
    income_delay_weeks: '',
    child_support_missed: 'false',
  },
};

// 반환 타입 주석(EmploymentPlanInput)이 생성 타입과 어긋나면 여기서 컴파일
// 오류가 난다. 비우면 서버 기본값(leave_start: null, leave_months: 0)과 같다.
export function toEmploymentPlanInput(values: PlanFormValues['plan']): EmploymentPlanInput {
  const leaveStart = values.leave_start.trim();
  const leaveMonths = values.leave_months.trim();

  return {
    leave_start: leaveStart === '' ? null : leaveStart,
    leave_months: leaveMonths === '' ? 0 : Number(leaveMonths),
  };
}

export function fromEmploymentPlanInput(
  input: Partial<EmploymentPlanInput>,
): PlanFormValues['plan'] {
  return {
    leave_start: input.leave_start ?? '',
    leave_months: input.leave_months !== undefined ? String(input.leave_months) : '',
  };
}

// 반환 타입 주석(StressInput)이 생성 타입과 어긋나면 여기서 컴파일 오류가
// 난다. 비우면 서버 기본값(income_delay_weeks: 0, child_support_missed: false)과 같다.
export function toStressInput(values: PlanFormValues['stress']): StressInput {
  const incomeDelayWeeks = values.income_delay_weeks.trim();

  return {
    income_delay_weeks: incomeDelayWeeks === '' ? 0 : Number(incomeDelayWeeks),
    child_support_missed: values.child_support_missed === 'true',
  };
}

export function fromStressInput(input: Partial<StressInput>): PlanFormValues['stress'] {
  return {
    income_delay_weeks:
      input.income_delay_weeks !== undefined ? String(input.income_delay_weeks) : '',
    child_support_missed: input.child_support_missed ? 'true' : 'false',
  };
}
