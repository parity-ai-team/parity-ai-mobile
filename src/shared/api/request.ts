import type { SuccessEnvelope } from '../types';
import type { ResponseMeta } from './headers';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method: HttpMethod;
  path: string;
  body?: unknown;
  authToken?: string;
  /** 지정하지 않으면 변경 요청에서만 자동 생성한다. */
  requestId?: string;
  /** PATCH 요청에서만 사용하는 analysis revision. */
  ifMatchRevision?: number;
  /** POST 요청에서만 사용. 지정하지 않으면 자동 생성한다. */
  idempotencyKey?: string;
}

// realApiRequest(실제 fetch)와 mockApiRequest(fixture)가 공유하는 반환 형태.
// 화면/훅은 이 타입만 보고 apiRequest()를 쓰면 되고, 어느 모드가 응답했는지는 몰라도 된다.
export interface ApiResult<TResult = unknown> {
  data: SuccessEnvelope<TResult>;
  meta: ResponseMeta;
}
