// mock 모드에서 요청을 가로채 fixture 응답을 반환하는 단일 진입점.
//
// docs/integration.md와 docs/backend-integration.md(신규 백엔드 연동 가이드)가
// 서로 다르게 정의한 엔드포인트 경로·상태 코드는 전부 이 파일에서만 분기하게
// 모아둔다 — 백엔드 담당자 확인 결과가 오면 이 파일의 매칭 규칙만 바꾸면 된다.
// 불일치 내역은 docs/decisions/api-contract-mismatch.md 참고.
//
// 지금은 docs/integration.md 경로 기준(POST /v1/analyses, GET /v1/analyses/{id})만
// 지원한다. demo-scenarios 목록은 두 문서 모두 응답 필드 예시가 없어서 이번
// PR에서는 mock하지 않는다. PATCH/recalculate/alternatives/evidence/delete도
// 아직 없다 — 필요해지면 이 파일에 handler를 추가한다.
import { ApiError } from '@/shared/api/errors';
import type { ResponseMeta } from '@/shared/api/headers';
import type { RequestOptions } from '@/shared/api/request';
import type { AnalysisResult, SuccessEnvelope } from '@/shared/types';

import { firstBirthFixture } from './scenarios/first-birth';
import { pastMeFixture } from './scenarios/past-me';
import { singleParentFixture, singleParentStressedFixture } from './scenarios/single-parent';

export interface MockResolution<TResult = unknown> {
  data: SuccessEnvelope<TResult>;
  meta: ResponseMeta;
}

interface CreateAnalysisRequestBody {
  scenario_id?: string;
  stress?: { income_delay_weeks?: number; child_support_missed?: boolean };
}

const ALL_FIXTURES = [
  firstBirthFixture,
  pastMeFixture,
  singleParentFixture,
  singleParentStressedFixture,
];

const FIXTURES_BY_ANALYSIS_ID = new Map(
  ALL_FIXTURES.map((fixture) => [fixture.analysis_id, fixture]),
);

// docs/integration.md 예시의 scenario_id 이름을 그대로 쓴다(first_birth_dual_income
// 은 문서 예시 원문, 나머지 둘은 docs/backend.md "라우팅 규칙"의 경로 이름을 따랐다).
function pickFixtureForCreate(
  body: CreateAnalysisRequestBody | undefined,
): SuccessEnvelope<AnalysisResult> | undefined {
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

function metaFor(envelope: SuccessEnvelope<unknown>): ResponseMeta {
  return {
    requestId: envelope.request_id,
    revision: String(envelope.revision),
    apiVersion: envelope.versions.api,
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
