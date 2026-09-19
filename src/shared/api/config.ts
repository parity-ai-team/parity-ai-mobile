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
