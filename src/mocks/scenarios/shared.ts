import type { AnalysisResponse, AnalysisResult, ContractVersions } from '@/shared/types';

// AnalysisResponse.result는 계약상 null 가능(계산 전 상태 대비)이지만, mock
// fixture는 항상 ready/limited 완료 상태만 흉내 내므로 result가 반드시 있다.
// 이 타입으로 좁혀서 mock을 쓰는 테스트·코드가 매번 null 체크를 하지 않게 한다.
export type MockAnalysisResponse = AnalysisResponse & { result: AnalysisResult };

// 모든 mock fixture가 공유하는 버전·타임스탬프. docs/backend-integration.md
// "1. 기준 정보"(api 1.5.0, model cashflow-1.4.0)와 docs/api/analysis-response-example.json의
// versions 블록을 그대로 쓴다.
export const MOCK_VERSIONS: ContractVersions = {
  api: '1.5.0',
  data: 'synthetic-1.0.0',
  rules: 'kr-daegu-2026-09',
  model: 'cashflow-1.4.0',
};

export const MOCK_GENERATED_AT = '2026-09-19T14:58:11.201007Z';

export const SYNTHETIC_LIMITATIONS = ['SYNTHETIC_DATA'] as const;

// trace_id 패턴(^trc_[A-Za-z0-9_-]+$)을 만족하는 결정론적 mock trace id.
export function buildTraceId(scenarioSlug: string, kind: string, key: string): string {
  return `trc_mock_${scenarioSlug}_${kind}_${key}`;
}
