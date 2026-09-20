import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  DEMO_SCENARIOS,
  useOnboardingSession,
  type DemoScenarioId,
  type ScenarioSelection,
} from '@/features/onboarding';
import type {
  AnalysisResponse,
  EmploymentPlanInput,
  FinancialInput,
  HouseholdInput,
  StressInput,
} from '@/shared/types';

export type FinancialInputOrigin = 'demo' | 'manual';

export interface FinancialInputDraft {
  household: Partial<HouseholdInput>;
  financial: Partial<FinancialInput>;
  plan: Partial<EmploymentPlanInput>;
  stress: Partial<StressInput>;
}

export interface FinancialInputSessionValue {
  /** 온보딩(S03)에서 데모를 골랐는지, 직접 입력을 골랐는지. */
  origin: FinancialInputOrigin;
  scenarioId: DemoScenarioId | null;
  /** S07 검토 화면이 "사용자 입력"/"가정값"을 구분하는 기준이 되는, 처음 채워진(또는 빈) 값. */
  defaults: FinancialInputDraft;
  /** 화면 간 이동에도 유지되는 현재 입력값. */
  draft: FinancialInputDraft;
  updateHousehold: (value: HouseholdInput) => void;
  updateFinancial: (value: FinancialInput) => void;
  updatePlan: (value: EmploymentPlanInput) => void;
  updateStress: (value: StressInput) => void;
  /** draft의 현재 값이 defaults와 같으면(=사용자가 바꾸지 않았으면) true. */
  isFieldAssumed: <TSection extends keyof FinancialInputDraft>(
    section: TSection,
    field: keyof FinancialInputDraft[TSection],
  ) => boolean;
  /** POST /v1/analyses 성공 응답. 세션 메모리에만 두고 영구 저장하지 않는다. */
  analysisResponse: AnalysisResponse | null;
  setAnalysisResponse: (response: AnalysisResponse | null) => void;
}

// 직접 입력은 서버 기본값까지 전부 비워 둔다. 0원·휴직 없음·미수령 가능성
// 없음도 사용자가 직접 확인한 뒤에만 draft에 저장한다.
function manualDefaults(): FinancialInputDraft {
  return {
    household: {},
    financial: {},
    plan: {},
    stress: {},
  };
}

// 값은 전부 JSON 안전한 원시값이라 구조적 공유 걱정 없이 깊은 복사할 수 있다.
// defaults(불변 스냅샷)와 draft(편집 중인 값)가 같은 객체를 참조하지 않게
// 한다.
function cloneDraft(draft: FinancialInputDraft): FinancialInputDraft {
  return JSON.parse(JSON.stringify(draft)) as FinancialInputDraft;
}

interface SessionState {
  origin: FinancialInputOrigin;
  scenarioId: DemoScenarioId | null;
  defaults: FinancialInputDraft;
  draft: FinancialInputDraft;
}

function buildSessionState(scenarioId: DemoScenarioId | null): SessionState {
  const scenario = scenarioId
    ? DEMO_SCENARIOS.find((item) => item.scenario_id === scenarioId)
    : undefined;

  if (!scenario) {
    const defaults = manualDefaults();
    return { origin: 'manual', scenarioId: null, defaults, draft: cloneDraft(defaults) };
  }

  const { household, financial, plan, stress } = scenario.default_analysis;
  const defaults: FinancialInputDraft = { household, financial, plan, stress: stress ?? {} };
  return {
    origin: 'demo',
    scenarioId: scenario.scenario_id,
    defaults,
    draft: cloneDraft(defaults),
  };
}

// scenarioSelection이 "같은 선택"인지 구분하는 키. FinancialInputSessionProvider가
// 앱 루트에서 한 번만 마운트되고 이후 라우트 이동에도 유지되므로(useState
// 지연 초기화는 마운트 시점 값만 본다), S03에서 선택이 바뀔 때마다 이 값이
// 달라져야 아래 useEffect가 defaults/draft를 다시 계산한다.
function selectionKey(selection: ScenarioSelection | null): string {
  if (!selection) return 'none';
  return selection.type === 'demo' ? `demo:${selection.scenarioId}` : 'manual';
}

