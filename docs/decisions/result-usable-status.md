# 결정 기록: `limited` 상태에서도 결과·대안·안전 적립 화면을 쓴다

- 상태: 확정
- 작성일: 2026-09-20
- 확정일: 2026-09-20
- 관련 PR: `feat/api-contract-alignment`(본 PR)

## 배경

`docs/frontend.md`는 "ready에서만 대안 활성화"라고 적었다. 이 문구만 보면
`AnalysisStatus`가 `ready`일 때만 결과·대안·안전 적립 화면을 켜야 하는 것처럼
읽힌다.

그런데 실제 계약 기준 문서인 `docs/backend-integration.md` "5. 화면별 연결
권장"은 다음과 같이 못 박는다.

> `status=limited`는 오류가 아니다. 합성 데이터와 PoC 가정을 사용했다는
> 의미이며 `result`를 정상적으로 표시하고 `limitations`를 사용자에게
> 알린다.

`docs/api/openapi-1.5.0.json`의 `AnalysisResult`도 `limited` 상태를 별도
취급하지 않는다 — `status`와 무관하게 `result`가 채워져 있으면 그대로 쓸 수
있는 구조다. 실제로 `docs/api/analysis-response-example.json` 예시 응답도
`status: "limited"`이면서 `cashflow`·`risks`·`alternatives`·`safe_contribution`을
전부 채워서 내려준다.

## 확정 결과

- `docs/frontend.md`의 "ready에서만 대안 활성화"는 `docs/backend-integration.md`
  기준으로 재해석해 "`result`가 채워지는 상태(`ready`, `limited`)에서만
  활성화"로 좁힌다. `draft`/`validating`/`calculating`/`needs_input`/`failed`/`deleted`는
  여전히 비활성화 대상이다.
- 이 판별을 화면마다 상태 목록을 직접 비교하지 않도록
  `src/shared/types/result-usable.ts`의 `isResultUsable(status)` 헬퍼로
  통일한다. 결과·대안·안전 적립 화면은 이 헬퍼로만 활성화 여부를 판단한다.
- `limited`로 렌더링할 때는 `limitations` 배열(`SYNTHETIC_DATA`,
  `INSUFFICIENT_HISTORY` 등)을 오류가 아닌 PoC 안내 문구로 사용자에게
  보여준다. 이 표시 UI 자체는 이번 PR 범위가 아니다 — 헬퍼와 근거만 마련한다.

## 후속 조치

- [ ] 결과·대안·안전 적립 화면을 구현하는 PR에서 `isResultUsable()`을 실제로
      사용하고, `limited`일 때 `limitations` 안내 UI를 추가한다.
