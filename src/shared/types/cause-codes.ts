// docs/integration.md "원인 코드 최소 집합"
export type CauseCode =
  // 현금흐름
  | 'INCOME_DROP'
  | 'PAYMENT_DELAY'
  | 'EXPENSE_SPIKE'
  // 지급의무
  | 'CARD_DUE_COLLISION'
  | 'LOAN_DUE'
  | 'INSURANCE_DUE'
  // 안전기준
  | 'BELOW_EMERGENCY_FLOOR'
  | 'SHORTAGE_RISK_HIGH'
  // 제한자금
  | 'RESTRICTED_FUND_MISMATCH'
  | 'BENEFIT_EXPIRY'
  // 데이터
  | 'MISSING_SCHEDULE'
  | 'LOW_CLASSIFICATION_CONFIDENCE';
