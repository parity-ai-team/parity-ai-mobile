# PARITY AI 모바일

PARITY AI는 출산 전후 12개월의 가용현금 흐름을 시뮬레이션하는 의사결정 지원 앱이다. 사용자가 가구·소득·휴직 계획을 입력하면 위험월과 원인을 보여주고, 실행 가능한 대안과 안전 적립 가능 여부를 비교해준다. 잔액·부족액 등 숫자는 결정론적 계산 엔진(백엔드)이 산출하고, 앱은 검증된 결과를 표시하고 설명하는 역할만 맡는다.

API 계약의 기준은 `docs/api/openapi-1.7.0.json`(OpenAPI 1.7.0, 배포된 백엔드의 현재 버전)이다. 백엔드 실행·화면별 호출 순서와 오류 처리는 [백엔드 연동 가이드](docs/backend-integration.md)에서 확인한다. `docs/integration.md`는 초기 계획 문서로 실제 계약과 어긋나는 부분이 있어 더 이상 기준으로 쓰지 않는다 — 자세한 내용은 [결정 기록: API 계약 불일치](docs/decisions/api-contract-mismatch.md) 참고.

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
| `npm run generate:api-types` | `docs/api/openapi-1.7.0.json`에서 `src/shared/types/generated/backend.d.ts` 재생성 |

### 환경 변수 (`.env.example` 기준)

| 변수 | 기본값 | 설명 |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | `http://localhost:8000` | `EXPO_PUBLIC_APP_MODE=api`일 때만 실제로 쓰이는 백엔드 주소(mock 모드는 무시한다). 로컬 백엔드 또는 배포된 백엔드(예: `https://parity-ai-backend.onrender.com`) 주소를 넣는다. |
| `EXPO_PUBLIC_APP_MODE` | `mock` | `mock`이면 네트워크 없이 `src/mocks`의 합성 시나리오로 응답한다. `api`면 위 `EXPO_PUBLIC_API_BASE_URL`의 실제 백엔드에 요청한다. `demo`는 예약값이고 아직 구현되지 않았다. |
| `EXPO_PUBLIC_DATA_BADGE` | `true` | 화면 상단에 "데모 데이터" 배지를 표시할지 여부. |

`EXPO_PUBLIC_` 접두사가 붙은 변수는 클라이언트 번들에 그대로 포함되므로 비밀값을 넣지 않는다.

### api 모드로 전환하기

기본값(`mock`)은 네트워크 없이 데모를 실행하기 위한 것이다. 실제 배포된 백엔드로 확인하려면:

```bash
# .env
EXPO_PUBLIC_APP_MODE=api
EXPO_PUBLIC_API_BASE_URL=https://parity-ai-backend.onrender.com
```

값을 바꾼 뒤 개발 서버를 재시작한다(Expo는 `.env`를 시작 시점에만 읽는다). 웹으로 확인할 때는
**반드시 8081 포트**로 띄워야 한다 — 배포된 백엔드의 CORS 허용 origin이
`http://localhost:8081`, `http://127.0.0.1:8081`뿐이라 다른 포트는 브라우저에서 요청이 막힌다
(`npm run web`은 기본적으로 이 포트를 쓴다. 다른 포트로 이미 띄워 두었다면 종료 후 다시 실행한다).

api 모드에서 알아 둘 차이:

- 배포된 백엔드는 무료 플랜이라 잠들어 있을 수 있다. 첫 요청은 서버가 깨어나느라 최대 90초까지 걸릴 수 있고, 5초가 지나면 화면에 "서버를 깨우는 중이에요" 안내가 뜬다.
- 같은 이유로 DB가 영구 저장되지 않는다 — 서버가 재시작되면 이전에 만든 `analysis_id`가 사라질 수 있고, 그 상태로 결과·대안·근거 화면에 들어가면 "분석을 찾을 수 없어요" 안내와 함께 시작 화면으로 돌아가게 된다.
- 시나리오 선택(S03)의 "직접 입력" 카드는 api 모드에서 비활성화된다 — 서버가 `scenario_id` 또는 `dataset_id`(CSV 업로드) 중 정확히 하나를 요구하는데, 이 앱에는 아직 CSV 업로드 화면이 없다.

## 데모 흐름

시작 → 동의 → 시나리오 선택 → 입력(가구/재무/계획/검토) → 분석 → 결과 → 대안 → 근거 순으로 진행한다.

