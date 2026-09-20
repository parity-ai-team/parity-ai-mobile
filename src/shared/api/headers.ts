// docs/integration.md "공통 헤더"
import { randomUUID } from 'expo-crypto';

export const REQUEST_ID_HEADER = 'X-Request-ID';
export const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';
export const IF_MATCH_HEADER = 'If-Match';
export const ETAG_HEADER = 'ETag';
export const API_VERSION_HEADER = 'X-API-Version';

// 식별자 접두어 규칙(docs/integration.md "공통 계약"): req_, trc_, ana_
export function generateRequestId(): string {
  return `req_${randomUUID()}`;
}

// Idempotency-Key는 접두어 없이 UUID 그대로 사용한다(docs/integration.md "공통 헤더").
export function generateIdempotencyKey(): string {
  return randomUUID();
}

export interface RequestHeaderOptions {
  /** 지정하지 않으면 변경 요청에서만 자동 생성한다. */
  requestId?: string;
  /** POST 요청에서만 사용. 지정하지 않으면 자동 생성한다. */
  idempotencyKey?: string;
  /**
   * PATCH/DELETE 요청에서만 사용하는 If-Match 값. 서버가 응답 ETag로 내려준
   * 문자열을 가공 없이 그대로 넣는다(W/"ana_xxx:1"처럼 약한 ETag 접두사가
   * 붙을 수 있고, 그 형태 그대로 보내야 한다 — revision 숫자로 재구성하면
   * 안 된다).
   */
  ifMatch?: string;
  /** FormData 요청에서는 런타임이 multipart boundary를 붙이도록 null을 사용한다. */
  contentType?: string | null;
}

// 백엔드는 인증을 쓰지 않는다(2026-09-20 백엔드 팀 확인: "Authorization
// 헤더를 보내지 않는다") — 그래서 이 함수는 Authorization을 만들 방법 자체를
// 제공하지 않는다.
export function buildRequestHeaders(options: RequestHeaderOptions = {}): Headers {
  const headers = new Headers();
  if (options.contentType !== null) {
    headers.set('Content-Type', options.contentType ?? 'application/json');
  }

  if (options.requestId) {
    headers.set(REQUEST_ID_HEADER, options.requestId);
  }
  if (options.idempotencyKey) {
    headers.set(IDEMPOTENCY_KEY_HEADER, options.idempotencyKey);
  }
  if (options.ifMatch !== undefined) {
    headers.set(IF_MATCH_HEADER, options.ifMatch);
  }

  return headers;
}

export interface ResponseMeta {
  requestId: string | null;
  /** 서버가 ETag로 내려주는 값 그대로(W/"ana_xxx:1" 형태일 수 있다). 이후 If-Match에 그대로 재사용한다. */
  revision: string | null;
  apiVersion: string | null;
}

export function readResponseMeta(response: Response): ResponseMeta {
  return {
    requestId: response.headers.get(REQUEST_ID_HEADER),
    revision: response.headers.get(ETAG_HEADER),
    apiVersion: response.headers.get(API_VERSION_HEADER),
  };
}
