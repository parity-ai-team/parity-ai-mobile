import { apiRequest } from '@/shared/api/client';
import { getAppMode } from '@/shared/api/config';
import type { AnalysisResponse } from '@/shared/types';

// getAppMode()/apiRequest()는 인자를 생략하면 process.env.EXPO_PUBLIC_*를 읽는다.
// babel-preset-expo의 inline-env-vars 플러그인이 이 값을 빌드 시점에 리터럴로
// 치환하기 때문에, 테스트에서 process.env를 나중에 바꿔도 반영되지 않는다 —
// 그래서 여기서는 값을 인자로 직접 넘겨 순수 로직만 검증한다.
describe('getAppMode', () => {
  it('defaults to mock when no mode is given', () => {
    expect(getAppMode(undefined)).toBe('mock');
  });

  it.each(['mock', 'api', 'demo'] as const)('accepts "%s" as a declared mode', (mode) => {
    expect(getAppMode(mode)).toBe(mode);
  });

  it('throws on an unknown mode value', () => {
    expect(() => getAppMode('staging')).toThrow(/EXPO_PUBLIC_APP_MODE/);
  });
});

describe('apiRequest mode dispatch', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves through the mock implementation without calling fetch when mode=mock', async () => {
    const fetchSpy = jest.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const { data } = await apiRequest<AnalysisResponse>(
      { method: 'POST', path: '/v1/analyses', body: { scenario_id: 'first_birth_dual_income' } },
      'mock',
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(data.analysis_id).toBe('ana_mock_first_birth_dual_income');
  });

  it('calls fetch through the real implementation when mode=api', async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.test';
    const fetchSpy = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
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
        }),
        { status: 200 },
      ),
    );
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    await apiRequest({ method: 'GET', path: '/v1/analyses/ana_1' }, 'api');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
