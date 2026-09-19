# PARITY AI 모바일

PARITY AI PoC를 위한 Expo React Native·TypeScript 모바일 애플리케이션이다.

## 저장소 상태

현재 초기 저장소 설정을 진행하고 있다. 백엔드 OpenAPI 명세에서 생성한 타입을 사용하며 mock, 로컬 API, 데모 모드를 지원할 예정이다.

API 계약 요약은 [모바일·백엔드 API 계약](docs/integration.md), 백엔드 실행·OpenAPI 타입 생성·화면별 호출 순서와 오류 처리는 [백엔드 연동 가이드](docs/backend-integration.md)에서 확인한다.

## 시작하기

```bash
npm install
cp .env.example .env   # 필요 시 값 조정
npm start
```

| 명령 | 설명 |
|---|---|
| `npm start` | Expo 개발 서버 실행 |
| `npm run android` / `npm run ios` / `npm run web` | 플랫폼별 개발 서버 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run format` / `npm run format:check` | Prettier 포맷 적용 / 확인 (`.ts`, `.tsx`, `.js`, `.json`) |
| `npm run typecheck` | TypeScript strict 모드 타입 검사 |
| `npm test` | Jest 유닛/컴포넌트 테스트 |

## 폴더 구조

```
src/
  app/            # 라우트와 내비게이션 (Expo Router)
  features/       # 화면별 기능 모듈 (onboarding, financial-input, analysis, alternatives, asset-plan)
  shared/         # api, types, ui, validation, format, telemetry
  mocks/          # 합성 시나리오와 MSW 핸들러 (예정)
  store/          # draft/session 상태 (예정)
tests/            # 유닛/컴포넌트 테스트
```

자세한 화면 명세와 컴포넌트 계약은 개발 기준 문서를 따른다.

## 협업

PR을 만들기 전에 [CONTRIBUTING.md](CONTRIBUTING.md)를 확인한다. `EXPO_PUBLIC_` 환경 변수는 애플리케이션 번들에 포함되므로 비밀값을 넣지 않는다.
