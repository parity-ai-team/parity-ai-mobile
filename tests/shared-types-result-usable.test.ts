import { isResultUsable } from '@/shared/types';
import type { AnalysisStatus } from '@/shared/types';

// docs/backend-integration.md "5. 화면별 연결 권장": status=limited는 오류가
// 아니라 result를 정상 표시하는 상태다. docs/decisions/result-usable-status.md
// 참고.
describe('isResultUsable', () => {
  it.each<AnalysisStatus>(['ready', 'limited'])('treats "%s" as usable', (status) => {
    expect(isResultUsable(status)).toBe(true);
  });

  it.each<AnalysisStatus>(['draft', 'validating', 'calculating', 'needs_input', 'failed', 'deleted'])(
    'treats "%s" as not usable',
    (status) => {
      expect(isResultUsable(status)).toBe(false);
    },
  );
});
