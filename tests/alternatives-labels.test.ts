import {
  ACTION_BURDEN_LABEL,
  ACTION_TYPE_LABEL,
  ALTERNATIVE_KIND_LABEL,
  getActionBurdenLabel,
  getActionTypeLabel,
  getAlternativeKindLabel,
} from '@/features/alternatives/labels';
import type { ActionBurden, AlternativeActionType, AlternativeKind } from '@/shared/types';

// 생성 타입의 유니온을 그대로 나열한다 — 각 표가 Record<유니온, string>으로
// 선언돼 있어 새 값이 추가되면 소스 쪽에서 먼저 컴파일이 깨지지만, 이 목록도
// 손으로 맞춰 둬서 라벨 내용 자체(코드 그대로 노출되지 않는지)를 런타임으로
// 한 번 더 확인한다.
const ALL_KINDS: AlternativeKind[] = [
  'current_state',
  'liquidity_protection',
  'cost_minimization',
  'minimum_change',
];

const ALL_ACTION_TYPES: AlternativeActionType[] = [
  'reduce_discretionary',
  'defer_discretionary',
  'move_flexible_payment',
];

const ALL_BURDENS: ActionBurden[] = ['low', 'medium', 'high'];

describe('ALTERNATIVE_KIND_LABEL — 전체 AlternativeKind 커버', () => {
  it.each(ALL_KINDS)('%s는 코드 원문이 아닌 한국어 문구로 매핑된다', (kind) => {
    expect(ALTERNATIVE_KIND_LABEL[kind]).toBeTruthy();
    expect(ALTERNATIVE_KIND_LABEL[kind]).not.toBe(kind);
  });

  it('알 수 없는 kind는 깨지지 않고 원문 그대로 보여준다', () => {
    expect(getAlternativeKindLabel('some_future_kind')).toBe('some_future_kind');
  });
});

describe('ACTION_TYPE_LABEL — 전체 AlternativeActionType 커버', () => {
  it.each(ALL_ACTION_TYPES)('%s는 코드 원문이 아닌 한국어 문구로 매핑된다', (actionType) => {
    expect(ACTION_TYPE_LABEL[actionType]).toBeTruthy();
    expect(ACTION_TYPE_LABEL[actionType]).not.toBe(actionType);
  });

  it('알 수 없는 action_type은 깨지지 않고 원문 그대로 보여준다', () => {
    expect(getActionTypeLabel('some_future_action')).toBe('some_future_action');
  });
});

describe('ACTION_BURDEN_LABEL — 전체 ActionBurden 커버', () => {
  it.each(ALL_BURDENS)('%s는 코드 원문이 아닌 한국어 문구로 매핑된다', (burden) => {
    expect(ACTION_BURDEN_LABEL[burden]).toBeTruthy();
    expect(ACTION_BURDEN_LABEL[burden]).not.toBe(burden);
  });

  it('알 수 없는 action_burden은 깨지지 않고 원문 그대로 보여준다', () => {
    expect(getActionBurdenLabel('extreme')).toBe('extreme');
  });
});
