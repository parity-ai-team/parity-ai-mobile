// docs/integration.md "엔드포인트·연동 순서"
const V1 = '/v1';

export const endpoints = {
  health: () => '/health',
  ready: () => '/ready',
  demoScenarios: () => `${V1}/demo-scenarios`,
  analyses: () => `${V1}/analyses`,
  analysis: (analysisId: string) => `${V1}/analyses/${analysisId}`,
  analysisInputs: (analysisId: string) => `${V1}/analyses/${analysisId}/inputs`,
  recalculate: (analysisId: string) => `${V1}/analyses/${analysisId}/recalculate`,
  alternativesCompare: (analysisId: string) => `${V1}/analyses/${analysisId}/alternatives/compare`,
  assetPlan: (analysisId: string) => `${V1}/analyses/${analysisId}/asset-plan`,
  evidence: (analysisId: string) => `${V1}/analyses/${analysisId}/evidence`,
} as const;
