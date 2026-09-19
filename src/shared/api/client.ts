// EXPO_PUBLIC_APP_MODE에 따라 실제 fetch 구현(realApiRequest)과 mock 구현
// (mockApiRequest) 중 하나로 위임하는 단일 진입점. 화면·훅은 이 함수의 시그니처만
// 알면 되고, 지금 어떤 모드로 떠 있는지는 몰라도 된다 — 모드 전환은 이 파일과
// config.ts의 getAppMode()만 바뀌면 된다.
import { getAppMode } from './config';
import type { AppMode } from './config';
import { mockApiRequest } from './modes/mockApiRequest';
import { realApiRequest } from './modes/realApiRequest';
import type { ApiResult, RequestOptions } from './request';

// mode 인자는 테스트 전용이다(config.ts의 getAppMode() 주석 참고). 화면·훅은
// apiRequest(options)만 호출하면 되고 모드를 몰라도 된다.
export async function apiRequest<TResult = unknown>(
  options: RequestOptions,
  mode: AppMode = getAppMode(),
): Promise<ApiResult<TResult>> {
  if (mode === 'mock') {
    return mockApiRequest<TResult>(options);
  }
  return realApiRequest<TResult>(options);
}
