// docs/backend-integration.md 기준 실제 백엔드 연동 구현체.
//
// 폴링(500ms→1s→최대10s, 30초 초과 시 백그라운드 전환) 관련 상수는 이 파일에
// 두지 않는다 — 현재 분석 생성·재계산은 동기 응답이라 미사용이고
// (docs/backend-integration.md "12. 현재 PoC 제한"), 백엔드가 비동기
// calculating 흐름으로 바뀌면 그때 다시 도입한다(docs/decisions/api-contract-mismatch.md).
import { getApiBaseUrl } from '../config';
import { ApiError } from '../errors';
import {
  buildRequestHeaders,
  generateIdempotencyKey,
  generateRequestId,
  readResponseMeta,
} from '../headers';
import type { ApiResult, RequestOptions } from '../request';
import type { ErrorEnvelope } from '../../types';

const MUTATING_METHODS: ReadonlySet<RequestOptions['method']> = new Set([
  'POST',
  'PATCH',
  'DELETE',
]);

export async function realApiRequest<TResult = unknown>(
  options: RequestOptions,
): Promise<ApiResult<TResult>> {
  const { method, path, body, authToken, ifMatchRevision } = options;
  const isMutating = MUTATING_METHODS.has(method);

  // PATCH /v1/analyses/{id}는 If-Match가 필수다(누락 시 428 PRECONDITION_REQUIRED).
  // 서버 왕복 없이 여기서 바로 실패시킨다.
  if (method === 'PATCH' && ifMatchRevision === undefined) {
    throw new Error(
      'PATCH /v1/analyses/{id} 요청에는 ifMatchRevision(If-Match)이 필요합니다.',
    );
  }

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

  // DELETE 성공은 204 No Content(docs/backend-integration.md "5. 전체 API 흐름")라 바디가 없다.
  if (response.status === 204) {
    return { data: undefined as unknown as TResult, meta };
  }

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(json as ErrorEnvelope, response.status);
  }

  return { data: json as TResult, meta };
}
