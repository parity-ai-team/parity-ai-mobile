import { fireEvent, render, screen } from '@testing-library/react-native';
import { useEffect, type ReactNode } from 'react';

import { FinancialInputSessionProvider, HouseholdScreen } from '@/features/financial-input';
import { OnboardingSessionProvider, useOnboardingSession } from '@/features/onboarding';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { router } = require('expo-router');

function SelectFirstBirthOnMount({ children }: { children: ReactNode }) {
  const { selectScenario } = useOnboardingSession();
  useEffect(() => {
    selectScenario({ type: 'demo', scenarioId: 'first_birth_dual_income' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}

function renderManual() {
  return render(
    <OnboardingSessionProvider>
      <FinancialInputSessionProvider>
        <HouseholdScreen />
      </FinancialInputSessionProvider>
    </OnboardingSessionProvider>,
  );
}

function renderWithDemo() {
  return render(
    <OnboardingSessionProvider>
      <SelectFirstBirthOnMount>
        <FinancialInputSessionProvider>
          <HouseholdScreen />
        </FinancialInputSessionProvider>
      </SelectFirstBirthOnMount>
    </OnboardingSessionProvider>,
  );
}

describe('HouseholdScreen — 직접 입력', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('빈 폼으로 시작해 필수값을 채우지 않으면 다음으로 넘어가지 않는다', async () => {
    await renderManual();

    await fireEvent.press(screen.getByRole('button', { name: '다음' }));

    expect(await screen.findByText('오류: 예정월을 입력해 주세요.')).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('필수값을 모두 채우면 /financial로 이동한다', async () => {
    await renderManual();

    await fireEvent.changeText(screen.getByLabelText('출산 예정월'), '2027-06');
    await fireEvent.changeText(screen.getByLabelText('출산 순서'), '1');
    await fireEvent.press(screen.getByRole('radio', { name: '두 성인(맞벌이·외벌이)' }));
    await fireEvent.changeText(screen.getByLabelText('부양가족 수'), '0');
    await fireEvent.press(screen.getByRole('button', { name: '다음' }));

    expect(router.push).toHaveBeenCalledWith('/financial');
  });

  it('과거 출산 예정월이면 다음으로 넘어가지 않는다', async () => {
    await renderManual();

    await fireEvent.changeText(screen.getByLabelText('출산 예정월'), '2020-01');
    await fireEvent.changeText(screen.getByLabelText('출산 순서'), '1');
    await fireEvent.press(screen.getByRole('radio', { name: '두 성인(맞벌이·외벌이)' }));
    await fireEvent.changeText(screen.getByLabelText('부양가족 수'), '0');
    await fireEvent.press(screen.getByRole('button', { name: '다음' }));

    expect(
      await screen.findByText('오류: 출산 예정월은 이번 달 또는 이후로 입력해 주세요.'),
    ).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });
});

describe('HouseholdScreen — 데모 선택', () => {
  it('데모를 고르면 default_analysis 값으로 폼이 미리 채워진다', async () => {
    await renderWithDemo();

    expect(screen.getByLabelText('출산 예정월').props.value).toBe('2027-03');
    expect(screen.getByLabelText('출산 순서').props.value).toBe('1');
    expect(screen.getByLabelText('부양가족 수').props.value).toBe('0');
    expect(
      screen.getByRole('radio', { name: '두 성인(맞벌이·외벌이)' }).props.accessibilityState
        .selected,
    ).toBe(true);
  });
});
