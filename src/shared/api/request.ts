import type { ResponseMeta } from './headers';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method: HttpMethod;
  path: string;
  body?: unknown;
  /** 지정하지 않으면 변경 요청에서만 자동 생성한다. */
  requestId?: string;
  /**
   * PATCH/DELETE의 If-Match. 서버 응답 ETag 문자열을 그대로 넣는다(가공
   * 금지 — headers.ts의 RequestHeaderOptions.ifMatch 참고). 없으면
   * 클라이언트가 바로 오류를 던진다(428 PRECONDITION_REQUIRED 예방).
   */
  ifMatch?: string;
  /** POST 요청에서만 사용. 지정하지 않으면 자동 생성한다. */
  idempotencyKey?: string;
  /**
   * 요청을 보낸 지 5초가 지나도 응답이 없으면 호출된다(realApiRequest 전용
   * — mock 모드는 네트워크를 안 타서 호출되지 않는다). 무료 플랜 백엔드의
   * 콜드 스타트(첫 요청 50초 이상)를 화면에 안내하는 용도다.
   */
  onSlowRequest?: () => void;
}

// realApiRequest(실제 fetch)와 mockApiRequest(fixture)가 공유하는 반환 형태.
// 엔드포인트마다 응답 스키마가 다르므로(AnalysisResponse, AlternativeComparisonResponse,
// EvidenceResponse, DemoScenarioListResponse 등) 공통 envelope로 감싸지 않고
// 호출부가 apiRequest<TResult>()로 실제 응답 타입을 지정한다.
export interface ApiResult<TResult = unknown> {
  data: TResult;
  meta: ResponseMeta;
}
