// src/mocks/handlers.ts가 실제로 라우팅하는 scenario_id 문자열을 그대로 쓴다.
// mock 계층은 아직 GET /v1/demo-scenarios를 다루지 않아(src/mocks/README.md
// 참고) 목록 자체는 여기 메타데이터로 정의한다.
export type DemoScenarioId =
  'first_birth_dual_income' | 'past_me_transition' | 'single_parent_stress';

export interface DemoScenarioMeta {
  id: DemoScenarioId;
  title: string;
  description: string;
}

export const DEMO_SCENARIOS: readonly DemoScenarioMeta[] = [
  {
    id: 'first_birth_dual_income',
    title: '초산 · 맞벌이',
    description: '처음 출산을 준비하는 맞벌이 가구 예시로 비교해요.',
  },
  {
    id: 'past_me_transition',
    title: '경산 · 외벌이 전환',
    description: '외벌이로 전환하는 경산 가구 예시로 비교해요.',
  },
  {
    id: 'single_parent_stress',
    title: '경산 · 한부모',
    description: '지원금 지연 상황까지 포함한 한부모 가구 예시로 비교해요.',
  },
];
