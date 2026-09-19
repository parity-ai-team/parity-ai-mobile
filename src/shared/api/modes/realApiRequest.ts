// TEMP: OpenAPI 명세 확정 전 임시 수기 구현. docs/integration.md "공통 헤더",
// "오류·재시도·동시성" 기준. 결과 바디 타입은 아직 unknown이며, 폴링(500ms→1s→최대10s,
// 30초 초과 시 백그라운드 전환)은 이 PR 범위 밖이다 — analysis 결과 화면 PR에서 구현한다.
//
// docs/backend-integration.md(신규 백엔드 연동 가이드)와 몇몇 계약이 다르다
// (버전 충돌 상태 코드, 대안/근거/입력수정 엔드포인트 등). 이 파일은 이번
// PR(mock 계층)에서 고치지 않는다 — docs/decisions/api-contract-mismatch.md 참고.
import { getApiBaseUrl } from '../config';
import { ApiError } from '../errors';
import {
  buildRequestHeaders,
  generateIdempotencyKey,
  generateRequestId,
  readResponseMeta,
} from '../headers';
import type { ApiResult, RequestOptions } from '../request';
import type { ErrorEnvelope, SuccessEnvelope } from '../../types';

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
