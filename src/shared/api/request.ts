import type { ResponseMeta } from './headers';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method: HttpMethod;
  path: string;
  body?: unknown;
  authToken?: string;
  /** 지정하지 않으면 변경 요청에서만 자동 생성한다. */
  requestId?: string;
  /** PATCH/POST(recalculate)/DELETE의 If-Match. PATCH는 없으면 클라이언트가 바로 오류를 던진다(428 PRECONDITION_REQUIRED 예방). */
  ifMatchRevision?: number;
  /** POST 요청에서만 사용. 지정하지 않으면 자동 생성한다. */
  idempotencyKey?: string;
}

// realApiRequest(실제 fetch)와 mockApiRequest(fixture)가 공유하는 반환 형태.
// 엔드포인트마다 응답 스키마가 다르므로(AnalysisResponse, AlternativeComparisonResponse,
// EvidenceResponse, DemoScenarioListResponse 등) 공통 envelope로 감싸지 않고
// 호출부가 apiRequest<TResult>()로 실제 응답 타입을 지정한다.
export interface ApiResult<TResult = unknown> {
  data: TResult;
  meta: ResponseMeta;
}
