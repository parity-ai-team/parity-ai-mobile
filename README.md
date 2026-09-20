# PARITY AI 모바일

PARITY AI는 출산 전후 12개월의 가용현금 흐름을 시뮬레이션하는 의사결정 지원 앱이다. 사용자가 가구·소득·휴직 계획을 입력하면 위험월과 원인을 보여주고, 실행 가능한 대안과 안전 적립 가능 여부를 비교해준다. 잔액·부족액 등 숫자는 결정론적 계산 엔진(백엔드)이 산출하고, 앱은 검증된 결과를 표시하고 설명하는 역할만 맡는다.

API 계약의 기준은 `docs/api/openapi-1.5.0.json`(OpenAPI 1.5.0)이다. 백엔드 실행·화면별 호출 순서와 오류 처리는 [백엔드 연동 가이드](docs/backend-integration.md)에서 확인한다. `docs/integration.md`는 초기 계획 문서로 실제 계약과 어긋나는 부분이 있어 더 이상 기준으로 쓰지 않는다 — 자세한 내용은 [결정 기록: API 계약 불일치](docs/decisions/api-contract-mismatch.md) 참고.

## 시작하기

Node.js가 설치되어 있어야 한다(개발/검증은 Node.js v24로 진행했다). `npm run web`/`npm start`는 기본적으로 mock 모드로 동작하므로 백엔드 서버 없이도 실행할 수 있다.

```bash
npm install
cp .env.example .env   # 필요 시 값 조정
npm run web             # 웹 브라우저에서 실행
npm start               # Expo 개발 서버 실행 (Expo Go 앱으로 QR 스캔)
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

### 환경 변수 (`.env.example` 기준)

| 변수 | 기본값 | 설명 |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | `http://localhost:8000` | 백엔드 API 주소. mock 모드에서는 사용하지 않는다. |
| `EXPO_PUBLIC_APP_MODE` | `mock` | `mock`이면 실제 네트워크 대신 `src/mocks`의 합성 시나리오로 응답한다. 백엔드에 붙이려면 다른 값으로 바꾼다. |
| `EXPO_PUBLIC_DATA_BADGE` | `true` | 화면 상단에 "데모 데이터" 배지를 표시할지 여부. |

`EXPO_PUBLIC_` 접두사가 붙은 변수는 클라이언트 번들에 그대로 포함되므로 비밀값을 넣지 않는다.

## 데모 흐름

시작 → 동의 → 데모 시나리오 선택 → 입력(가구/재무/계획/검토) → 분석 → 결과 → 대안 → 근거 순으로 진행한다.

1. **시작** (`/`) — 앱 소개.
2. **동의** (`/consent`) — 합성 데이터 사용에 대한 동의.
3. **시나리오 선택** (`/scenario`) — 직접 입력 또는 데모 3개 중 선택:
   - **초산 · 맞벌이** (`first_birth_dual_income`) — 처음 출산을 준비하는 맞벌이 가구.
   - **경산 · 외벌이 전환** (`past_me_transition`) — 외벌이로 전환하는 경산 가구.
   - **경산 · 한부모** (`single_parent_stress`) — 지원금 지연 상황까지 포함한 한부모 가구.
   
   데모를 선택하면 이후 입력 화면에 해당 시나리오의 기본값이 미리 채워진다.
4. **입력** — 가구(`/household`) → 재무(`/financial`) → 계획(`/plan`) → 검토(`/review`) 순으로 정보를 확인·수정한다. 계획 화면의 "소득·지원금 변수" 섹션에는 **한부모 스트레스 토글**이 있다: 예상 소득 지연 주 수를 0보다 크게 입력하거나 양육비 미수령 가능성을 "예"로 선택하면, `경산 · 한부모` 시나리오에서 위험월이 앞당겨지고 안전 적립이 보류로 전환되는 stressed 결과로 바뀐다. 값을 비워두면(0, 아니오) 완만한 baseline 결과가 나온다. 다른 두 시나리오에는 이 토글이 영향을 주지 않는다.
5. **분석** (`/analysis`) — 계산 진행 화면.
6. **결과** (`/analysis/result`) — 위험월, 원인, 가용현금 그래프.
7. **대안** (`/alternatives`) — 실행 가능한 대안 비교. 결과 화면에서 "안전 적립"(`/asset-start`)으로도 이동할 수 있다.
8. **근거** (`/evidence/[traceId]`) — 결과·대안 화면의 각 숫자에서 계산 근거로 들어간다.

