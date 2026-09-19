import type { CauseCode } from '@/shared/types';

// Record<CauseCode, string>로 타입을 고정해 뒀기 때문에, 생성 타입의
// CauseCode 유니온에 새 코드가 추가되는데 이 표를 안 고치면 여기서 바로
// 컴파일 오류가 난다(속성 누락) — 새 코드를 빠뜨린 채 배포되는 걸 막는다.
export const CAUSE_CODE_LABEL: Record<CauseCode, string> = {
  INCOME_DROP: '소득 감소',
  PAYMENT_DELAY: '지급 지연',
  EXPENSE_SPIKE: '지출 급증',
  CARD_DUE_COLLISION: '카드 대금 겹침',
  LOAN_DUE: '대출 상환일',
  INSURANCE_DUE: '보험료 납부일',
  BELOW_EMERGENCY_FLOOR: '비상금 기준 미달',
  SHORTAGE_RISK_HIGH: '부족 위험 높음',
  RESTRICTED_FUND_MISMATCH: '제한 자금 불일치',
  BENEFIT_EXPIRY: '지원금 만료',
  MISSING_SCHEDULE: '일정 정보 누락',
  LOW_CLASSIFICATION_CONFIDENCE: '분류 신뢰도 낮음',
  MANDATORY_PAYMENT_UNMET: '필수 납부 미충족',
};

// 백엔드가 아직 모바일에 없는 코드를 새로 내려줘도 화면이 깨지지 않게,
// 매핑에 없는 값은 코드 원문을 그대로 보여준다. 런타임 값은 컴파일 타임
// 타입(CauseCode)과 다를 수 있어 매개변수를 string으로 넓혀 받는다.
export function getCauseCodeLabel(code: string): string {
  return (CAUSE_CODE_LABEL as Record<string, string>)[code] ?? code;
}
