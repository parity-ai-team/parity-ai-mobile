import type { AlternativeSummary } from './alternative-summary';
import type { CashFlowPoint } from './cashflow-point';
import type { RiskEvent } from './risk-event';
import type { SafeContribution } from './safe-contribution';

// TEMP: ready 응답 result의 최소 형태. docs/integration.md "ready 응답 핵심 구조" 기준.
export interface AnalysisResult {
  cashflow: CashFlowPoint[];
  risks: RiskEvent[];
  alternatives: AlternativeSummary[];
  safe_contribution: SafeContribution;
}
