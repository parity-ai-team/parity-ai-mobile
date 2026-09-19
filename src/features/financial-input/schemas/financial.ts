import { z } from 'zod';

import type { FinancialInput } from '@/shared/types';

import { optionalKrwString, requiredKrwString } from './fields';

export const financialFormSchema = z.object({
  financial: z.object({
    current_cash_krw: requiredKrwString('가용 현금을 입력해 주세요.'),
    emergency_floor_krw: optionalKrwString(),
    monthly_income_krw: requiredKrwString('월 수입을 입력해 주세요.'),
    fixed_obligations_krw: requiredKrwString('카드·대출·보험 등 고정 지급 의무를 입력해 주세요.'),
    monthly_discretionary_krw: optionalKrwString(),
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

// 반환 타입 주석(FinancialInput)이 생성 타입과 어긋나면 여기서 컴파일 오류가
// 난다. emergency_floor_krw를 비우면 null, monthly_discretionary_krw를
// 비우면 0 — 둘 다 서버 기본값과 같다(docs/api/openapi-1.5.0.json FinancialInput).
export function toFinancialInput(values: FinancialFormValues['financial']): FinancialInput {
  const emergencyFloor = values.emergency_floor_krw.trim();
  const monthlyDiscretionary = values.monthly_discretionary_krw.trim();

  return {
    current_cash_krw: Number(values.current_cash_krw),
    emergency_floor_krw: emergencyFloor === '' ? null : Number(emergencyFloor),
    monthly_income_krw: Number(values.monthly_income_krw),
    fixed_obligations_krw: Number(values.fixed_obligations_krw),
    monthly_discretionary_krw: monthlyDiscretionary === '' ? 0 : Number(monthlyDiscretionary),
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
