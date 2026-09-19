// TEMP: 원본 JSON 예시 없음, 추측. docs/frontend.md·docs/integration.md·
// docs/backend.md 어디에도 alternatives 배열 항목의 필드 단위 예시가 없다.
// docs/backend.md "대안 제약"이 설명하는 비교 지표(최저 가용현금, 부족확률,
// 총 금융비용, 회복기간)만 근거로 최소 필드만 정의했다. OpenAPI 명세가 나오면
// 이 타입 전체를 교체한다.
//
// 화면은 이 타입을 props로 직접 받지 않는다. features/alternatives에서
// 화면 전용 ViewModel(AlternativeCardVM 등)로 변환하는 함수를 거친 뒤에만
// 컴포넌트에 넘긴다 — 근거가 약한 이 원본 타입이 UI 코드로 그대로 번지지
// 않게 하기 위한 경계다.
export interface AlternativeSummary {
  option_id: string;
  label: string;
  is_baseline: boolean;
  min_cash_krw: number;
  shortage_probability: number;
  total_cost_krw: number;
  recovery_months: number;
}
