import { z } from 'zod';

import type { FinancialInput } from '@/shared/types';

import { requiredKrwString } from './fields';

export const financialFormSchema = z.object({
  financial: z.object({
    current_cash_krw: requiredKrwString('가용 현금을 입력해 주세요.'),
    emergency_floor_krw: requiredKrwString(
      '꼭 남겨둘 비상금을 입력해 주세요. 없으면 0을 입력해요.',
    ),
    monthly_income_krw: requiredKrwString('월 수입을 입력해 주세요.'),
    fixed_obligations_krw: requiredKrwString('카드·대출·보험 등 고정 지급 의무를 입력해 주세요.'),
    monthly_discretionary_krw: requiredKrwString(
      '월 선택 지출을 입력해 주세요. 없으면 0을 입력해요.',
    ),
  }),
});

export type FinancialFormValues = z.infer<typeof financialFormSchema>;

export const EMPTY_FINANCIAL_FORM_VALUES: FinancialFormValues = {
  financial: {
    current_cash_krw: '',
    emergency_floor_krw: '',
    monthly_income_krw: '',
    fixed_obligations_krw: '',
    monthly_discretionary_krw: '',
  },
};

// 직접 입력에서는 선택 금액도 0을 명시하게 해 서버의 숨은 기본값이 결과에
// 섞이지 않게 한다.
export function toFinancialInput(values: FinancialFormValues['financial']): FinancialInput {
  return {
    current_cash_krw: Number(values.current_cash_krw),
    emergency_floor_krw: Number(values.emergency_floor_krw),
    monthly_income_krw: Number(values.monthly_income_krw),
    fixed_obligations_krw: Number(values.fixed_obligations_krw),
    monthly_discretionary_krw: Number(values.monthly_discretionary_krw),
  };
}

export function fromFinancialInput(
  input: Partial<FinancialInput>,
): FinancialFormValues['financial'] {
  return {
    current_cash_krw: input.current_cash_krw !== undefined ? String(input.current_cash_krw) : '',
    emergency_floor_krw:
      input.emergency_floor_krw !== undefined && input.emergency_floor_krw !== null
        ? String(input.emergency_floor_krw)
        : '',
    monthly_income_krw:
      input.monthly_income_krw !== undefined ? String(input.monthly_income_krw) : '',
    fixed_obligations_krw:
      input.fixed_obligations_krw !== undefined ? String(input.fixed_obligations_krw) : '',
    monthly_discretionary_krw:
      input.monthly_discretionary_krw !== undefined ? String(input.monthly_discretionary_krw) : '',
  };
}
