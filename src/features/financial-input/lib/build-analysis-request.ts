import type { DemoScenarioId } from '@/features/onboarding';
import type {
  AnalysisCreateRequest,
  EmploymentPlanInput,
  FinancialInput,
  HouseholdInput,
  StressInput,
} from '@/shared/types';

import type { FinancialInputOrigin } from '../FinancialInputSessionContext';

export interface BuildAnalysisRequestInput {
  origin: FinancialInputOrigin;
  scenarioId: DemoScenarioId | null;
  datasetId: string | null;
  household: HouseholdInput;
  financial: FinancialInput;
  plan: EmploymentPlanInput;
  stress: StressInput;
}

// S04~S06에서 모은 값을 실제 계약(AnalysisCreateRequest)으로 그대로 옮긴다 —
// 화면에서 값을 다시 계산하거나 가공하지 않는다. 반환 타입 주석이 생성
// 타입과 어긋나면 여기서 컴파일 오류가 난다.
export function buildAnalysisCreateRequest(
  input: BuildAnalysisRequestInput,
): AnalysisCreateRequest {
  return {
    scenario_id: input.origin === 'demo' ? input.scenarioId : null,
    dataset_id: input.origin === 'manual' ? input.datasetId : null,
    household: input.household,
    financial: input.financial,
    plan: input.plan,
    stress: input.stress,
    data_mode: 'synthetic',
  };
}
