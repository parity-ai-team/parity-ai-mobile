import type { ActionBurden, AlternativeActionType, AlternativeKind } from '@/shared/types';

// src/shared/ui/RiskCauseCard/causeCodeLabels.ts와 같은 이유로 Record<유니온,
// string>으로 선언한다 — 생성 타입에 새 kind가 추가되면 이 표를 안 고친 채로는
// 빌드가 깨진다.
export const ALTERNATIVE_KIND_LABEL: Record<AlternativeKind, string> = {
  current_state: '현상유지',
  liquidity_protection: '유동성 보호',
  cost_minimization: '비용 최소화',
  minimum_change: '최소 변경',
};

export const ACTION_TYPE_LABEL: Record<AlternativeActionType, string> = {
  reduce_discretionary: '재량 지출 축소',
  defer_discretionary: '재량 지출 이연',
  move_flexible_payment: '납부일 조정',
};

export const ACTION_BURDEN_LABEL: Record<ActionBurden, string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
};

// 매핑에 없는(백엔드가 새로 내려준) 값은 화면이 깨지지 않게 원문을 그대로
// 보여준다. 런타임 값은 컴파일 타임 유니온과 다를 수 있어 string으로 넓혀 받는다.
export function getAlternativeKindLabel(kind: string): string {
  return (ALTERNATIVE_KIND_LABEL as Record<string, string>)[kind] ?? kind;
}

export function getActionTypeLabel(actionType: string): string {
  return (ACTION_TYPE_LABEL as Record<string, string>)[actionType] ?? actionType;
}

export function getActionBurdenLabel(burden: string): string {
  return (ACTION_BURDEN_LABEL as Record<string, string>)[burden] ?? burden;
}
