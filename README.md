# PARITY AI 모바일

PARITY AI PoC를 위한 Expo React Native·TypeScript 모바일 애플리케이션이다.

## 저장소 상태

현재 초기 저장소 설정을 진행하고 있다. 백엔드 OpenAPI 명세에서 생성한 타입을 사용하며 mock, 로컬 API, 데모 모드를 지원할 예정이다.

API 계약의 기준은 `docs/api/openapi-1.5.0.json`(OpenAPI 1.5.0)이다. 백엔드 실행·화면별 호출 순서와 오류 처리는 [백엔드 연동 가이드](docs/backend-integration.md)에서 확인한다. `docs/integration.md`는 초기 계획 문서로 실제 계약과 어긋나는 부분이 있어 더 이상 기준으로 쓰지 않는다 — 자세한 내용은 [결정 기록: API 계약 불일치](docs/decisions/api-contract-mismatch.md) 참고.

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
| `npm run generate:api-types` | `docs/api/openapi-1.5.0.json`에서 `src/shared/types/generated/backend.d.ts` 재생성 |

## API 타입 생성

`src/shared/types` 아래 API 관련 타입은 손으로 작성하지 않고 백엔드 OpenAPI 명세에서 생성한다.

- 생성기: [`openapi-typescript`](https://openapi-ts.dev/). 런타임 의존성 없이 `.d.ts` 타입만 만들어서, 이 저장소가 이미 자체 `fetch` 계층(`src/shared/api`)을 직접 관리하는 구조에 맞는다.
- 입력: `docs/api/openapi-1.5.0.json`(팀 공용 계약 파일, 저장소에 커밋되어 있다).
- 출력: `src/shared/types/generated/backend.d.ts`. 생성 파일이라 커밋하지 않는다(`.gitignore` 참고).

타입은 자동 생성된다 — `npm run typecheck`/`npm run lint`/`npm test` 실행 전에
매번 `pretypecheck`/`prelint`/`pretest`가 `generate:api-types`를 먼저 돌려서,
클론 직후에도 `backend.d.ts`가 없다는 이유로 실패하지 않는다. 수동으로
다시 만들고 싶으면 아래 명령을 쓴다.

```bash
npm run generate:api-types
```

`src/shared/types/generated/backend.d.ts`를 직접 수정하지 않는다. 의미 있는 이름으로 다시 내보내거나 헬퍼를 추가할 때는 `src/shared/types/generated/index.ts`와 `src/shared/types/index.ts`를 고친다.

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
