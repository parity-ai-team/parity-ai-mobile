// TEMP: OpenAPI 명세 확정 전 임시 수기 클라이언트. docs/integration.md "공통 헤더",
// "오류·재시도·동시성" 기준. 결과 바디 타입은 아직 unknown이며, 폴링(500ms→1s→최대10s,
// 30초 초과 시 백그라운드 전환)은 이 PR 범위 밖이다 — analysis 결과 화면 PR에서 구현한다.
import { getApiBaseUrl } from './config';
import {
  buildRequestHeaders,
  generateIdempotencyKey,
  generateRequestId,
  readResponseMeta,
} from './headers';
import type { ErrorEnvelope, SuccessEnvelope } from '../types';

export class ApiError extends Error {
  readonly status: number;
  readonly envelope: ErrorEnvelope;

  constructor(envelope: ErrorEnvelope, status: number) {
    super(envelope.error.message);
    this.name = 'ApiError';
    this.status = status;
    this.envelope = envelope;
  }

  get code() {
    return this.envelope.error.code;
  }

  get retryable() {
    return this.envelope.error.retryable;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

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

const MUTATING_METHODS: ReadonlySet<HttpMethod> = new Set(['POST', 'PATCH', 'DELETE']);

export async function apiRequest<TResult = unknown>(
  options: RequestOptions,
): Promise<{ data: SuccessEnvelope<TResult>; meta: ReturnType<typeof readResponseMeta> }> {
  const { method, path, body, authToken, ifMatchRevision } = options;
  const isMutating = MUTATING_METHODS.has(method);

  const headers = buildRequestHeaders({
    authToken,
    requestId: options.requestId ?? (isMutating ? generateRequestId() : undefined),
    idempotencyKey:
      method === 'POST' ? (options.idempotencyKey ?? generateIdempotencyKey()) : undefined,
    ifMatchRevision,
  });

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const meta = readResponseMeta(response);

  // DELETE 성공은 204 No Content(docs/integration.md "오류·재시도·동시성")라 바디가 없다.
  if (response.status === 204) {
    return { data: undefined as unknown as SuccessEnvelope<TResult>, meta };
  }

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(json as ErrorEnvelope, response.status);
  }

  return { data: json as SuccessEnvelope<TResult>, meta };
}
