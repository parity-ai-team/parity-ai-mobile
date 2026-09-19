// TEMP: OpenAPI 명세 확정 전 임시 타입. docs/frontend.md "TypeScript 핵심 타입" 기준.
export interface SafeContribution {
  eligible: boolean;
  monthly_amount_krw: number;
  reason_codes: string[];
  valid_until: string;
}
