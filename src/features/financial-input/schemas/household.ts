import { z } from 'zod';

import type { ChoiceFieldOption } from '@/shared/ui';
import type { HouseholdInput, HouseholdType } from '@/shared/types';

import {
  requiredMonthString,
  requiredNonNegativeIntString,
  requiredPositiveIntString,
} from './fields';

export const HOUSEHOLD_TYPE_OPTIONS: readonly ChoiceFieldOption<HouseholdType>[] = [
  { value: 'two_adult', label: '두 성인(맞벌이·외벌이)' },
  { value: 'single_parent', label: '한부모' },
];

export interface HouseholdFormValues {
  household: {
    expected_month: string;
    birth_order: string;
    household_type: HouseholdType | null;
    dependents: string;
  };
}

// z.enum(...).nullable().refine(...)는 스키마 input/output 타입이 갈라져
// zodResolver의 Resolver<Input, Context, Output> 제네릭과 useForm<HouseholdFormValues>가
// 어긋난다(사용 전 선택값은 null이어야 하는데, refine이 output에서 null을
// 지워버린다). z.custom으로 이 필드 하나만 input=output=HouseholdType|null로
// 고정해 그 문제를 피한다.
const householdTypeField = z.custom<HouseholdType | null>(
  (value) => value === 'two_adult' || value === 'single_parent',
  { message: '가족 구조를 선택해 주세요.' },
);

export const householdFormSchema: z.ZodType<HouseholdFormValues> = z.object({
  household: z.object({
    expected_month: requiredMonthString('예정월을 입력해 주세요.'),
    birth_order: requiredPositiveIntString('출산 순서를 입력해 주세요.'),
    household_type: householdTypeField,
    dependents: requiredNonNegativeIntString('부양가족 수를 입력해 주세요.'),
  }),
});

export const EMPTY_HOUSEHOLD_FORM_VALUES: HouseholdFormValues = {
  household: {
    expected_month: '',
    birth_order: '',
    household_type: null,
    dependents: '',
  },
};

// 반환 타입 주석(HouseholdInput)이 생성 타입과 어긋나면 여기서 컴파일 오류가
// 난다 — household_type은 폼 검증을 통과한 뒤에만 호출되므로 null이 아님이
// 보장된다.
export function toHouseholdInput(values: HouseholdFormValues['household']): HouseholdInput {
  return {
    expected_month: values.expected_month.trim(),
    birth_order: Number(values.birth_order),
    household_type: values.household_type as HouseholdType,
    dependents: Number(values.dependents),
  };
}

export function fromHouseholdInput(
  input: Partial<HouseholdInput>,
): HouseholdFormValues['household'] {
  return {
    expected_month: input.expected_month ?? '',
    birth_order: input.birth_order !== undefined ? String(input.birth_order) : '',
    household_type: input.household_type ?? null,
    dependents: input.dependents !== undefined ? String(input.dependents) : '',
  };
}
