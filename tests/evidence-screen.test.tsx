import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useEffect, type ReactNode } from 'react';

import { EvidenceScreen } from '@/features/analysis';
import {
  FinancialInputSessionProvider,
  useFinancialInputSession,
} from '@/features/financial-input';
import { OnboardingSessionProvider } from '@/features/onboarding';
import type { AnalysisResponse, EvidenceResponse } from '@/shared/types';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ traceId: 'trc_test' }),
}));

jest.mock('@/shared/api', () => {
  const actual = jest.requireActual('@/shared/api');
  return { ...actual, apiRequest: jest.fn() };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { router } = require('expo-router');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { apiRequest, ApiError } = require('@/shared/api');

function buildAnalysisResponse(overrides: Partial<AnalysisResponse> = {}): AnalysisResponse {
  return {
    request_id: 'req_test',
    analysis_id: 'ana_test',
    status: 'ready',
    revision: 1,
    versions: {
      api: '1.5.0',
      data: 'synthetic-1.0.0',
      rules: 'kr-daegu-2026-09',
      model: 'cashflow-1.4.0',
    },
    result: null,
    limitations: [],
    input_hash: null,
    result_hash: null,
    random_seed: null,
    generated_at: null,
    ...overrides,
  };
}

function buildEvidenceResponse(): EvidenceResponse {
  return {
    request_id: 'req_test_evidence',
    analysis_id: 'ana_test',
    revision: 1,
    evidence: {
      trace_id: 'trc_test',
      result_type: 'risk',
      result_ref: 'risk:2027-04',
      inputs: [{ name: 'cause_code_1', value: 'INCOME_DROP', source: 'derived' }],
      rules: [
        {
          rule_id: 'rule_cashflow_risk_detection',
          version: 'kr-daegu-2026-09',
          description: '월별 가용 현금이 비상금 기준 아래로 내려가는지 판정하는 규칙',
        },
      ],
      outputs: [{ name: 'expected_gap_krw', value: '-650000', unit: '원' }],
      explanation: {
        text: '2027-04월은 INCOME_DROP 요인이 겹쳐요.',
        source: 'template',
        fallback_reason: null,
      },
    },
    generated_at: '2026-09-19T14:58:11.201007Z',
  };
}

function SetAnalysisResponseOnMount({
  response,
  children,
}: {
  response: AnalysisResponse | null;
  children: ReactNode;
}) {
  const { setAnalysisResponse } = useFinancialInputSession();
  useEffect(() => {
    setAnalysisResponse(response);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}

function renderEvidenceScreen(response: AnalysisResponse | null) {
  return render(
    <OnboardingSessionProvider>
      <FinancialInputSessionProvider>
        <SetAnalysisResponseOnMount response={response}>
          <EvidenceScreen />
        </SetAnalysisResponseOnMount>
      </FinancialInputSessionProvider>
    </OnboardingSessionProvider>,
  );
}

describe('EvidenceScreen — 정상 표시', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('입력·규칙·산출·설명을 보여준다', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      data: buildEvidenceResponse(),
      meta: { requestId: 'req', revision: '1', apiVersion: null },
    });

    await renderEvidenceScreen(buildAnalysisResponse());

    await waitFor(() => expect(screen.getByTestId('evidence-screen')).toBeTruthy());
    expect(screen.getByText('왜 이런 결과가 나왔나요?')).toBeTruthy();
    expect(screen.getByText('부족이 예상되는 이유 1')).toBeTruthy();
    expect(screen.getByText('소득 감소')).toBeTruthy();
    expect(
      screen.getByText('매달 남는 돈이 꼭 지켜야 할 비상금보다 적어지는지 확인했어요.'),
    ).toBeTruthy();
    expect(screen.getByText('-650,000원')).toBeTruthy();
    expect(screen.getByText('2027-04월은 소득 감소 요인이 겹쳐요.')).toBeTruthy();
    expect(screen.getByText('계산 결과 안내')).toBeTruthy();
    expect(screen.queryByText(/trc_test/)).toBeNull();
    expect(screen.queryByText('cause_code_1')).toBeNull();
    expect(screen.queryByText('INCOME_DROP')).toBeNull();
    expect(screen.queryByRole('button', { name: '결과 화면으로' })).toBeNull();
    expect(screen.getAllByRole('button', { name: '원래 화면으로 돌아가기' })).toHaveLength(1);
  });

  it('하단의 단일 복귀 버튼은 진입 직전 화면으로 돌아간다', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      data: buildEvidenceResponse(),
      meta: { requestId: 'req', revision: '1', apiVersion: null },
    });

    await renderEvidenceScreen(buildAnalysisResponse());
    await waitFor(() => expect(screen.getByTestId('evidence-screen')).toBeTruthy());

    await fireEvent.press(screen.getByRole('button', { name: '원래 화면으로 돌아가기' }));

    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('입력값의 출처를 보존해서 보여준다', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      data: buildEvidenceResponse(),
      meta: { requestId: 'req', revision: '1', apiVersion: null },
    });

    await renderEvidenceScreen(buildAnalysisResponse());

    await waitFor(() => expect(screen.getByTestId('evidence-screen')).toBeTruthy());
    const inputRow = screen.getByTestId('evidence-input-cause_code_1');
    expect(inputRow).toBeTruthy();
    expect(screen.getByText('계산값')).toBeTruthy();
  });
});

describe('EvidenceScreen — 오류 처리', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('세션에 분석 응답이 없으면 검토 화면 안내를 보여준다', async () => {
    await renderEvidenceScreen(null);

    expect(screen.getByText('세션이 만료됐어요. 검토 화면에서 다시 시작해 주세요.')).toBeTruthy();
    expect(apiRequest).not.toHaveBeenCalled();
  });

  // 2026-09-20 백엔드 팀 확인: 무료 플랜은 재시작되면 analysis_id가
  // 사라질 수 있다 — "뒤로 가기"는 소용없으니 시작으로 보낸다.
  it('ANALYSIS_NOT_FOUND면 시작으로 돌아가는 안내를 보여준다', async () => {
    (apiRequest as jest.Mock).mockRejectedValue(
      new ApiError(
        {
          request_id: 'req_err',
          error: { code: 'ANALYSIS_NOT_FOUND', message: '존재하지 않습니다.', retryable: false },
        },
        404,
      ),
    );

    await renderEvidenceScreen(buildAnalysisResponse());

    await waitFor(() =>
      expect(screen.getByText('분석을 찾을 수 없어요. 다시 시작해 주세요.')).toBeTruthy(),
    );
    await fireEvent.press(screen.getByRole('button', { name: '시작으로' }));
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('다른 404 오류는 근거 전용 안내 문구와 뒤로 가기를 보여준다', async () => {
    (apiRequest as jest.Mock).mockRejectedValue(
      new ApiError(
        {
          request_id: 'req_err',
          error: { code: 'INVALID_REQUEST', message: '잘못된 요청이에요.', retryable: false },
        },
        404,
      ),
    );

    await renderEvidenceScreen(buildAnalysisResponse());

    await waitFor(() => expect(screen.getByText('요청한 근거를 찾을 수 없어요.')).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(router.back).toHaveBeenCalled();
  });

  it('그 외 오류는 일반 안내 문구를 보여준다', async () => {
    (apiRequest as jest.Mock).mockRejectedValue(new Error('network down'));

    await renderEvidenceScreen(buildAnalysisResponse());

    await waitFor(() =>
      expect(
        screen.getByText('근거를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'),
      ).toBeTruthy(),
    );
  });
});
