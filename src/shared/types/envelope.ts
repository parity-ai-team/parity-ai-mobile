// TEMP: OpenAPI 명세 확정 전 임시 수기 타입. docs/integration.md "대표 요청·응답",
// docs/backend.md "공통 응답 봉투"/"오류 봉투" 기준. 생성 타입으로 교체 예정.
//
// 결과 바디(cashflow·risks·alternatives·safe_contribution 등) 상세 필드는
// OpenAPI 확정 전까지 추측하지 않고 `unknown`으로 남겨둔다. 화면별 도메인
// 타입은 실제 응답 스키마가 확정되는 PR에서 추가한다.
import type { AnalysisStatus } from './analysis-status';
import type { ApiVersions } from './api-versions';
import type { ErrorCode } from './error-codes';

export interface FieldError {
  path: string;
  reason: string;
}

export interface SuccessEnvelope<TResult = unknown> {
  request_id: string;
  analysis_id: string;
  status: AnalysisStatus;
  revision: number;
  versions: ApiVersions;
  result: TResult;
  limitations: string[];
  generated_at: string;
}

export interface ErrorDetail {
  code: ErrorCode;
  message: string;
  field_errors?: FieldError[];
  retryable: boolean;
}

export interface ErrorEnvelope {
  request_id: string;
  error: ErrorDetail;
}
