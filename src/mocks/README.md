# Mock 데이터 계층

`EXPO_PUBLIC_APP_MODE=mock`일 때 `shared/api`가 실제 네트워크 대신 사용하는
합성 시나리오 fixture와 라우팅 핸들러.

## 구조

| 파일/폴더                     | 내용                                                                 |
| ----------------------------- | -------------------------------------------------------------------- |
| `scenarios/first-birth.ts`    | 초산·맞벌이 (`first_birth_dual_income`)                              |
| `scenarios/past-me.ts`        | 경산·외벌이 전환 (`past_me_transition`)                              |
| `scenarios/single-parent.ts`  | 경산·한부모 (`single_parent_stress`), 지연·미수령 토글별 fixture 2개 |
| `scenarios/build-cashflow.ts` | 12개월 `CashFlowPoint[]`를 만드는 헬퍼                               |
| `handlers.ts`                 | `(method, path)` → fixture로 라우팅하는 단일 진입점                  |

## 규칙

1. **OpenAPI가 최종 기준.** `docs/integration.md`와
   `docs/backend-integration.md`는 백엔드 OpenAPI `1.5.0`을 따른다. 기존 계약으로
   작성된 mock 경로의 이전 상태는 `docs/decisions/api-contract-mismatch.md`에서
   관리한다.
2. **합성 데이터만.** 실제 개인정보처럼 보이는 값(실명, 실제 계좌, 실제 지역
   상세 주소 등)을 넣지 않는다. 모든 fixture는 `limitations: ["SYNTHETIC_DATA"]`를 갖는다.
3. **시나리오마다 결과가 달라야 한다.** 위험월, 원인 코드, 부족액, 안전 적립
   통과/보류가 시나리오별로 구분되게 유지한다.
4. **`AlternativeSummary`는 화면에 직접 넘기지 않는다.** `src/shared/types/alternative-summary.ts`가
   설명하듯 원본 JSON 예시가 없는 추측 타입이라, 화면은 반드시 feature 쪽
   ViewModel 변환 함수를 거친 뒤에 사용한다.
5. **`GET`/`POST`만 지원.** `PATCH`/`recalculate`/`alternatives`/`evidence`/`DELETE`
   mock은 아직 없다. 필요해지면 `handlers.ts`에 handler를 추가한다.
