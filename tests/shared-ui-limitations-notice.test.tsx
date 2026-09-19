import { render, screen } from '@testing-library/react-native';

import { getLimitationLabel, LimitationsNotice, LIMITATION_LABEL } from '@/shared/ui';
import type { LimitationCode } from '@/shared/types';

// 생성 타입(LimitationCode)의 유니온을 손으로도 나열해, 새 코드가 추가되면
// LIMITATION_LABEL이 Record<LimitationCode, string>이라 소스가 먼저 깨지고,
// 이 목록도 맞춰 둬서 라벨 내용 자체를 런타임으로 한 번 더 확인한다.
const ALL_LIMITATION_CODES: LimitationCode[] = [
  'SYNTHETIC_DATA',
  'ASSUMED_INPUT',
  'INSUFFICIENT_HISTORY',
  'LOW_CLASSIFICATION_CONFIDENCE',
];

describe('LIMITATION_LABEL — 전체 LimitationCode 커버', () => {
  it.each(ALL_LIMITATION_CODES)('%s는 코드 원문이 아닌 한국어 안내 문구로 매핑된다', (code) => {
    expect(LIMITATION_LABEL[code]).toBeTruthy();
    expect(LIMITATION_LABEL[code]).not.toBe(code);
  });

  it('알 수 없는 코드는 깨지지 않고 원문 그대로 보여준다', () => {
    expect(getLimitationLabel('SOME_FUTURE_LIMITATION')).toBe('SOME_FUTURE_LIMITATION');
  });
});

describe('LimitationsNotice', () => {
  it('여러 limitations를 각각 한국어 문구로 보여준다', async () => {
    await render(<LimitationsNotice limitations={['SYNTHETIC_DATA', 'ASSUMED_INPUT']} />);

    expect(screen.getByText(LIMITATION_LABEL.SYNTHETIC_DATA)).toBeTruthy();
    expect(screen.getByText(LIMITATION_LABEL.ASSUMED_INPUT)).toBeTruthy();
  });

  it('limitations가 비어 있으면 아무것도 렌더링하지 않는다', async () => {
    await render(<LimitationsNotice limitations={[]} testID="limitations" />);

    expect(screen.queryByTestId('limitations')).toBeNull();
  });
});
