import { fireEvent, render, screen } from '@testing-library/react-native';

import { ConsentScreen, OnboardingSessionProvider } from '@/features/onboarding';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

function renderConsentScreen() {
  return render(
    <OnboardingSessionProvider>
      <ConsentScreen />
    </OnboardingSessionProvider>,
  );
}

describe('ConsentScreen', () => {
  it('세 항목 중 일부만 동의하면 다음 버튼이 비활성 상태다', async () => {
    await renderConsentScreen();

    await fireEvent.press(screen.getByRole('checkbox', { name: '금융 정보 동의' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: '출산 일정 동의' }));

    const next = screen.getByRole('button', { name: '다음' });
    expect(next.props.accessibilityState.disabled).toBe(true);
  });

  it('세 항목 모두 동의하면 다음 버튼이 활성 상태다', async () => {
    await renderConsentScreen();

    await fireEvent.press(screen.getByRole('checkbox', { name: '금융 정보 동의' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: '출산 일정 동의' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: '가구 구조 동의' }));

    const next = screen.getByRole('button', { name: '다음' });
    expect(next.props.accessibilityState.disabled).toBe(false);
  });

  it('동의를 다시 해제하면 다음 버튼이 비활성 상태로 돌아간다', async () => {
    await renderConsentScreen();

    const financialCheckbox = screen.getByRole('checkbox', { name: '금융 정보 동의' });
    await fireEvent.press(financialCheckbox);
    await fireEvent.press(screen.getByRole('checkbox', { name: '출산 일정 동의' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: '가구 구조 동의' }));
    expect(screen.getByRole('button', { name: '다음' }).props.accessibilityState.disabled).toBe(
      false,
    );

    await fireEvent.press(financialCheckbox);

    expect(screen.getByRole('button', { name: '다음' }).props.accessibilityState.disabled).toBe(
      true,
    );
  });
});
