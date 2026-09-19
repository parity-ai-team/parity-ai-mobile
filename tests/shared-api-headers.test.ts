import {
  AUTHORIZATION_HEADER,
  buildRequestHeaders,
  generateIdempotencyKey,
  generateRequestId,
  IDEMPOTENCY_KEY_HEADER,
  IF_MATCH_HEADER,
  readResponseMeta,
  REQUEST_ID_HEADER,
} from '@/shared/api/headers';

// jest.mock 호출은 babel-plugin-jest-hoist가 파일 최상단으로 끌어올리므로
// import 아래에 있어도 실제 모듈 로딩보다 먼저 적용된다.
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => '00000000-0000-4000-8000-000000000000'),
}));

describe('generateRequestId', () => {
  it('prefixes generated request ids with req_', () => {
    expect(generateRequestId()).toBe('req_00000000-0000-4000-8000-000000000000');
  });
});

describe('generateIdempotencyKey', () => {
  it('returns a bare uuid without a prefix', () => {
    expect(generateIdempotencyKey()).toBe('00000000-0000-4000-8000-000000000000');
  });
});

describe('buildRequestHeaders', () => {
  it('sets no optional headers by default', () => {
    const headers = buildRequestHeaders();

    expect(headers.get(AUTHORIZATION_HEADER)).toBeNull();
    expect(headers.get(REQUEST_ID_HEADER)).toBeNull();
    expect(headers.get(IDEMPOTENCY_KEY_HEADER)).toBeNull();
    expect(headers.get(IF_MATCH_HEADER)).toBeNull();
  });

  it('attaches the bearer token, request id, idempotency key, and if-match revision', () => {
    const headers = buildRequestHeaders({
      authToken: 'demo-token',
      requestId: 'req_abc',
      idempotencyKey: 'idem_abc',
      ifMatchRevision: 3,
    });

    expect(headers.get(AUTHORIZATION_HEADER)).toBe('Bearer demo-token');
    expect(headers.get(REQUEST_ID_HEADER)).toBe('req_abc');
    expect(headers.get(IDEMPOTENCY_KEY_HEADER)).toBe('idem_abc');
    expect(headers.get(IF_MATCH_HEADER)).toBe('3');
  });
});

describe('readResponseMeta', () => {
  it('reads request id, revision (ETag), and api version from response headers', () => {
    const response = new Response(null, {
      headers: {
        [REQUEST_ID_HEADER]: 'req_xyz',
        ETag: '5',
        'X-API-Version': '1.0',
      },
    });

    expect(readResponseMeta(response)).toEqual({
      requestId: 'req_xyz',
      revision: '5',
      apiVersion: '1.0',
    });
  });
});
