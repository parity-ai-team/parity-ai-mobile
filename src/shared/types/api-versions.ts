// docs/integration.md "공통 계약": 모든 분석 응답에 data/rules/model/api 버전을 포함한다.
export interface ApiVersions {
  api: string;
  data: string;
  rules: string;
  model: string;
}
