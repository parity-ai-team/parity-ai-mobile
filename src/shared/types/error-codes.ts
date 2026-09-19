// TEMP: OpenAPI 명세 확정 전 임시 수기 타입. docs/backend.md "오류 봉투",
// docs/frontend.md "오류 UX"를 합쳐 정의했다. 생성 타입이 나오면 교체한다.
//
// docs/backend.md 기준 HTTP 매핑:
//   400 INVALID_REQUEST, 404 ANALYSIS_NOT_FOUND, 409 VERSION_CONFLICT,
//   422 VALIDATION_ERROR, 422 INSUFFICIENT_DATA,
//   500 CALCULATION_FAILED, 503 DEPENDENCY_UNAVAILABLE
// docs/frontend.md 오류 UX에만 있는 코드:
//   SESSION_DELETED (DELETE 이후 세션 접근 시)
export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'ANALYSIS_NOT_FOUND'
  | 'VERSION_CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INSUFFICIENT_DATA'
  | 'CALCULATION_FAILED'
  | 'DEPENDENCY_UNAVAILABLE'
  | 'SESSION_DELETED';
