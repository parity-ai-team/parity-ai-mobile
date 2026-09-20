// backend.d.ts는 `npm run generate:api-types`(docs/api/openapi-1.7.0.json 기준)로
// 재생성하는 파일이라 커밋하지 않는다(.gitignore 참고). 이 파일만 손으로
// 관리하며, 생성된 스키마를 의미 있는 이름으로 다시 내보낸다 — 나머지
// src/shared/types 아래 코드는 backend.d.ts를 직접 import하지 않고 이 파일을
// 거친다.
import type { components } from './backend';

type Schemas = components['schemas'];

export type ActionBurden = Schemas['ActionBurden'];
export type AlternativeActionDetail = Schemas['AlternativeActionDetail'];
export type AlternativeActionType = Schemas['AlternativeActionType'];
export type AlternativeComparisonResponse = Schemas['AlternativeComparisonResponse'];
export type AlternativeDetail = Schemas['AlternativeDetail'];
export type AlternativeKind = Schemas['AlternativeKind'];
export type AlternativeOutcome = Schemas['AlternativeOutcome'];
export type AlternativePreferencesInput = Schemas['AlternativePreferencesInput'];
export type AlternativePreferencesUpdate = Schemas['AlternativePreferencesUpdate'];
export type AlternativeSummary = Schemas['AlternativeSummary'];
export type AnalysisCreateRequest = Schemas['AnalysisCreateRequest'];
export type AnalysisResponse = Schemas['AnalysisResponse'];
export type AnalysisResult = Schemas['AnalysisResult'];
export type AnalysisStatus = Schemas['AnalysisStatus'];
export type AnalysisUpdateRequest = Schemas['AnalysisUpdateRequest'];
export type CashflowPoint = Schemas['CashflowPoint'];
export type CauseCode = Schemas['CauseCode'];
export type ConfidenceLevel = Schemas['ConfidenceLevel'];
export type ContractVersions = Schemas['ContractVersions'];
export type DataMode = Schemas['DataMode'];
export type DataSource = Schemas['DataSource'];
export type ClassificationConfirmation = Schemas['ClassificationConfirmation'];
export type ClassificationConfirmationRequest = Schemas['ClassificationConfirmationRequest'];
export type ClassificationReviewItem = Schemas['ClassificationReviewItem'];
export type DatasetClassificationSummary = Schemas['DatasetClassificationSummary'];
export type DatasetCreateResponse = Schemas['DatasetCreateResponse'];
export type DatasetIntelligence = Schemas['DatasetIntelligence'];
export type DatasetIntelligenceResponse = Schemas['DatasetIntelligenceResponse'];
export type DatasetStatus = Schemas['DatasetStatus'];
export type DemoScenarioListResponse = Schemas['DemoScenarioListResponse'];
export type DemoScenarioSummary = Schemas['DemoScenarioSummary'];
export type EmploymentPlanInput = Schemas['EmploymentPlanInput'];
export type EmploymentPlanUpdate = Schemas['EmploymentPlanUpdate'];
export type ErrorCode = Schemas['ErrorCode'];
export type ErrorDetail = Schemas['ErrorDetail'];
export type ErrorEnvelope = Schemas['ErrorEnvelope'];
export type EvidenceExplanation = Schemas['EvidenceExplanation'];
export type EvidenceInputFact = Schemas['EvidenceInputFact'];
export type EvidenceOutputFact = Schemas['EvidenceOutputFact'];
export type EvidenceResponse = Schemas['EvidenceResponse'];
export type EvidenceResultType = Schemas['EvidenceResultType'];
export type EvidenceRuleFact = Schemas['EvidenceRuleFact'];
export type EvidenceTrace = Schemas['EvidenceTrace'];
export type ExplanationFallbackReason = Schemas['ExplanationFallbackReason'];
export type ExplanationSource = Schemas['ExplanationSource'];
export type FieldError = Schemas['FieldError'];
export type FinancialInput = Schemas['FinancialInput'];
export type FinancialUpdate = Schemas['FinancialUpdate'];
export type HouseholdInput = Schemas['HouseholdInput'];
export type HouseholdType = Schemas['HouseholdType'];
export type HouseholdUpdate = Schemas['HouseholdUpdate'];
export type HTTPValidationError = Schemas['HTTPValidationError'];
export type LimitationCode = Schemas['LimitationCode'];
export type RiskItem = Schemas['RiskItem'];
export type RiskSeverity = Schemas['RiskSeverity'];
export type RecurringPattern = Schemas['RecurringPattern'];
export type SafeContributionResult = Schemas['SafeContributionResult'];
export type ScenarioCoverage = Schemas['ScenarioCoverage'];
export type ScenarioRoute = Schemas['ScenarioRoute'];
export type StressInput = Schemas['StressInput'];
export type StressUpdate = Schemas['StressUpdate'];
export type TransactionCategory = Schemas['TransactionCategory'];
export type ValidationError = Schemas['ValidationError'];
