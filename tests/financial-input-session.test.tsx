import { fireEvent, render, screen } from '@testing-library/react-native';
import { useEffect, type ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

import {
  FinancialInputSessionProvider,
  useFinancialInputSession,
} from '@/features/financial-input';
import { OnboardingSessionProvider, useOnboardingSession } from '@/features/onboarding';
import type { DemoScenarioId } from '@/features/onboarding';
import type { HouseholdInput } from '@/shared/types';

// S03에서 데모를 고르고 나서(FinancialInputSessionProvider가 이미 마운트된
// 뒤) 화면이 넘어가는 실제 흐름을 흉내 낸다.
function SelectDemoOnMount({
  scenarioId,
  children,
}: {
  scenarioId: DemoScenarioId;
  children: ReactNode;
}) {
  const { selectScenario } = useOnboardingSession();
  useEffect(() => {
    selectScenario({ type: 'demo', scenarioId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}

function SessionProbe() {
  const { origin, scenarioId, draft, isFieldAssumed, updateHousehold } = useFinancialInputSession();
  const household = draft.household as HouseholdInput;

  return (
    <>
      <Text testID="origin">{origin}</Text>
      <Text testID="scenario-id">{scenarioId ?? 'none'}</Text>
      <Text testID="expected-month">{String(draft.household.expected_month)}</Text>
      <Text testID="emergency-floor">{String(draft.financial.emergency_floor_krw)}</Text>
      <Text testID="dependents-assumed">{String(isFieldAssumed('household', 'dependents'))}</Text>
      <Pressable
        testID="edit-dependents"
        onPress={() => updateHousehold({ ...household, dependents: 9 })}
      />
    </>
  );
}

describe('FinancialInputSessionProvider — 직접 입력', () => {
  it('데모를 고르지 않으면 origin은 manual이고 필수 입력은 비어 있다', async () => {
    await render(
      <OnboardingSessionProvider>
        <FinancialInputSessionProvider>
          <SessionProbe />
        </FinancialInputSessionProvider>
      </OnboardingSessionProvider>,
    );

    expect(screen.getByTestId('origin').props.children).toBe('manual');
    expect(screen.getByTestId('scenario-id').props.children).toBe('none');
    expect(screen.getByTestId('expected-month').props.children).toBe('undefined');
    expect(screen.getByTestId('emergency-floor').props.children).toBe('undefined');
    expect(screen.getByTestId('dependents-assumed').props.children).toBe('false');
  });
});

describe('FinancialInputSessionProvider — 데모 선택', () => {
  it('데모를 고르면 default_analysis 값으로 draft가 채워진다', async () => {
    await render(
      <OnboardingSessionProvider>
        <SelectDemoOnMount scenarioId="first_birth_dual_income">
          <FinancialInputSessionProvider>
            <SessionProbe />
          </FinancialInputSessionProvider>
        </SelectDemoOnMount>
      </OnboardingSessionProvider>,
    );

    expect(screen.getByTestId('origin').props.children).toBe('demo');
    expect(screen.getByTestId('scenario-id').props.children).toBe('first_birth_dual_income');
    expect(screen.getByTestId('expected-month').props.children).toBe('2027-03');
  });

  it('사용자가 값을 바꾸기 전에는 가정값(assumed)으로 표시된다', async () => {
    await render(
      <OnboardingSessionProvider>
        <SelectDemoOnMount scenarioId="first_birth_dual_income">
          <FinancialInputSessionProvider>
            <SessionProbe />
          </FinancialInputSessionProvider>
        </SelectDemoOnMount>
      </OnboardingSessionProvider>,
    );

    expect(screen.getByTestId('dependents-assumed').props.children).toBe('true');
  });

  it('사용자가 값을 바꾸면 더 이상 가정값이 아니다', async () => {
    await render(
      <OnboardingSessionProvider>
        <SelectDemoOnMount scenarioId="first_birth_dual_income">
          <FinancialInputSessionProvider>
            <SessionProbe />
          </FinancialInputSessionProvider>
        </SelectDemoOnMount>
      </OnboardingSessionProvider>,
    );

    await fireEvent.press(screen.getByTestId('edit-dependents'));

    expect(screen.getByTestId('dependents-assumed').props.children).toBe('false');
  });
});
