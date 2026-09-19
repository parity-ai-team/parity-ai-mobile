import type { CauseCode } from './cause-codes';

// TEMP: OpenAPI 명세 확정 전 임시 타입. docs/frontend.md "TypeScript 핵심 타입"에
// trace_ids를 추가했다 — frontend.md 표에는 없지만, docs/integration.md와
// docs/backend.md의 JSON 예시 모두 risk 항목에 trace_ids를 포함하고 있어 실제
// 계약의 일부로 보고 반영했다.
export interface RiskEvent {
  period: string;
  severity: 'info' | 'warning' | 'critical';
  cause_codes: CauseCode[];
  expected_gap_krw: number;
  trace_ids: string[];
}
