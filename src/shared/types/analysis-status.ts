// 공통 상태: docs/integration.md "공통 상태", docs/frontend.md "공통 상태·데이터 모델",
// docs/backend.md "분석 상태 전이"에서 동일하게 정의한다.
export type AnalysisStatus =
  | 'draft'
  | 'validating'
  | 'calculating'
  | 'ready'
  | 'needs_input'
  | 'limited'
  | 'failed'
  | 'deleted';
