import type { ApiVersions } from '@/shared/types';

// 모든 mock fixture가 공유하는 버전·타임스탬프. docs/integration.md 예시의
// 값을 그대로 쓴다(백엔드 담당자 확인 전까지는 docs/integration.md 기준).
// docs/backend-integration.md는 더 최신 버전(api 1.5.0, model cashflow-1.4.0)을
// 말하고 있어 나중에 바뀔 수 있다 — docs/decisions/api-contract-mismatch.md 참고.
export const MOCK_VERSIONS: ApiVersions = {
  api: '1.0',
  data: 'demo-2026-09',
  rules: 'kr-daegu-2026-09',
  model: 'cashflow-1.0.0',
};

export const MOCK_GENERATED_AT = '2026-09-16T21:00:00+09:00';

export const SYNTHETIC_LIMITATIONS = ['SYNTHETIC_DATA'];
