// mock 모드에서 요청을 가로채 fixture 응답을 반환하는 단일 진입점.
//
// docs/decisions/api-contract-mismatch.md에서 확정한 대로 docs/backend-integration.md
// (OpenAPI 1.5.0)만 기준으로 삼는다. 지금 지원하는 것은 POST /v1/analyses,
// GET /v1/analyses/{id}, GET /v1/analyses/{id}/alternatives, GET
// /v1/analyses/{id}/evidence/{trace_id} 네 가지다. PATCH/recalculate/DELETE
// mock은 아직 없다 — 필요해지면 이 파일에 handler를 추가한다.
import { ApiError } from '@/shared/api/errors';
import type { ResponseMeta } from '@/shared/api/headers';
import type { RequestOptions } from '@/shared/api/request';
import type { AlternativeComparisonResponse, EvidenceResponse, StressInput } from '@/shared/types';

import {
  firstBirthAlternativesFixture,
  firstBirthEvidenceFixtures,
  firstBirthFixture,
} from './scenarios/first-birth';
import { pastMeAlternativesFixture, pastMeEvidenceFixtures, pastMeFixture } from './scenarios/past-me';
import type { MockAnalysisResponse } from './scenarios/shared';
import {
  singleParentAlternativesFixture,
  singleParentEvidenceFixtures,
  singleParentFixture,
  singleParentStressedAlternativesFixture,
  singleParentStressedEvidenceFixtures,
  singleParentStressedFixture,
} from './scenarios/single-parent';

export interface MockResolution<TResult = unknown> {
  data: TResult;
  meta: ResponseMeta;
}

interface CreateAnalysisRequestBody {
  scenario_id?: string;
  stress?: Partial<StressInput>;
}

const ALL_FIXTURES = [firstBirthFixture, pastMeFixture, singleParentFixture, singleParentStressedFixture];

const FIXTURES_BY_ANALYSIS_ID = new Map(
  ALL_FIXTURES.map((fixture) => [fixture.analysis_id, fixture]),
);

const ALL_ALTERNATIVES_FIXTURES = [
  firstBirthAlternativesFixture,
  pastMeAlternativesFixture,
  singleParentAlternativesFixture,
  singleParentStressedAlternativesFixture,
];

const ALTERNATIVES_FIXTURES_BY_ANALYSIS_ID = new Map(
  ALL_ALTERNATIVES_FIXTURES.map((fixture) => [fixture.analysis_id, fixture]),
);

// analysis_id·trace_id 쌍으로 찾는다 — 다른 시나리오의 trace_id를 잘못된
// analysis_id와 섞어 조회하면 404가 나야 하기 때문에 trace_id만으로는 찾지
// 않는다.
const ALL_EVIDENCE_FIXTURES_BY_ANALYSIS_ID: [string, Record<string, EvidenceResponse>][] = [
  [firstBirthFixture.analysis_id, firstBirthEvidenceFixtures],
  [pastMeFixture.analysis_id, pastMeEvidenceFixtures],
  [singleParentFixture.analysis_id, singleParentEvidenceFixtures],
  [singleParentStressedFixture.analysis_id, singleParentStressedEvidenceFixtures],
];

const EVIDENCE_FIXTURES_BY_KEY = new Map<string, EvidenceResponse>();
for (const [analysisId, entries] of ALL_EVIDENCE_FIXTURES_BY_ANALYSIS_ID) {
  for (const [traceId, response] of Object.entries(entries)) {
    EVIDENCE_FIXTURES_BY_KEY.set(`${analysisId}:${traceId}`, response);
  }
}

// 실제 백엔드(GET /v1/demo-scenarios, 2026-09-20 실서버 확인)가 쓰는
// scenario_id 문자열 그대로다 — docs/api/openapi-1.5.0.json 예시에 있던
// past_me_transition·single_parent_stress는 실서버 값과 달라서 맞췄다.
function pickFixtureForCreate(
  body: CreateAnalysisRequestBody | undefined,
): MockAnalysisResponse | undefined {
  switch (body?.scenario_id) {
    case 'first_birth_dual_income':
      return firstBirthFixture;
    case 'second_birth_single_income':
      return pastMeFixture;
    case 'second_birth_single_parent_irregular_income': {
      const isStressed =
        Boolean(body?.stress?.income_delay_weeks) || Boolean(body?.stress?.child_support_missed);
      return isStressed ? singleParentStressedFixture : singleParentFixture;
    }
    default:
      return undefined;
  }
}

function metaFor(envelope: { request_id: string; revision: number; versions: { api: string } }): ResponseMeta {
  return {
    requestId: envelope.request_id,
    revision: String(envelope.revision),
    apiVersion: envelope.versions.api,
  };
}

