// docs/integration.md "공통 헤더"
import { randomUUID } from 'expo-crypto';

export const AUTHORIZATION_HEADER = 'Authorization';
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
  /** MVP 데모 토큰. Authorization: Bearer {token}으로 전송하고 로그에 남기지 않는다. */
  authToken?: string;
  /** 지정하지 않으면 변경 요청에서만 자동 생성한다. */
  requestId?: string;
  /** POST 요청에서만 사용. 지정하지 않으면 자동 생성한다. */
  idempotencyKey?: string;
  /** PATCH 요청에서만 사용하는 analysis revision. */
  ifMatchRevision?: number;
}

export function buildRequestHeaders(options: RequestHeaderOptions = {}): Headers {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  if (options.authToken) {
    headers.set(AUTHORIZATION_HEADER, `Bearer ${options.authToken}`);
  }
  if (options.requestId) {
    headers.set(REQUEST_ID_HEADER, options.requestId);
  }
  if (options.idempotencyKey) {
    headers.set(IDEMPOTENCY_KEY_HEADER, options.idempotencyKey);
  }
  if (options.ifMatchRevision !== undefined) {
    headers.set(IF_MATCH_HEADER, String(options.ifMatchRevision));
  }

  return headers;
}

export interface ResponseMeta {
  requestId: string | null;
  /** 서버가 ETag로 내려주는 현재 revision. */
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
