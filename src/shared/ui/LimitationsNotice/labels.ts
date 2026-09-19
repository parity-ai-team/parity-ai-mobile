import type { LimitationCode } from '@/shared/types';

// docs/decisions/result-usable-status.md: limitations 배열은 오류가 아닌
// PoC 안내 문구로 사용자에게 보여준다. 코드를 그대로 노출하지 않는다.
export const LIMITATION_LABEL: Record<LimitationCode, string> = {
  SYNTHETIC_DATA: '지금 보시는 수치는 실제 데이터가 아닌 합성 데이터예요.',
  ASSUMED_INPUT: '일부 입력값은 직접 채운 값이 아니라 서버가 가정한 값이에요.',
  INSUFFICIENT_HISTORY: '참고할 이력이 부족해 보수적으로 계산했어요.',
  LOW_CLASSIFICATION_CONFIDENCE: '일부 항목의 분류 신뢰도가 낮아요.',
};

// 계약에 없는 코드가 와도 화면이 깨지지 않게 원문을 그대로 보여준다
// (RiskCauseCard의 getCauseCodeLabel과 같은 방어 패턴).
export function getLimitationLabel(code: string): string {
  return LIMITATION_LABEL[code as LimitationCode] ?? code;
}