function alternativesMetaFor(response: AlternativeComparisonResponse): ResponseMeta {
  return {
    requestId: response.request_id,
    revision: String(response.revision),
    apiVersion: null,
  };
}

function unknownScenarioError(scenarioId: string | undefined): ApiError {
  return new ApiError(
    {
      request_id: 'req_mock_unknown_scenario',
      error: {
        code: 'VALIDATION_ERROR',
        message: 'mock에 등록되지 않은 scenario_id입니다.',
        field_errors: [
          { path: 'scenario_id', reason: `unknown_scenario: ${scenarioId ?? '(none)'}` },
        ],
        retryable: false,
      },
    },
    422,
  );
}

function analysisNotFoundError(): ApiError {
  return new ApiError(
    {
      request_id: 'req_mock_not_found',
      error: {
        code: 'ANALYSIS_NOT_FOUND',
        message: '존재하지 않는 분석입니다.',
        retryable: false,
      },
    },
    404,
  );
}

function evidenceNotFoundError(): ApiError {
  return new ApiError(
    {
      request_id: 'req_mock_evidence_not_found',
      error: {
        code: 'ANALYSIS_NOT_FOUND',
        message: '존재하지 않는 분석 또는 근거입니다.',
        retryable: false,
      },
    },
    404,
  );
}

function evidenceMetaFor(response: EvidenceResponse): ResponseMeta {
  return {
    requestId: response.request_id,
    revision: String(response.revision),
    apiVersion: null,
  };
}

// GET /v1/analyses/{id}/evidence/{traceId} 매칭용. ALTERNATIVES_PATH_PATTERN·
// ANALYSIS_PATH_PATTERN보다 먼저 검사한다(둘 다 [^/]+ 하나만 허용해 이 경로와
// 겹치지 않지만, 순서를 명확히 해 둔다).
const EVIDENCE_PATH_PATTERN = /^\/v1\/analyses\/([^/]+)\/evidence\/([^/]+)$/;
// GET /v1/analyses/{id}/alternatives 매칭용. 먼저 검사하므로 아래
// ANALYSIS_PATH_PATTERN([^/]+ 하나만 허용)과 겹치지 않는다.
const ALTERNATIVES_PATH_PATTERN = /^\/v1\/analyses\/([^/]+)\/alternatives$/;
// GET /v1/analyses/{id} 매칭용.
const ANALYSIS_PATH_PATTERN = /^\/v1\/analyses\/([^/]+)$/;

// 매칭되는 handler가 없으면 undefined를 반환한다(호출부에서 "mock handler
// 없음" 개발 오류로 처리). 시뮬레이션된 API 오류(존재하지 않는 시나리오/분석
// 등)는 ApiError를 그대로 던진다 — realApiRequest가 던지는 것과 같은 타입이라
// apiRequest() 호출부는 모드와 무관하게 동일한 catch 로직을 쓸 수 있다.
export function resolveMockResponse(options: RequestOptions): MockResolution | undefined {
  const { method, path } = options;

  if (method === 'POST' && path === '/v1/analyses') {
    const body = options.body as CreateAnalysisRequestBody | undefined;
    const fixture = pickFixtureForCreate(body);
    if (!fixture) {
      throw unknownScenarioError(body?.scenario_id);
    }
    return { data: fixture, meta: metaFor(fixture) };
  }

  if (method === 'GET') {
    const evidenceMatch = path.match(EVIDENCE_PATH_PATTERN);
    if (evidenceMatch) {
      const [, analysisId, traceId] = evidenceMatch;
      const fixture = EVIDENCE_FIXTURES_BY_KEY.get(`${analysisId}:${traceId}`);
      if (!fixture) {
        throw evidenceNotFoundError();
      }
      return { data: fixture, meta: evidenceMetaFor(fixture) };
    }

    const alternativesMatch = path.match(ALTERNATIVES_PATH_PATTERN);
    if (alternativesMatch) {
      const fixture = ALTERNATIVES_FIXTURES_BY_ANALYSIS_ID.get(alternativesMatch[1]);
      if (!fixture) {
        throw analysisNotFoundError();
      }
      return { data: fixture, meta: alternativesMetaFor(fixture) };
    }

    const analysisMatch = path.match(ANALYSIS_PATH_PATTERN);
    if (analysisMatch) {
      const fixture = FIXTURES_BY_ANALYSIS_ID.get(analysisMatch[1]);
      if (!fixture) {
        throw analysisNotFoundError();
      }
      return { data: fixture, meta: metaFor(fixture) };
    }
  }

  return undefined;
}
