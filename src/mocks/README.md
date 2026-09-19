# Mock 데이터 계층

`EXPO_PUBLIC_APP_MODE=mock`일 때 `shared/api`가 실제 네트워크 대신 사용하는
합성 시나리오 fixture와 라우팅 핸들러.

## 구조

| 파일/폴더                       | 내용                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `scenarios/first-birth.ts`       | 초산·맞벌이 (`first_birth_dual_income`)                                       |
| `scenarios/past-me.ts`           | 경산·외벌이 전환 (`past_me_transition`)                                       |
| `scenarios/single-parent.ts`     | 경산·한부모 (`single_parent_stress`), 지연·미수령 토글별 fixture 2개          |
| `scenarios/build-cashflow.ts`    | 12개월 `CashflowPoint[]`를 만드는 헬퍼 (trace_ids 자동 채움)                  |
| `scenarios/build-alternatives.ts` | `AlternativeDetail` 하나에서 `AlternativeSummary`를 파생시키는 헬퍼           |
| `handlers.ts`                    | `(method, path)` → fixture로 라우팅하는 단일 진입점                          |

## 규칙

1. **OpenAPI가 최종 기준.** `docs/backend-integration.md`와
   `docs/api/openapi-1.5.0.json`이 연동 계약의 기준이다(`docs/decisions/api-contract-mismatch.md`
   에서 확정). fixture 구조는 `docs/api/analysis-response-example.json`,
   `docs/api/alternatives-response-example.json` 예시를 그대로 따른다.
2. **합성 데이터만.** 실제 개인정보처럼 보이는 값(실명, 실제 계좌, 실제 지역
   상세 주소 등)을 넣지 않는다. 모든 fixture는 `limitations: ["SYNTHETIC_DATA"]`를 갖는다.
3. **시나리오마다 결과가 달라야 한다.** 위험월, 원인 코드, 부족액, 안전 적립
   통과/보류가 시나리오별로 구분되게 유지한다.
4. **`AlternativeSummary`는 실제 스키마다.** `AlternativeDetail`에서
   `build-alternatives.ts`의 `toAlternativeSummary()`로 파생시켜, 분석 결과에
   들어가는 요약과 `GET .../alternatives` 상세가 값이 어긋나지 않게 한다.
5. **`GET`/`POST`만 지원.** `POST /v1/analyses`, `GET /v1/analyses/{id}`,
   `GET /v1/analyses/{id}/alternatives`만 mock한다. `PATCH`/`recalculate`/`evidence`/`DELETE`
   mock은 아직 없다. 필요해지면 `handlers.ts`에 handler를 추가한다.
