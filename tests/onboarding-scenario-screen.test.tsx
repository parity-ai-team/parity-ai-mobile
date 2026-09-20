import { fireEvent, render, screen } from '@testing-library/react-native';

import { DEMO_SCENARIOS, OnboardingSessionProvider, ScenarioScreen } from '@/features/onboarding';

// getAppMode()는 기본적으로 실제 구현(process.env 없음 → 'mock')을 그대로
// 호출한다 — api 모드 전용 테스트에서만 한 번 'api'로 바꿔치기한다.
jest.mock('@/shared/api', () => {
  const actual = jest.requireActual('@/shared/api');
  return { ...actual, getAppMode: jest.fn(actual.getAppMode) };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getAppMode } = require('@/shared/api');

function renderScenarioScreen() {
  return render(
    <OnboardingSessionProvider>
      <ScenarioScreen />
    </OnboardingSessionProvider>,
  );
}

describe('ScenarioScreen', () => {
  it('데모 시나리오 카드 3개를 모두 보여준다', async () => {
    await renderScenarioScreen();

    for (const scenario of DEMO_SCENARIOS) {
      expect(screen.getByRole('radio', { name: scenario.title })).toBeTruthy();
    }
  });

  it('데모 카드를 선택하면 선택 상태로 표시된다', async () => {
    await renderScenarioScreen();
    const firstScenario = DEMO_SCENARIOS[0];
    const card = screen.getByRole('radio', { name: firstScenario.title });

    await fireEvent.press(card);

    expect(
      screen.getByRole('radio', { name: firstScenario.title }).props.accessibilityState.selected,
    ).toBe(true);
    expect(screen.getByText(`${firstScenario.title} · 선택됨`)).toBeTruthy();
  });

  it('직접 입력을 선택하면 데모 카드 선택이 해제된다', async () => {
    await renderScenarioScreen();
    const firstScenario = DEMO_SCENARIOS[0];

    await fireEvent.press(screen.getByRole('radio', { name: firstScenario.title }));
    await fireEvent.press(screen.getByRole('radio', { name: '직접 입력' }));

    expect(screen.getByRole('radio', { name: '직접 입력' }).props.accessibilityState.selected).toBe(
      true,
    );
    expect(
      screen.getByRole('radio', { name: firstScenario.title }).props.accessibilityState.selected,
    ).toBe(false);
  });
});

describe('ScenarioScreen — api 모드', () => {
  afterEach(() => {
    (getAppMode as jest.Mock).mockClear();
  });

  it('직접 입력 카드가 비활성 상태이고 CSV 업로드 안내 문구를 보여준다', async () => {
    (getAppMode as jest.Mock).mockReturnValueOnce('api');
    await renderScenarioScreen();

    const manualCard = screen.getByRole('radio', { name: '직접 입력' });
    expect(manualCard.props.accessibilityState.disabled).toBe(true);
    expect(screen.getByText('CSV 업로드가 필요해 준비 중이에요.')).toBeTruthy();
  });

  it('직접 입력 카드를 눌러도 선택 상태가 바뀌지 않는다', async () => {
    (getAppMode as jest.Mock).mockReturnValueOnce('api');
    await renderScenarioScreen();

    await fireEvent.press(screen.getByRole('radio', { name: '직접 입력' }));

    expect(
      screen.getByRole('radio', { name: '직접 입력' }).props.accessibilityState.selected,
    ).toBe(false);
  });
});
