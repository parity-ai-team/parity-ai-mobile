import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactElement } from 'react';

import ConsentScreenRoute from '@/app/consent';
import StartScreenRoute from '@/app/index';
import ScenarioScreenRoute from '@/app/scenario';
import { OnboardingSessionProvider } from '@/features/onboarding';

// expo-router의 실제 네비게이션 컨테이너 없이도 각 화면이 어느 경로로
// 이동을 시도하는지 검증하기 위해 router.push를 스파이로 바꾼다.
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

function renderScreen(element: ReactElement) {
  return render(<OnboardingSessionProvider>{element}</OnboardingSessionProvider>);
}

async function agreeToAllConsents() {
  await fireEvent.press(screen.getByRole('checkbox', { name: '금융 정보 동의' }));
  await fireEvent.press(screen.getByRole('checkbox', { name: '출산 일정 동의' }));
  await fireEvent.press(screen.getByRole('checkbox', { name: '가구 구조 동의' }));
}

describe('온보딩 라우팅 (S01 → S02 → S03 → S04)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('S01 "시작" 버튼은 /consent로 이동한다', async () => {
    await renderScreen(<StartScreenRoute />);

    await fireEvent.press(screen.getByRole('button', { name: '시작' }));

    expect(router.push).toHaveBeenCalledWith('/consent');
  });

  it('S01 "데모로 보기" 버튼도 /consent로 이동한다', async () => {
    await renderScreen(<StartScreenRoute />);

    await fireEvent.press(screen.getByRole('button', { name: '데모로 보기' }));

    expect(router.push).toHaveBeenCalledWith('/consent');
  });

  it('S02는 동의를 모두 마쳐야 /scenario로 이동한다', async () => {
    await renderScreen(<ConsentScreenRoute />);

    await fireEvent.press(screen.getByRole('button', { name: '다음' }));
    expect(router.push).not.toHaveBeenCalled();

    await agreeToAllConsents();
    await fireEvent.press(screen.getByRole('button', { name: '다음' }));

    expect(router.push).toHaveBeenCalledWith('/scenario');
  });

  it('S03은 시나리오 카드를 3개 보여준다(직접 입력 제외)', async () => {
    await renderScreen(<ScenarioScreenRoute />);

    expect(screen.getByText('초산 · 맞벌이')).toBeTruthy();
    expect(screen.getByText('경산 · 외벌이 전환')).toBeTruthy();
    expect(screen.getByText('경산 · 한부모')).toBeTruthy();
  });

  it('S03은 선택 전에는 다음 버튼이 비활성 상태다', async () => {
    await renderScreen(<ScenarioScreenRoute />);

    expect(screen.getByRole('button', { name: '다음' }).props.accessibilityState.disabled).toBe(
      true,
    );
  });

  it('S03에서 데모를 고르고 다음을 누르면 /household로 이동한다', async () => {
    await renderScreen(<ScenarioScreenRoute />);

    await fireEvent.press(screen.getByRole('radio', { name: '초산 · 맞벌이' }));
    await fireEvent.press(screen.getByRole('button', { name: '다음' }));

    expect(router.push).toHaveBeenCalledWith('/household');
  });

  it('S03에서 직접 입력을 고르고 다음을 누르면 /household로 이동한다', async () => {
    await renderScreen(<ScenarioScreenRoute />);

    await fireEvent.press(screen.getByRole('radio', { name: '직접 입력' }));
    await fireEvent.press(screen.getByRole('button', { name: '다음' }));

    expect(router.push).toHaveBeenCalledWith('/household');
  });
});
