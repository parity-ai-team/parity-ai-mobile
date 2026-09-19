import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { DemoScenarioId } from './scenarios';

export interface OnboardingConsent {
  financialInfo: boolean;
  birthSchedule: boolean;
  householdStructure: boolean;
}

export type ScenarioSelection = { type: 'manual' } | { type: 'demo'; scenarioId: DemoScenarioId };

export interface OnboardingSessionValue {
  consent: OnboardingConsent;
  setConsent: (key: keyof OnboardingConsent, granted: boolean) => void;
  allConsentsGranted: boolean;
  scenarioSelection: ScenarioSelection | null;
  selectScenario: (selection: ScenarioSelection) => void;
}

const INITIAL_CONSENT: OnboardingConsent = {
  financialInfo: false,
  birthSchedule: false,
  householdStructure: false,
};

const OnboardingSessionContext = createContext<OnboardingSessionValue | null>(null);

// 동의 상태와 선택한 시나리오는 세션(메모리)에만 둔다. docs/frontend.md
// "민감한 입력은 영구 로컬 저장하지 않는다"에 따라 AsyncStorage 등에는 쓰지
// 않는다 — 앱을 새로 시작하면 사라지는 게 의도된 동작이다. 이 화면 세 개
// 사이에서만 공유하면 되는 값이라 Zustand 없이 Context로 충분하다.
export function OnboardingSessionProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<OnboardingConsent>(INITIAL_CONSENT);
  const [scenarioSelection, setScenarioSelection] = useState<ScenarioSelection | null>(null);

  const setConsent = useCallback((key: keyof OnboardingConsent, granted: boolean) => {
    setConsentState((prev) => ({ ...prev, [key]: granted }));
  }, []);

  const selectScenario = useCallback((selection: ScenarioSelection) => {
    setScenarioSelection(selection);
  }, []);

  const allConsentsGranted =
    consent.financialInfo && consent.birthSchedule && consent.householdStructure;

  const value = useMemo<OnboardingSessionValue>(
    () => ({ consent, setConsent, allConsentsGranted, scenarioSelection, selectScenario }),
    [consent, setConsent, allConsentsGranted, scenarioSelection, selectScenario],
  );

  return (
    <OnboardingSessionContext.Provider value={value}>{children}</OnboardingSessionContext.Provider>
  );
}

export function useOnboardingSession(): OnboardingSessionValue {
  const value = useContext(OnboardingSessionContext);
  if (!value) {
    throw new Error(
      'useOnboardingSession은 OnboardingSessionProvider 안에서만 사용할 수 있습니다.',
    );
  }
  return value;
}
