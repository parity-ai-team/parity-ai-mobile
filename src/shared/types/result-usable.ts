import type { AnalysisStatus } from './generated';

// docs/frontend.md는 "ready에서만 대안 활성화"라고 적었지만, 실제 계약
// (docs/backend-integration.md "5. 화면별 연결 권장": "status=limited는
// 오류가 아니다 ... result를 정상적으로 표시하고 limitations를 사용자에게
// 알린다")를 따르면 limited도 result가 채워진 정상 상태다. 그래서 결과·대안·
// 안전 적립 화면은 ready와 limited 모두에서 쓸 수 있다고 재해석했다 — 근거는
// docs/decisions/result-usable-status.md 참고.
const USABLE_RESULT_STATUSES: ReadonlySet<AnalysisStatus> = new Set(['ready', 'limited']);

export function isResultUsable(status: AnalysisStatus): boolean {
  return USABLE_RESULT_STATUSES.has(status);
}
