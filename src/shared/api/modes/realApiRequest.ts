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

// PATCH/DELETE 둘 다 If-Match가 필수다(누락 시 428 PRECONDITION_REQUIRED,
// 2026-09-20 실서버로 확인). 서버 왕복 없이 여기서 바로 실패시킨다.
const IF_MATCH_REQUIRED_METHODS: ReadonlySet<RequestOptions['method']> = new Set([
  'PATCH',
  'DELETE',
]);

// 무료 플랜 백엔드는 잠들어 있다가 첫 요청에서 깨어나는 데 50초 이상 걸릴 수
// 있다(2026-09-20 백엔드 팀 확인) — 넉넉히 90초까지 기다린다.
const REQUEST_TIMEOUT_MS = 90_000;
// 이 시간이 지나도 응답이 없으면 "콜드 스타트일 수 있다"는 신호로
// onSlowRequest를 호출한다. 화면은 이걸로 "서버를 깨우는 중" 안내를 보여준다.
const SLOW_REQUEST_WARNING_MS = 5_000;

export async function realApiRequest<TResult = unknown>(
  options: RequestOptions,
): Promise<ApiResult<TResult>> {
  const { method, path, body, ifMatch, onSlowRequest } = options;
  const isMutating = MUTATING_METHODS.has(method);

  if (IF_MATCH_REQUIRED_METHODS.has(method) && ifMatch === undefined) {
    throw new Error(`${method} ${path} 요청에는 ifMatch(If-Match)가 필요합니다.`);
  }

  const headers = buildRequestHeaders({
    requestId: options.requestId ?? (isMutating ? generateRequestId() : undefined),
    idempotencyKey:
      method === 'POST' ? (options.idempotencyKey ?? generateIdempotencyKey()) : undefined,
    ifMatch,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const slowRequestId = onSlowRequest
    ? setTimeout(onSlowRequest, SLOW_REQUEST_WARNING_MS)
    : undefined;

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        '서버가 90초 안에 응답하지 않았어요. 무료 서버가 잠들어 있었을 수 있어요 — 잠시 후 다시 시도해 주세요.',
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    if (slowRequestId !== undefined) {
      clearTimeout(slowRequestId);
    }
  }

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