const FinancialInputSessionContext = createContext<FinancialInputSessionValue | null>(null);

// S04~S07이 공유하는 입력 세션. docs/frontend.md "민감한 입력은 영구 로컬
// 저장하지 않는다"에 따라 메모리(useState)에만 두고, OnboardingSessionContext와
// 같은 이유로 이 규모(화면 네 개)에는 Zustand 없이 Context로 충분하다.
export function FinancialInputSessionProvider({ children }: { children: ReactNode }) {
  const { scenarioSelection } = useOnboardingSession();
  const initialScenarioId =
    scenarioSelection?.type === 'demo' ? (scenarioSelection.scenarioId as DemoScenarioId) : null;

  const [session, setSession] = useState<SessionState>(() => buildSessionState(initialScenarioId));
  const lastSelectionKey = useRef(selectionKey(scenarioSelection));
  const [analysisResponse, setAnalysisResponseState] = useState<AnalysisResponse | null>(null);

  // scenarioSelection은 S03에서 이 Provider가 이미 마운트된 뒤에 정해진다 —
  // 처음 렌더링 시점(S01)에는 항상 null이라, 선택이 실제로 바뀔 때 defaults/
  // draft를 다시 계산해야 한다.
  useEffect(() => {
    const key = selectionKey(scenarioSelection);
    if (key === lastSelectionKey.current) {
      return;
    }
    lastSelectionKey.current = key;
    const resolvedScenarioId =
      scenarioSelection?.type === 'demo' ? (scenarioSelection.scenarioId as DemoScenarioId) : null;
    setSession(buildSessionState(resolvedScenarioId));
  }, [scenarioSelection]);

  const updateHousehold = useCallback((value: HouseholdInput) => {
    setSession((prev) => ({ ...prev, draft: { ...prev.draft, household: value } }));
  }, []);
  const updateFinancial = useCallback((value: FinancialInput) => {
    setSession((prev) => ({ ...prev, draft: { ...prev.draft, financial: value } }));
  }, []);
  const updatePlan = useCallback((value: EmploymentPlanInput) => {
    setSession((prev) => ({ ...prev, draft: { ...prev.draft, plan: value } }));
  }, []);
  const updateStress = useCallback((value: StressInput) => {
    setSession((prev) => ({ ...prev, draft: { ...prev.draft, stress: value } }));
  }, []);

  const isFieldAssumed = useCallback(
    <TSection extends keyof FinancialInputDraft>(
      section: TSection,
      field: keyof FinancialInputDraft[TSection],
    ) => {
      const defaultValue = session.defaults[section][field];
      const draftValue = session.draft[section][field];
      return session.origin === 'demo' && defaultValue === draftValue;
    },
    [session.origin, session.defaults, session.draft],
  );

  const setAnalysisResponse = useCallback((response: AnalysisResponse | null) => {
    setAnalysisResponseState(response);
  }, []);

  const value = useMemo<FinancialInputSessionValue>(
    () => ({
      origin: session.origin,
      scenarioId: session.scenarioId,
      defaults: session.defaults,
      draft: session.draft,
      updateHousehold,
      updateFinancial,
      updatePlan,
      updateStress,
      isFieldAssumed,
      analysisResponse,
      setAnalysisResponse,
    }),
    [
      session,
      updateHousehold,
      updateFinancial,
      updatePlan,
      updateStress,
      isFieldAssumed,
      analysisResponse,
      setAnalysisResponse,
    ],
  );

  return (
    <FinancialInputSessionContext.Provider value={value}>
      {children}
    </FinancialInputSessionContext.Provider>
  );
}

export function useFinancialInputSession(): FinancialInputSessionValue {
  const value = useContext(FinancialInputSessionContext);
  if (!value) {
    throw new Error(
      'useFinancialInputSession은 FinancialInputSessionProvider 안에서만 사용할 수 있습니다.',
    );
  }
  return value;
}
