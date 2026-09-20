// docs/backend-integration.md "5. 전체 API 흐름" / docs/api/openapi-1.7.0.json 기준.
const V1 = '/v1';

export const endpoints = {
  health: () => '/health',
  ready: () => '/ready',
  demoScenarios: () => `${V1}/demo-scenarios`,
  datasets: () => `${V1}/datasets`,
  datasetIntelligence: (datasetId: string) => `${V1}/datasets/${datasetId}/intelligence`,
  confirmClassifications: (datasetId: string) =>
    `${V1}/datasets/${datasetId}/classifications/confirm`,
  analyses: () => `${V1}/analyses`,
  // GET(조회)·PATCH(입력 수정, If-Match 필수)·DELETE(삭제, If-Match 필수) 공용.
  // 입력 수정은 이전 계획대로 `/inputs` 하위 경로가 아니라 이 경로 자체를 쓴다.
  analysis: (analysisId: string) => `${V1}/analyses/${analysisId}`,
  recalculate: (analysisId: string) => `${V1}/analyses/${analysisId}/recalculate`,
  // 대안 비교는 POST .../compare가 아니라 GET 조회다. 최대 3개까지 내려온다.
  alternatives: (analysisId: string) => `${V1}/analyses/${analysisId}/alternatives`,
  // 근거는 트레이스 단위로 조회한다(결과의 trace_ids 사용). asset-plan 엔드포인트는
  // 실제 계약에 없어 제거했다 — 안전 적립은 분석 결과의 safe_contribution으로 받는다.
  evidence: (analysisId: string, traceId: string) =>
    `${V1}/analyses/${analysisId}/evidence/${traceId}`,
} as const;
