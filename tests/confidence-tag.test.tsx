import { render, screen } from '@testing-library/react-native';

import { ConfidenceTag, DATA_SOURCE_LABEL } from '@/shared/ui/ConfidenceTag';
import type { DataSource } from '@/shared/types';

const ALL_SOURCES: DataSource[] = [
  'user_confirmed',
  'synthetic',
  'policy_rule',
  'derived',
  'assumed',
  'public_data',
];

describe('ConfidenceTag — level', () => {
  it.each([
    ['high', '높음'],
    ['medium', '보통'],
    ['low', '낮음'],
  ] as const)('level=%s는 "%s"로 표시된다', async (level, label) => {
    await render(<ConfidenceTag level={level} source="derived" />);

    expect(screen.getByText(`신뢰도 ${label}`)).toBeTruthy();
  });
});

describe('ConfidenceTag — source', () => {
  it.each(ALL_SOURCES)('source=%s는 고유한 라벨로 표시된다', async (source) => {
    await render(<ConfidenceTag level="medium" source={source} />);

    expect(screen.getByText(DATA_SOURCE_LABEL[source])).toBeTruthy();
  });

  it('모든 source 라벨은 서로 전부 다르다', () => {
    const labels = ALL_SOURCES.map((source) => DATA_SOURCE_LABEL[source]);
    expect(new Set(labels).size).toBe(ALL_SOURCES.length);
  });

  it('user_confirmed와 assumed는 뜻이 반대라는 게 라벨에서 바로 드러난다', async () => {
    await render(<ConfidenceTag level="medium" source="user_confirmed" />);
    expect(screen.getByText('사용자 확인')).toBeTruthy();
  });

  it('assumed는 "가정값(미확인)"으로 user_confirmed와 명확히 구분된다', async () => {
    await render(<ConfidenceTag level="medium" source="assumed" />);
    expect(screen.getByText('가정값(미확인)')).toBeTruthy();
  });

  it('user_confirmed는 성공(초록) 배경, assumed는 경고(주황) 배경을 쓴다', async () => {
    await render(<ConfidenceTag level="medium" source="user_confirmed" testID="confirmed" />);
    const confirmedChip = screen.getByTestId('confirmed-source');
    const confirmedBg = [confirmedChip.props.style]
      .flat()
      .find((entry) => entry?.backgroundColor)?.backgroundColor;

    expect(confirmedBg).toBeTruthy();
  });

  it('level 없이 source만 넘기면 출처 칩만 보여준다(S12 근거 화면의 EvidenceInputFact)', async () => {
    await render(<ConfidenceTag source="policy_rule" testID="source-only" />);

    expect(screen.queryByTestId('source-only-level')).toBeNull();
    expect(screen.getByTestId('source-only-source')).toBeTruthy();
    expect(screen.getByText(DATA_SOURCE_LABEL.policy_rule)).toBeTruthy();
  });

  it('renders assumed with a distinct background from user_confirmed', async () => {
    await render(<ConfidenceTag level="medium" source="assumed" testID="assumed" />);
    const assumedChip = screen.getByTestId('assumed-source');
    const assumedBg = [assumedChip.props.style].flat().find((entry) => entry?.backgroundColor)
      ?.backgroundColor;

    await render(<ConfidenceTag level="medium" source="user_confirmed" testID="confirmed" />);
    const confirmedChip = screen.getByTestId('confirmed-source');
    const confirmedBg = [confirmedChip.props.style]
      .flat()
      .find((entry) => entry?.backgroundColor)?.backgroundColor;

    expect(assumedBg).toBeTruthy();
    expect(confirmedBg).toBeTruthy();
    expect(assumedBg).not.toBe(confirmedBg);
  });
});
