// TEMP: OpenAPI 명세 확정 전 임시 타입. docs/frontend.md "TypeScript 핵심 타입" 기준.
export interface CashFlowPoint {
  period: string;
  confirmed_cash_krw: number;
  p20_krw: number;
  p50_krw: number;
  p80_krw: number;
  emergency_floor_krw: number;
}
