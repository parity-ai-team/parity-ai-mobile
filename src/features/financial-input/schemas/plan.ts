import { z } from 'zod';

import type { ChoiceFieldOption } from '@/shared/ui';
import type { EmploymentPlanInput, StressInput } from '@/shared/types';

import { optionalIntRangeString, optionalMonthString, requiredIntRangeString } from './fields';

type BooleanChoice = 'true' | 'false';

export const BOOLEAN_CHOICE_OPTIONS: readonly ChoiceFieldOption<BooleanChoice>[] = [
  { value: 'false', label: '아니오' },
  { value: 'true', label: '예' },
];

export interface PlanFormValues {
  plan: {
    has_leave_plan: BooleanChoice | null;
    leave_start: string;
    leave_months: string;
  };
  stress: {
    income_delay_weeks: string;
    child_support_missed: BooleanChoice | null;
  };
}

function requiredBooleanChoice(message: string) {
  return z.custom<BooleanChoice | null>((value) => value === 'true' || value === 'false', {
    message,
  });
}

export const planFormSchema: z.ZodType<PlanFormValues> = z
  .object({
    plan: z.object({
      has_leave_plan: requiredBooleanChoice('휴직 계획 여부를 선택해 주세요.'),
      leave_start: optionalMonthString(),
      leave_months: optionalIntRangeString({ min: 1, max: 12 }),
    }),
    stress: z.object({
      income_delay_weeks: requiredIntRangeString(
        { min: 0, max: 52 },
        '예상 소득 지연 주 수를 입력해 주세요. 없으면 0을 입력해요.',
      ),
      child_support_missed: requiredBooleanChoice('양육비 미수령 가능성을 선택해 주세요.'),
    }),
  })
  .superRefine((values, context) => {
    if (values.plan.has_leave_plan !== 'true') return;

    if (values.plan.leave_start.trim() === '') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['plan', 'leave_start'],
        message: '휴직 시작월을 입력해 주세요.',
      });
    }
    if (values.plan.leave_months.trim() === '') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['plan', 'leave_months'],
        message: '휴직 개월 수를 입력해 주세요.',
      });
    }
  });

export const EMPTY_PLAN_FORM_VALUES: PlanFormValues = {
  plan: {
    has_leave_plan: null,
    leave_start: '',
    leave_months: '',
  },
  stress: {
    income_delay_weeks: '',
    child_support_missed: null,
  },
};

export function toEmploymentPlanInput(values: PlanFormValues['plan']): EmploymentPlanInput {
  if (values.has_leave_plan !== 'true') {
    return { leave_start: null, leave_months: 0 };
  }

  return {
    leave_start: values.leave_start.trim(),
    leave_months: Number(values.leave_months),
  };
}

export function fromEmploymentPlanInput(
  input: Partial<EmploymentPlanInput>,
): PlanFormValues['plan'] {
  const hasStoredValue = 'leave_start' in input || 'leave_months' in input;
  const hasLeavePlan =
    typeof input.leave_start === 'string' ||
    (typeof input.leave_months === 'number' && input.leave_months > 0);

  return {
    has_leave_plan: hasStoredValue ? (hasLeavePlan ? 'true' : 'false') : null,
    leave_start: input.leave_start ?? '',
    leave_months:
      hasLeavePlan && input.leave_months !== undefined ? String(input.leave_months) : '',
  };
}

export function toStressInput(values: PlanFormValues['stress']): StressInput {
  return {
    income_delay_weeks: Number(values.income_delay_weeks),
    child_support_missed: values.child_support_missed === 'true',
  };
}

export function fromStressInput(input: Partial<StressInput>): PlanFormValues['stress'] {
  const hasChildSupportValue = 'child_support_missed' in input;

  return {
    income_delay_weeks:
      input.income_delay_weeks !== undefined ? String(input.income_delay_weeks) : '',
    child_support_missed: hasChildSupportValue
      ? input.child_support_missed
        ? 'true'
        : 'false'
      : null,
  };
}
