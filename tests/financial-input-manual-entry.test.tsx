import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import {
  FinancialInputSessionProvider,
  FinancialScreen,
  PlanScreen,
} from '@/features/financial-input';
import { OnboardingSessionProvider } from '@/features/onboarding';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { router } = require('expo-router');

function renderManualScreen(screenElement: ReactElement) {
  return render(
    <OnboardingSessionProvider>
      <FinancialInputSessionProvider>{screenElement}</FinancialInputSessionProvider>
    </OnboardingSessionProvider>,
  );
}

describe('직접 입력 — 숨은 가정값 방지', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('금융 정보는 비상금과 선택 지출까지 입력해야 진행한다', async () => {
    await renderManualScreen(<FinancialScreen />);

    await fireEvent.press(screen.getByRole('button', { name: '다음' }));

    expect(
      await screen.findByText('오류: 꼭 남겨둘 비상금을 입력해 주세요. 없으면 0을 입력해요.'),
    ).toBeTruthy();
    expect(
      screen.getByText('오류: 월 선택 지출을 입력해 주세요. 없으면 0을 입력해요.'),
    ).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('계획 화면은 휴직 여부·소득 지연·양육비 가능성을 직접 확인해야 진행한다', async () => {
    await renderManualScreen(<PlanScreen />);

    await fireEvent.press(screen.getByRole('button', { name: '다음' }));

    expect(await screen.findByText('오류: 휴직 계획 여부를 선택해 주세요.')).toBeTruthy();
    expect(
      screen.getByText('오류: 예상 소득 지연 주 수를 입력해 주세요. 없으면 0을 입력해요.'),
    ).toBeTruthy();
    expect(screen.getByText('오류: 양육비 미수령 가능성을 선택해 주세요.')).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('휴직 없음과 0주를 직접 입력하면 검토로 이동한다', async () => {
    await renderManualScreen(<PlanScreen />);

    const noOptions = screen.getAllByRole('radio', { name: '아니오' });
    await fireEvent.press(noOptions[0]);
    await fireEvent.changeText(screen.getByLabelText('예상 소득 지연 주 수'), '0');
    await fireEvent.press(noOptions[1]);
    await fireEvent.press(screen.getByRole('button', { name: '다음' }));

    expect(router.push).toHaveBeenCalledWith('/review');
  });
});