1. **시작** (`/`) — 앱 소개. `시작`은 빈 직접 입력으로, `데모로 보기`는 첫 데모가 선택된 상태로 이동한다.
2. **동의** (`/consent`) — 합성 데이터 사용에 대한 동의.
3. **시나리오 선택** (`/scenario`) — 직접 입력 또는 데모 3개 중 선택(scenario_id·기본값은 배포된 백엔드의 `GET /v1/demo-scenarios` 응답과 맞춘 것이다, 2026-09-20 확인):
   - **초산 · 맞벌이** (`first_birth_dual_income`) — 확정 금융정보와 휴직·돌봄 계획을 우선하는 초산 기준 경로.
   - **경산 · 외벌이 전환** (`second_birth_single_income`) — 첫째 출산 전후 Past Me와 현재 외벌이 조건의 차이를 반영하는 경산 경로.
   - **경산 · 한부모 불규칙소득** (`second_birth_single_parent_irregular_income`) — 소득 지급 지연과 양육비 미수령을 독립 스트레스 조건으로 적용하는 경산 경로.

   데모를 선택하면 이후 입력 화면에 해당 시나리오의 기본값이 미리 채워진다. 직접 입력은 모든 값을 빈 상태로 시작하며, 해당 사항이 없어도 0 또는 아니오를 명시해야 한다. "직접 입력"은 mock 모드에서만 고를 수 있다 — api 모드는 CSV 업로드(`dataset_id`) 없이는 분석을 만들 수 없어 비활성화되어 있다(위 "api 모드로 전환하기" 참고).

4. **입력** — 가구(`/household`) → 재무(`/financial`) → 계획(`/plan`) → 검토(`/review`) 순으로 정보를 확인·수정한다. 계획 화면의 "소득·지원금 변수" 섹션에는 **한부모 스트레스 입력**이 있다: 예상 소득 지연 주 수를 0보다 크게 입력하거나 양육비 미수령 가능성을 "예"로 선택하면, `경산 · 한부모 불규칙소득` 시나리오에서 위험월이 앞당겨지고 안전 적립이 보류로 전환되는 stressed 결과로 바뀐다. 0과 아니오를 입력하면 완만한 baseline 결과가 나온다. 다른 두 시나리오에는 이 입력이 영향을 주지 않는다. mock 모드는 이 입력으로 baseline/stressed fixture를 가르고, api 모드에서는 이 시나리오의 서버 기본값 자체가 이미 지연·미수령을 포함한 상태다.
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
- 입력: `docs/api/openapi-1.7.0.json`(팀 공용 계약 파일, 배포된 백엔드의 현재 버전이며 저장소에 커밋되어 있다).
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
- **API 타입은 자동 생성한다.** `docs/api/openapi-1.7.0.json`에서 `openapi-typescript`로 타입을 생성하고, 손으로 작성한 중복 DTO를 두지 않는다.
- **화면과 스타일을 분리한다.** 각 화면/컴포넌트는 `Xxx.tsx`(로직·마크업)와 `Xxx.styles.ts`(스타일)로 나눈다.

## 협업

PR을 만들기 전에 [CONTRIBUTING.md](CONTRIBUTING.md)를 확인한다. `EXPO_PUBLIC_` 환경 변수는 애플리케이션 번들에 포함되므로 비밀값을 넣지 않는다.

## 디자인과 반응형 레이아웃

브랜드·위험도·데이터 출처를 분리한 딥 틴/민트 테마를 사용한다. 색상, 간격,
타이포그래피, 모서리, 그림자, breakpoint는 `src/shared/ui/theme`에서 관리한다.
시스템 기본 글꼴과 tabular 숫자를 사용하며 새 폰트·이미지·패키지를 추가하지 않는다.

- 웹 데모는 390px 아이폰 프레임 안에서 한 열로 표시한다. 작은 브라우저에서는 프레임이 화면 너비에 맞춰지고, 네이티브에서는 기존 반응형 기준을 사용한다.
- 입력 하단 액션은 스크롤 밖에 배치하고 안전 여백을 유지한다. 검토의 기존 `분석 시작` 문구는 유지한다.
- 차트는 12개월 전체를 화면 너비에 맞춰 표시한다. 기본 선택은 예상 잔액이 가장 낮은 달이다. 44pt 이상의 이전·다음 달 버튼과 `월별 금액 보기` 세로 목록으로 월을 선택할 수 있다. 예측선, 비상금 기준선, 확정 현금, 예상 범위를 구분하고 0과 음수도 축에 포함한다. 빈 데이터와 단일 월도 처리한다.
- 결과 요약은 서버의 `risks`에서 `expected_gap_krw`가 가장 낮은 항목을 골라 월과 금액을 그대로 표시한다. 현금흐름이나 부족액을 재계산하지 않는다.
- 대안 화면은 현재 상태와 각 대안의 지표를 간결하게 비교한다. 현재 흐름 그래프는 접어두고 필요할 때 펼친다. 대안·안전 적립 화면의 복귀 버튼은 스크롤 밖에 둔다.
- 검토 화면에서 가구·금융·계획을 각각 수정할 수 있다. 결과의 `입력 수정`은 검토 화면으로 이동한다. 근거 화면은 입력 출처를 보존하며, 내부 식별자를 노출하지 않고 한국어 설명과 금액을 표시한다.

자세한 토큰·접근성 규칙은 [테마 문서](src/shared/ui/theme/README.md)를 참고한다.
