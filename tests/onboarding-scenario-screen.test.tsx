import { fireEvent, render, screen } from '@testing-library/react-native';

import { DEMO_SCENARIOS, OnboardingSessionProvider, ScenarioScreen } from '@/features/onboarding';

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
