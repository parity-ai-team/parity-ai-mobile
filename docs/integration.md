# 모바일·백엔드 API 계약

이 문서는 모바일 개발에서 자주 확인하는 연동 계약을 간단히 정리한다. 실행 방법, 화면별 호출 흐름, 헤더 처리는 [백엔드 연동 가이드](backend-integration.md)를 따른다.

## 기준

- 최종 기준은 백엔드 `main`의 `GET /openapi.json`이다.
- 현재 API 계약 버전은 `1.5.0`, 계산 모델 버전은 `cashflow-1.4.0`이다.
- 응답 필드와 열거형은 수기 DTO보다 OpenAPI에서 생성한 타입을 우선한다.
- `status=limited`는 오류가 아니라 합성 데이터·PoC 가정이 포함된 정상 결과다.

## 확정된 계약

| 항목 | 현재 백엔드 동작 |
| --- | --- |
| 분석 생성 | `POST /v1/analyses` |
| 분석 조회 | `GET /v1/analyses/{analysis_id}` |
| 입력 수정 | `PATCH /v1/analyses/{analysis_id}` |
| 재계산 | `POST /v1/analyses/{analysis_id}/recalculate` |
| 대안 비교 | `GET /v1/analyses/{analysis_id}/alternatives` |
| 근거 조회 | `GET /v1/analyses/{analysis_id}/evidence/{trace_id}` |
| 분석 삭제 | `DELETE /v1/analyses/{analysis_id}` |
| 버전 충돌 | `412 VERSION_CONFLICT` |
| `If-Match` 누락 | `428 PRECONDITION_REQUIRED` |
| 멱등성 키 충돌 | `409 IDEMPOTENCY_CONFLICT` |
| 계산 방식 | 동기 응답, polling 불필요 |

## 적용 주의사항

- `POST /v1/analyses/{id}/alternatives/compare`는 사용하지 않는다.
- `PATCH /v1/analyses/{id}/inputs`는 사용하지 않는다.
- `GET /v1/analyses/{id}/evidence`로 전체 근거를 조회하지 않고, 결과의 `trace_id`를 건별 경로에 넣는다.
- `calculating`은 미래 비동기 처리를 위해 상태 열거형에는 남아 있지만, 현재 백엔드는 해당 상태를 반환하지 않는다.
- `409`는 revision 충돌이 아니라 같은 `Idempotency-Key`를 다른 요청 본문에 재사용했을 때의 충돌이다.

## 주요 호출 흐름

1. `POST /v1/analyses`에 새 `Idempotency-Key`를 보내 분석 결과를 동기로 받는다.
2. 성공 응답의 `ETag`를 `analysis_id`와 함께 저장한다.
3. 수정·재계산·삭제 요청에 최신 `ETag`를 `If-Match`로 보낸다.
4. `412 VERSION_CONFLICT`면 최신 revision을 다시 조회한 뒤 충돌을 해결한다.
5. 대안은 `GET .../alternatives`, 근거는 `GET .../evidence/{trace_id}`로 조회한다.
