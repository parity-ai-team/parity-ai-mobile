import type { FieldError } from '@/shared/types';

// 서버 field_errors(요청 바디 기준 JSON 경로)를 경로별 오류 메시지 맵으로
// 바꾼다. household/financial/plan/stress 각 폼의 필드명을
// "<섹션>.<필드>"로 맞춰 뒀기 때문에(예: 'financial.current_cash_krw') 이
// 결과를 RHF의 setError(path, ...)에 그대로 넘길 수 있다.
// 예: [{path: 'financial.current_cash_krw', reason: 'greater_than_equal'}]
// -> { 'financial.current_cash_krw': 'greater_than_equal' }
export function mapFieldErrorsByPath(fieldErrors: readonly FieldError[]): Record<string, string> {
  return Object.fromEntries(fieldErrors.map((fieldError) => [fieldError.path, fieldError.reason]));
}
