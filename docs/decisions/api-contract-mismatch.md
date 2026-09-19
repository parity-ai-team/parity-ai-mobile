# 결정 기록: API 계약 불일치 (docs/integration.md vs docs/backend-integration.md)

- 상태: 확인 중 (백엔드 담당자에게 질의함)
- 작성일: 2026-09-19
- 관련 PR: `feat/api-client-and-types`(PR #4), `feat/mock-scenarios`(로드맵 PR #5)

## 배경

`docs/integration.md`(프론트·백엔드 공통 계약 문서)를 기준으로 `shared/api` 클라이언트와
임시 타입(PR #4)을 먼저 만들었다. 이후 main에 `docs/backend-integration.md`(백엔드
저장소를 가리키는 실제 연동 가이드)가 추가로 들어왔는데, 두 문서가 같은 항목을
다르게 정의하고 있다. 백엔드 `parity-ai-backend` 저장소는 비공개(또는 접근 불가)라
`/openapi.json` 원문을 직접 확인하지 못했고, 어느 쪽이 실제 구현과 맞는지는 백엔드
담당자 확인을 기다리는 중이다.

## 불일치 목록

| 항목 | `docs/integration.md` 기준 | `docs/backend-integration.md` 기준 |
| --- | --- | --- |
| 버전 충돌 상태 코드 | `409 VERSION_CONFLICT` | `412 VERSION_CONFLICT` |
| 멱등성 충돌 | 명시 없음 | `409 IDEMPOTENCY_CONFLICT` (새 코드) |
| If-Match 누락 | 명시 없음 | `428 PRECONDITION_REQUIRED` (새 코드) |
| 대안 비교 엔드포인트 | `POST /v1/analyses/{id}/alternatives/compare` | `GET /v1/analyses/{id}/alternatives` |
| 근거 조회 엔드포인트 | `GET /v1/analyses/{id}/evidence` (전체) | `GET /v1/analyses/{id}/evidence/{trace_id}` (건별) |
| 입력 수정 엔드포인트 | `PATCH /v1/analyses/{id}/inputs` | `PATCH /v1/analyses/{id}` |
| 계산 방식 | `calculating` 상태를 폴링(500ms→1s→최대10s) | 동기 응답, 폴링 불필요 |
| API/모델 버전 | 예시 `api: "1.0"`, `model: "cashflow-1.0.0"` | 실제 `1.5.0` / `cashflow-1.4.0` |

## 현재 결정

1. 백엔드 담당자 확인 결과가 오기 전까지, mock 계층(`src/mocks/`)과 `shared/api` 클라이언트는
   `docs/integration.md` 기준을 그대로 유지한다.
2. 두 문서가 다른 부분은 `src/mocks/handlers.ts` 한 곳에만 모아 분기한다. 경로가 바뀌면
   그 파일의 매칭 규칙만 바꾸면 되게 해 둔다.
3. `shared/api`의 실제 fetch 구현(`src/shared/api/modes/realApiRequest.ts`)은 이번
   PR(mock 계층)에서 건드리지 않는다. 계약이 확정되면 별도 PR로 헤더·에러·엔드포인트를
   다시 정리한다.

## 후속 조치

- [ ] 백엔드 담당자 확인 결과를 이 문서에 반영하고 상태를 "확인 중"에서 "확정"으로 바꾼다.
- [ ] 확정된 계약으로 `realApiRequest.ts`, `endpoints.ts`, `error-codes.ts`를 갱신하는 PR을 만든다.
- [ ] `src/mocks/handlers.ts`의 경로 분기를 확정된 계약 하나로 정리한다.
