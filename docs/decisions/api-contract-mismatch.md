# 결정 기록: API 계약 불일치 (`docs/integration.md` vs `docs/backend-integration.md`)

- 상태: 해결됨 — `docs/backend-integration.md`(OpenAPI 1.5.0)가 기준
- 작성일: 2026-09-19
- 확정일: 2026-09-20
- 반영일: 2026-09-20
- 관련 PR: `feat/api-client-and-types`(PR #4), `feat/mock-scenarios`(로드맵 PR #5), `feat/api-contract-alignment`(본 PR)

## 배경

기존 `docs/integration.md` 기준으로 `shared/api` 클라이언트와 임시 타입(PR #4)을
먼저 만들었다. 이후 `docs/backend-integration.md`와 백엔드 실제 구현을 대조한 결과,
기존 문서의 일부 경로·상태 코드·계산 방식이 실제 API와 다른 것을 확인했다.
`docs/integration.md`는 확정된 계약으로 교체했다.

## 불일치 확인 결과

| 항목 | 기존 계약 | 확정된 계약 |
| --- | --- | --- |
| 버전 충돌 상태 코드 | `409 VERSION_CONFLICT` | `412 VERSION_CONFLICT` |
| 멱등성 충돌 | 명시 없음 | `409 IDEMPOTENCY_CONFLICT` |
| `If-Match` 누락 | 명시 없음 | `428 PRECONDITION_REQUIRED` |
| 대안 비교 엔드포인트 | `POST /v1/analyses/{id}/alternatives/compare` | `GET /v1/analyses/{id}/alternatives` |
| 근거 조회 엔드포인트 | `GET /v1/analyses/{id}/evidence` (전체) | `GET /v1/analyses/{id}/evidence/{trace_id}` (건별) |
| 입력 수정 엔드포인트 | `PATCH /v1/analyses/{id}/inputs` | `PATCH /v1/analyses/{id}` |
| 계산 방식 | `calculating` 상태 polling | 동기 응답, polling 불필요 |
| API/모델 버전 | 예시 `api: "1.0"`, `model: "cashflow-1.0.0"` | 실제 `1.5.0` / `cashflow-1.4.0` |

## 확정 결과

1. OpenAPI `1.5.0`과 `docs/backend-integration.md`를 연동 계약의 기준으로 삼는다.
2. 대안은 `GET /alternatives`, 근거는 `GET /evidence/{trace_id}`, 입력 수정은 `PATCH /analyses/{id}`를 사용한다.
3. revision 충돌은 `412`, 멱등성 키 충돌은 `409`, `If-Match` 누락은 `428`로 처리한다.
4. 현재 분석 생성은 동기 응답이므로 `calculating` polling을 기본 흐름으로 구현하지 않는다.

## 후속 조치

- [x] 백엔드 실제 구현과 OpenAPI 기준을 문서에 반영한다.
- [x] 확정된 계약으로 `realApiRequest.ts`, `endpoints.ts`를 갱신한다. `error-codes.ts`를 포함한
      TEMP 수기 타입(`analysis-status`, `cause-codes`, `envelope`, 결과 타입)은 갱신이 아니라
      `openapi-typescript` 생성 타입으로 전부 교체했다 — `src/shared/types/generated/`.
- [x] `src/mocks/handlers.ts`의 경로 분기를 확정된 계약 하나로 정리한다. `GET /v1/analyses/{id}/alternatives`
      mock도 추가했다. `PATCH`/`recalculate`/`evidence`/`DELETE`는 여전히 mock하지 않는다
      (`src/mocks/README.md` 참고) — 필요해지면 후속 PR에서 추가한다.
