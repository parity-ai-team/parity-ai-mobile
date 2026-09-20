import {
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

    expect(headers.get(REQUEST_ID_HEADER)).toBeNull();
    expect(headers.get(IDEMPOTENCY_KEY_HEADER)).toBeNull();
    expect(headers.get(IF_MATCH_HEADER)).toBeNull();
  });

  it('attaches the request id and idempotency key', () => {
    const headers = buildRequestHeaders({
      requestId: 'req_abc',
      idempotencyKey: 'idem_abc',
    });

    expect(headers.get(REQUEST_ID_HEADER)).toBe('req_abc');
    expect(headers.get(IDEMPOTENCY_KEY_HEADER)).toBe('idem_abc');
  });

  it('omits content-type when multipart boundary must be added by the runtime', () => {
    const headers = buildRequestHeaders({ contentType: null });

    expect(headers.get('Content-Type')).toBeNull();
  });

  // 백엔드는 인증이 없다(2026-09-20 백엔드 팀 확인) — RequestHeaderOptions에
  // authToken 같은 옵션 자체가 없으니, 무엇을 넘겨도 Authorization은 절대
  // 안 실린다는 걸 남아있는 모든 옵션으로 다시 확인한다.
  it('never sets an Authorization header, no matter what options are given', () => {
    const headers = buildRequestHeaders({
      requestId: 'req_abc',
      idempotencyKey: 'idem_abc',
      ifMatch: 'W/"ana_abc:1"',
    });

    expect(headers.get('Authorization')).toBeNull();
  });

  // 서버 ETag는 W/"ana_xxx:1" 형태의 약한 ETag일 수 있고, If-Match에는 그
  // 문자열을 가공 없이 그대로 넣어야 한다(2026-09-20 실서버로 확인) —
  // revision 숫자만 뽑아 재구성하면 서버가 거부한다.
  it('sends the ifMatch value to If-Match verbatim, including a weak ETag prefix', () => {
    const headers = buildRequestHeaders({ ifMatch: 'W/"ana_01JABCDEF:3"' });

    expect(headers.get(IF_MATCH_HEADER)).toBe('W/"ana_01JABCDEF:3"');
  });
});

describe('readResponseMeta', () => {
  it('reads request id, the raw ETag string, and api version from response headers', () => {
    const response = new Response(null, {
      headers: {
        [REQUEST_ID_HEADER]: 'req_xyz',
        ETag: 'W/"ana_xyz:5"',
        'X-API-Version': '1.7.0',
      },
    });

    expect(readResponseMeta(response)).toEqual({
      requestId: 'req_xyz',
      revision: 'W/"ana_xyz:5"',
      apiVersion: '1.7.0',
    });
  });
});
