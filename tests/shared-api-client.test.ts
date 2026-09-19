import { ApiError } from '@/shared/api/errors';
import { IDEMPOTENCY_KEY_HEADER, IF_MATCH_HEADER, REQUEST_ID_HEADER } from '@/shared/api/headers';
import { realApiRequest } from '@/shared/api/modes/realApiRequest';

// jest.mock 호출은 babel-plugin-jest-hoist가 파일 최상단으로 끌어올리므로
// import 아래에 있어도 실제 모듈 로딩보다 먼저 적용된다.
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => '00000000-0000-4000-8000-000000000000'),
}));

process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.test';

function mockFetchOnce(response: Response) {
  globalThis.fetch = jest.fn().mockResolvedValue(response) as unknown as typeof fetch;
}

describe('realApiRequest', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves the success envelope for a GET request without an idempotency key', async () => {
    const body = {
      request_id: 'req_1',
      analysis_id: 'ana_1',
      status: 'ready',
      revision: 1,
      versions: {
        api: '1.0',
        data: 'demo-2026-09',
        rules: 'kr-daegu-2026-09',
        model: 'cashflow-1.0.0',
      },
      result: {},
      limitations: [],
      generated_at: '2026-09-16T12:00:00+09:00',
    };
    mockFetchOnce(new Response(JSON.stringify(body), { status: 200 }));

    const { data } = await realApiRequest({ method: 'GET', path: '/v1/analyses/ana_1' });

    expect(data).toEqual(body);
    const [, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    const headers = init.headers as Headers;
    expect(headers.get(IDEMPOTENCY_KEY_HEADER)).toBeNull();
    expect(headers.get(REQUEST_ID_HEADER)).toBeNull();
  });

  it('auto-generates an idempotency key and request id for POST requests', async () => {
    mockFetchOnce(
      new Response(
        JSON.stringify({
          request_id: 'req_1',
          analysis_id: 'ana_1',
          status: 'calculating',
          revision: 1,
          versions: {
            api: '1.0',
            data: 'demo-2026-09',
            rules: 'kr-daegu-2026-09',
            model: 'cashflow-1.0.0',
          },
          result: {},
          limitations: [],
          generated_at: '2026-09-16T12:00:00+09:00',
        }),
        { status: 200 },
      ),
    );

    await realApiRequest({
      method: 'POST',
      path: '/v1/analyses',
      body: { scenario_id: 'first_birth' },
    });

    const [, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    const headers = init.headers as Headers;
    expect(headers.get(IDEMPOTENCY_KEY_HEADER)).toBe('00000000-0000-4000-8000-000000000000');
    expect(headers.get(REQUEST_ID_HEADER)).toBe('req_00000000-0000-4000-8000-000000000000');
  });

  it('sends the if-match header with the revision for PATCH requests', async () => {
    mockFetchOnce(
      new Response(
        JSON.stringify({
          request_id: 'req_1',
          analysis_id: 'ana_1',
          status: 'draft',
          revision: 2,
          versions: {
            api: '1.0',
            data: 'demo-2026-09',
            rules: 'kr-daegu-2026-09',
            model: 'cashflow-1.0.0',
          },
          result: {},
          limitations: [],
          generated_at: '2026-09-16T12:00:00+09:00',
        }),
        { status: 200 },
      ),
    );

    await realApiRequest({
      method: 'PATCH',
      path: '/v1/analyses/ana_1',
      ifMatchRevision: 1,
      body: {},
    });

    const [, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    const headers = init.headers as Headers;
    expect(headers.get(IF_MATCH_HEADER)).toBe('1');
    expect(headers.get(IDEMPOTENCY_KEY_HEADER)).toBeNull();
  });

  it('rejects a PATCH without ifMatchRevision before calling fetch (avoids a guaranteed 428)', async () => {
    const fetchSpy = jest.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    await expect(
      realApiRequest({ method: 'PATCH', path: '/v1/analyses/ana_1', body: {} }),
    ).rejects.toThrow(/If-Match/);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('resolves with no body for a 204 DELETE response', async () => {
    mockFetchOnce(new Response(null, { status: 204 }));

    const { data } = await realApiRequest({ method: 'DELETE', path: '/v1/analyses/ana_1' });

    expect(data).toBeUndefined();
  });

  // docs/decisions/api-contract-mismatch.md: revision 충돌은 412, 멱등성 키
  // 충돌은 409, If-Match 누락은 428 — 기존 계획(409 VERSION_CONFLICT)과 다르다.
  it('throws ApiError with the parsed error envelope on a 412 version conflict', async () => {
    const errorBody = {
      request_id: 'req_err',
      error: {
        code: 'VERSION_CONFLICT',
        message: '다른 변경이 반영되어 결과를 새로 불러왔어요.',
        retryable: true,
      },
    };
    mockFetchOnce(new Response(JSON.stringify(errorBody), { status: 412 }));

    await expect(
      realApiRequest({ method: 'GET', path: '/v1/analyses/ana_1' }),
    ).rejects.toMatchObject({
      status: 412,
      code: 'VERSION_CONFLICT',
      retryable: true,
    });
  });

  it('throws ApiError with the parsed error envelope on a 409 idempotency conflict', async () => {
    const errorBody = {
      request_id: 'req_err',
      error: {
        code: 'IDEMPOTENCY_CONFLICT',
        message: '같은 Idempotency-Key로 다른 요청 본문이 왔어요.',
        retryable: false,
      },
    };
    mockFetchOnce(new Response(JSON.stringify(errorBody), { status: 409 }));

    await expect(
      realApiRequest({ method: 'POST', path: '/v1/analyses', body: {} }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'IDEMPOTENCY_CONFLICT',
      retryable: false,
    });
  });

  it('throws ApiError with the parsed error envelope on a 428 precondition-required response', async () => {
    const errorBody = {
      request_id: 'req_err',
      error: {
        code: 'PRECONDITION_REQUIRED',
        message: 'If-Match 헤더가 필요해요.',
        retryable: false,
      },
    };
    mockFetchOnce(new Response(JSON.stringify(errorBody), { status: 428 }));

    await expect(
      realApiRequest({ method: 'DELETE', path: '/v1/analyses/ana_1', ifMatchRevision: 1 }),
    ).rejects.toMatchObject({
      status: 428,
      code: 'PRECONDITION_REQUIRED',
      retryable: false,
    });
  });

  it('is an instance of ApiError on failure', async () => {
    mockFetchOnce(
      new Response(
        JSON.stringify({
          request_id: 'req_err',
          error: { code: 'ANALYSIS_NOT_FOUND', message: '찾을 수 없어요.', retryable: false },
        }),
        { status: 404 },
      ),
    );

    await expect(
      realApiRequest({ method: 'GET', path: '/v1/analyses/missing' }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
