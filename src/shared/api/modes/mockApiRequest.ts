// mock 모드 구현. src/mocks/handlers.ts에서 fixture 응답을 찾아 realApiRequest와
// 동일한 {data, meta} 형태로 반환한다. 실제 네트워크 호출은 하지 않는다.
import { resolveMockResponse } from '@/mocks/handlers';

import type { ApiResult, RequestOptions } from '../request';

export async function mockApiRequest<TResult = unknown>(
  options: RequestOptions,
): Promise<ApiResult<TResult>> {
  const resolved = resolveMockResponse(options);

  if (!resolved) {
    // 시뮬레이션할 API 오류가 아니라, mock handler 자체가 없다는 개발 시점 실수다.
    throw new Error(
      `[mock] ${options.method} ${options.path}에 대한 mock handler가 없습니다. src/mocks/handlers.ts에 추가하세요.`,
    );
  }

  return resolved as ApiResult<TResult>;
}
