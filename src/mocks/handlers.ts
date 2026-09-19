// mock 모드에서 요청을 가로채 fixture 응답을 반환하는 단일 진입점.
//
// docs/decisions/api-contract-mismatch.md에서 확정한 대로 docs/backend-integration.md
// (OpenAPI 1.5.0)만 기준으로 삼는다. 지금 지원하는 것은 POST /v1/analyses,
// GET /v1/analyses/{id}, GET /v1/analyses/{id}/alternatives 세 가지다.
// PATCH/recalculate/evidence/DELETE mock은 아직 없다 — 필요해지면 이 파일에
// handler를 추가한다.
import { ApiError } from '@/shared/api/errors';
import type { ResponseMeta } from '@/shared/api/headers';
import type { RequestOptions } from '@/shared/api/request';
import type { AlternativeComparisonResponse, StressInput } from '@/shared/types';

import { firstBirthAlternativesFixture, firstBirthFixture } from './scenarios/first-birth';
import { pastMeAlternativesFixture, pastMeFixture } from './scenarios/past-me';
import type { MockAnalysisResponse } from './scenarios/shared';
import {
  singleParentAlternativesFixture,
  singleParentFixture,
  singleParentStressedAlternativesFixture,
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

// docs/api/openapi-1.5.0.json AnalysisCreateRequest.scenario_id 예시의 이름을
// 그대로 쓴다.
function pickFixtureForCreate(
  body: CreateAnalysisRequestBody | undefined,
): MockAnalysisResponse | undefined {
  switch (body?.scenario_id) {
    case 'first_birth_dual_income':
      return firstBirthFixture;
    case 'past_me_transition':
      return pastMeFixture;
    case 'single_parent_stress': {
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