## 폴더 구조

```
src/
  app/            # 라우트와 내비게이션 (Expo Router)
  features/       # 화면별 기능 모듈 (onboarding, financial-input, analysis, alternatives, asset-plan)
  shared/         # api, types, ui, format 등 화면 간 공용 코드
  mocks/          # mock 모드에서 쓰는 합성 시나리오와 라우팅 핸들러
  store/          # draft/session 상태 (예정)
tests/            # Jest 유닛/컴포넌트 테스트
```

- `src/app`: 화면 파일이 라우트가 되는 Expo Router 디렉터리. 실제 화면 구현은 대부분 `features/*`를 그대로 다시 내보낸다.
- `src/features`: 온보딩·재무 입력·분석·대안·자산 계획 등 화면별 로직과 UI를 도메인 단위로 묶는다.
- `src/shared`: 여러 feature가 함께 쓰는 API 클라이언트, 생성된 API 타입, 공용 UI 컴포넌트, 금액 포맷 등을 둔다.
- `src/mocks`: `EXPO_PUBLIC_APP_MODE=mock`일 때 `shared/api`가 실제 네트워크 대신 사용하는 합성 시나리오 fixture. 자세한 규칙은 [`src/mocks/README.md`](src/mocks/README.md) 참고.
- `tests`: 화면·컴포넌트·API 클라이언트에 대한 Jest 테스트.

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

## 검증

PR을 만들기 전에 아래 명령을 실행한다.

```bash
npm run typecheck
npm run lint
npm test
```

## 주요 설계 결정

- **숫자는 서버가 계산하고 앱은 표시만 한다.** 잔액·이자·부족액 등은 결정론적 계산 엔진(백엔드)이 산출한 값을 그대로 KRW 형식으로 표시하며, 화면에서 재계산하지 않는다(`docs/frontend.md` 참고).
- **mock 모드가 기본이다.** `EXPO_PUBLIC_APP_MODE=mock`이면 `src/mocks`의 합성 시나리오로 응답해 백엔드 없이도 전체 데모 흐름을 실행할 수 있다.
- **API 타입은 자동 생성한다.** `docs/api/openapi-1.5.0.json`에서 `openapi-typescript`로 타입을 생성하고, 손으로 작성한 중복 DTO를 두지 않는다.
- **화면과 스타일을 분리한다.** 각 화면/컴포넌트는 `Xxx.tsx`(로직·마크업)와 `Xxx.styles.ts`(스타일)로 나눈다.

## 협업

PR을 만들기 전에 [CONTRIBUTING.md](CONTRIBUTING.md)를 확인한다. `EXPO_PUBLIC_` 환경 변수는 애플리케이션 번들에 포함되므로 비밀값을 넣지 않는다.

## 디자인과 반응형 레이아웃

브랜드·위험도·데이터 출처를 분리한 딥 틴/민트 테마를 사용한다. 색상, 간격,
타이포그래피, 모서리, 그림자, breakpoint는 `src/shared/ui/theme`에서 관리한다.
시스템 기본 글꼴과 tabular 숫자를 사용하며 새 폰트·이미지·패키지를 추가하지 않는다.

- 768px 이상: 본문 최대 560px 중앙 정렬. 결과·대안은 1100px 이상에서 최대 1120px의 2열 구성.
- 입력 하단 액션은 스크롤 밖에 배치하고 안전 여백을 유지한다. 검토의 기존 `분석 시작` 문구는 유지한다.
- 차트와 표는 좁은 화면에서 가로 스크롤한다. 차트의 월별 선택 영역은 최소 44pt이며, 키보드 선택은 `표로 보기`로 펼친 표에서 제공한다.
- 결과 요약은 서버의 `risks`에서 `expected_gap_krw`가 가장 낮은 항목을 골라 월과 금액을 그대로 표시한다. 현금흐름이나 부족액을 재계산하지 않는다.
- 대안 상단의 현상유지 카드는 스크롤 중에도 기준선으로 남는다. 위험도와 출처는 기존 문구와 별도 색으로 구분한다.

자세한 토큰·접근성 규칙은 [테마 문서](src/shared/ui/theme/README.md)를 참고한다.
