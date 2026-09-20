import type { ConfidenceLevel, DataSource } from '@/shared/types';

export const CONFIDENCE_LEVEL_LABEL: Record<ConfidenceLevel, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

// "assumed(가정값)"과 "user_confirmed(사용자 확인)"는 의미가 정반대라
// 절대 헷갈리면 안 된다 — 라벨 문구를 최대한 멀게 두고(하나는 확정,
// 하나는 추정이라는 게 바로 드러나게), 색도 성공/경고로 반대쪽에 둔다
// (ConfidenceTag.styles.ts 참고).
export const DATA_SOURCE_LABEL: Record<DataSource, string> = {
  user_confirmed: '사용자 확인',
  synthetic: '합성 데이터',
  policy_rule: '정책 규칙',
  derived: '계산값',
  assumed: '가정값(미확인)',
  public_data: '공공 데이터',
};
