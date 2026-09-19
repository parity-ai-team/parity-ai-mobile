// docs/integration.md "공통 계약": Base URL은 환경별로 EXPO_PUBLIC_API_BASE_URL로 주입한다.
export function getApiBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL이 설정되지 않았습니다. .env.example을 참고해 .env를 구성하세요.',
    );
  }

  return baseUrl;
}

// docs/integration.md "필수 환경변수": EXPO_PUBLIC_APP_MODE = mock | api | demo
export type AppMode = 'mock' | 'api' | 'demo';

const APP_MODES: readonly AppMode[] = ['mock', 'api', 'demo'];

// .env.example 기본값이 mock이라, 값이 비어 있을 때도 mock으로 취급해
// 백엔드 없이 바로 앱을 띄울 수 있게 한다.
//
// rawMode 인자는 테스트 전용이다: babel-preset-expo의 inline-env-vars 플러그인이
// process.env.EXPO_PUBLIC_*를 빌드 시점 값으로 치환하기 때문에, 테스트에서
// process.env를 나중에 바꿔도 이미 변환된 참조에는 반영되지 않는다. 화면·훅은
// 인자 없이 getAppMode()만 호출하면 된다.
export function getAppMode(rawMode = process.env.EXPO_PUBLIC_APP_MODE): AppMode {
  if (!rawMode) {
    return 'mock';
  }
  if ((APP_MODES as readonly string[]).includes(rawMode)) {
    return rawMode as AppMode;
  }

  throw new Error(
    `EXPO_PUBLIC_APP_MODE 값이 올바르지 않습니다: "${rawMode}" (mock | api | demo 중 하나여야 합니다).`,
  );
}
