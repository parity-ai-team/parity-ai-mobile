# 백엔드 연동 가이드

이 문서는 PARITY AI 모바일 앱에서 백엔드 API를 연결할 때 필요한 규칙과 화면별 호출 흐름을 정리한다.

## 1. 기준 정보

- 백엔드 저장소: [parity-ai-backend](https://github.com/parity-ai-team/parity-ai-backend)
- 기준 브랜치: `main`
- API 계약 버전: `1.5.0`
- 계산 모델 버전: `cashflow-1.4.0`
- Swagger UI: `{API_BASE_URL}/docs`
- OpenAPI JSON: `{API_BASE_URL}/openapi.json`

필드, 열거형, 필수 여부와 응답 형식의 최종 기준은 백엔드 `main`의 `/openapi.json`이다. 이 문서와 OpenAPI가 다르면 OpenAPI를 우선하고 두 저장소의 문서를 함께 갱신한다.

## 2. 로컬 백엔드 실행

백엔드 저장소에서 실행한다.

```bash
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

실행 후 `GET {API_BASE_URL}/health`가 `200` 응답을 반환하는지 확인한다.

## 3. 기기별 API 주소

`.env.example`의 `EXPO_PUBLIC_API_BASE_URL`을 로컬 `.env`에 복사해 사용한다. `EXPO_PUBLIC_` 값은 앱 번들에 포함되므로 토큰·비밀키를 넣지 않는다.
로컬 API를 연결할 때는 `EXPO_PUBLIC_APP_MODE=local`로 설정한다.

| 실행 환경 | `EXPO_PUBLIC_API_BASE_URL` 예시 |
| --- | --- |
| iOS Simulator | `http://127.0.0.1:8000` |
| Android Emulator | `http://10.0.2.2:8000` |
| 실제 기기 | `http://<백엔드_PC의_LAN_IP>:8000` |
| 공유 개발 서버 | 팀에서 제공한 HTTPS 주소 |

실제 기기와 백엔드 PC는 같은 네트워크에 연결되어야 하며 OS 방화벽과 로컬 네트워크 권한을 확인한다. React Native 네이티브와 달리 Expo Web은 browser CORS 제약을 받으므로, 현재 백엔드에 CORS 정책을 추가하기 전에는 네이티브 데모를 기준으로 한다.

## 4. OpenAPI 타입 생성 원칙

- 요청·응답 DTO를 직접 중복 작성하지 않는다.
- 생성기 선정 후 `/openapi.json`에서 TypeScript 타입과 API client를 생성한다.
- 생성된 코드와 수작업 앱 코드를 별도 경로에 두고 생성된 파일을 직접 수정하지 않는다.
- 백엔드 `X-API-Version` 또는 `/ready` 결과가 예상 버전과 다르면 연동 테스트를 중단하고 타입을 재생성한다.

생성 도구와 출력 경로는 모바일 초기 구조를 확정할 때 `package.json` 명령으로 고정한다. 저장소에 스택과 의존성이 아직 없으므로 이 문서에서 특정 생성기를 강제하지 않는다.

## 5. 전체 API 흐름

| 순서 | API | 용도 | 필수 헤더·처리 |
| ---: | --- | --- | --- |
| 1 | `GET /v1/demo-scenarios` | 합성 데모 시나리오 3종 조회 | 별도 헤더 없음 |
| 2 | `POST /v1/analyses` | 시나리오·입력으로 분석 생성 | `Idempotency-Key` |
| 3 | `GET /v1/analyses/{analysis_id}` | 최신 또는 과거 revision 조회 | 응답 `ETag` 보관 |
| 4 | `GET /v1/analyses/{analysis_id}/alternatives` | 최대 3개 대안 상세 비교 | 응답 `ETag` 보관 |
| 5 | `GET /v1/analyses/{analysis_id}/evidence/{trace_id}` | 결과의 입력·규칙·출력 근거 조회 | 결과의 `trace_ids` 사용 |
| 6 | `PATCH /v1/analyses/{analysis_id}` | 사용자 입력 수정 후 새 revision 생성 | `If-Match: <최신 ETag>` |
| 7 | `POST /v1/analyses/{analysis_id}/recalculate` | 입력 변경 없이 재계산 | `Idempotency-Key`, `If-Match` |
| 8 | `DELETE /v1/analyses/{analysis_id}` | 분석과 민감한 하위 기록 영구 삭제 | `If-Match`, 성공 시 `204` |

합성 CSV를 직접 시연해야 하는 경우에만 `POST /v1/datasets`에 `multipart/form-data`의 `.csv` 파일을 보낸다. 현재 모바일 기본 데모는 내장 `scenario_id`를 사용하므로 CSV 업로드가 필수가 아니다.

## 6. 화면별 연결 권장

| 모바일 기능 | 연결 API | 필수 상태 |
| --- | --- | --- |
| 데모 시나리오 선택 | `GET /v1/demo-scenarios` | 선택한 `scenario_id`, `default_analysis` |
| 분석 입력·실행 | `POST /v1/analyses` | 생성한 `Idempotency-Key` |
| 요약 대시보드 | 생성 응답 또는 `GET /v1/analyses/{id}` | `analysis_id`, `revision`, `ETag` |
| 현금흐름·위험 결과 | `AnalysisResponse.result` | `cashflow`, `risks`, `limitations` |
| 안전 적립 결과 | `AnalysisResponse.result.safe_contribution` | `eligible`, 금액, 사유 코드, 유효월 |
| 대안 비교 | `GET /v1/analyses/{id}/alternatives` | 비교 결과와 대안별 `trace_ids` |
| 설명·근거 상세 | `GET /v1/analyses/{id}/evidence/{trace_id}` | 선택한 `trace_id` |
| 입력 수정·재계산 | `PATCH /v1/analyses/{id}`, `POST /v1/analyses/{id}/recalculate` | 호출 직전의 최신 `ETag` |
| 분석 삭제 | `DELETE /v1/analyses/{id}` | 최신 `ETag`, 로컬 상태 제거 |

`status=limited`는 오류가 아니다. 합성 데이터와 PoC 가정을 사용했다는 의미이며 `result`를 정상적으로 표시하고 `limitations`를 사용자에게 알린다.

## 7. `Idempotency-Key` 규칙

- 분석 생성과 재계산 요청마다 1~128자의 키를 만든다.
- 네트워크 재시도는 같은 요청 payload와 같은 키를 사용한다.
- 사용자가 새로 실행한 별개 분석에는 새 키를 사용한다.
- 같은 키에 다른 payload를 보내면 `409 IDEMPOTENCY_CONFLICT`가 발생한다.

키에는 개인정보를 넣지 말고 UUID 등 로컬에서 생성한 불투명 값을 사용한다.

## 8. `ETag` 보관과 동시성

1. 분석 생성·조회·대안·근거 응답의 `ETag`를 `analysis_id`와 함께 보관한다.
2. 수정·재계산·삭제 요청의 `If-Match`에 최신 값을 보낸다.
3. 새 revision 응답을 받으면 저장한 `ETag`를 즉시 교체한다.
4. `412 VERSION_CONFLICT`면 최신 분석을 다시 조회하고 사용자 입력을 재적용할지 확인한다.
5. `428 PRECONDITION_REQUIRED`면 `If-Match` 저장·전달 누락을 수정한다.

`ETag`는 JSON 본문이 아닌 HTTP 응답 헤더에 있으므로 API client가 본문과 헤더를 함께 반환하도록 설계한다.

## 9. 공통 오류 처리

오류 응답은 다음 구조를 사용한다. 세부 타입은 OpenAPI의 `ErrorEnvelope`을 사용한다.

```json
{
  "request_id": "req_example",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값을 확인해 주세요.",
    "field_errors": [
      {"path": "financial.current_cash_krw", "reason": "greater_than_equal"}
    ],
    "retryable": false
  }
}
```

| 상태 | 모바일 처리 |
| --- | --- |
| `400`, `422` | `field_errors` 경로를 해당 입력 UI와 연결하고 메시지 표시 |
| `404 ANALYSIS_NOT_FOUND` | 로컬 분석 참조를 정리하고 시작 화면으로 이동 |
| `409 IDEMPOTENCY_CONFLICT` | 재시도를 멈추고 새 사용자 작업인지 확인 |
| `412 VERSION_CONFLICT` | 최신 revision 재조회 후 사용자에게 충돌 알림 |
| `428 PRECONDITION_REQUIRED` | `If-Match` 헤더 누락으로 처리 |
| `5xx`, 네트워크 오류 | 중복 작업 방지를 위해 기존 `Idempotency-Key`로 제한된 재시도 |

오류 문의에는 응답의 `X-Request-ID`를 함께 전달하고 금액·원본 거래·가구 정보를 로그에 남기지 않는다.

## 10. 간단한 호출 예시

API 공통 함수는 본문과 헤더를 함께 반환해야 한다. 실제 구현에서는 생성된 OpenAPI 타입을 적용한다.

```ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly requestId: string | null,
    readonly body: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

export async function requestApi<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T; etag: string | null; requestId: string | null }> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is required");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const requestId = response.headers.get("X-Request-ID");
  if (!response.ok) {
    const error = await response.json();
    throw new ApiRequestError(response.status, requestId, error);
  }

  return {
    data: (await response.json()) as T,
    etag: response.headers.get("ETag"),
    requestId,
  };
}
```

`204 No Content`를 반환하는 삭제 API는 `response.json()`을 호출하지 않도록 별도 처리한다.

## 11. 연동 완료 체크리스트

- [ ] 기기에서 `/health`, `/ready`에 접속한다.
- [ ] OpenAPI `1.5.0`에서 TypeScript 타입을 생성한다.
- [ ] 합성 시나리오 3종을 목록에 표시한다.
- [ ] 중복 클릭·네트워크 재시도가 중복 분석을 만들지 않는다.
- [ ] 생성·조회 응답의 `ETag`를 보관하고 새 revision에서 갱신한다.
- [ ] 현금흐름·위험·적립·대안·근거 화면이 실제 API 결과를 표시한다.
- [ ] `limited`와 `limitations`를 오류가 아닌 PoC 안내로 표시한다.
- [ ] `422`, `409`, `412`, `428`, 네트워크 오류를 각각 확인한다.
- [ ] 삭제 성공 후 로컬 분석·`ETag`·cache를 제거한다.
- [ ] 로그·스크린샷·fixture에 실제 금융·가구 데이터가 없다.

## 12. 현재 PoC 제한

- 현재 API는 인증·인가, TLS, rate limit을 제공하지 않으므로 localhost 또는 격리된 데모 네트워크에서만 사용한다.
- 외부 LLM 설명은 기본 비활성화되어 있으며 모바일은 `explanation.source`와 `fallback_reason`을 그대로 표시할 수 있어야 한다.
- 분석 생성은 동시 50개 로컬 측정에서 p95 목표 2초를 넘었다. 모바일은 중복 호출을 방지하고 계산 중 UI를 표시해야 한다.
- 백엔드가 새 계산을 동기 응답하므로 현재 `calculating` polling 흐름을 기본 경로로 구현하지 않는다.
