import { fireEvent, render, screen } from '@testing-library/react-native';
import { useEffect, type ReactNode } from 'react';

import { ResultScreen } from '@/features/analysis';
import {
  FinancialInputSessionProvider,
  useFinancialInputSession,
} from '@/features/financial-input';
import { OnboardingSessionProvider } from '@/features/onboarding';
import type { AnalysisResponse } from '@/shared/types';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { router } = require('expo-router');

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
    result: {
      cashflow: [
        {
          period: '2027-01',
          confirmed_cash_krw: 5_000_000,
          p20_krw: 4_000_000,
          p50_krw: 5_000_000,
          p80_krw: 6_000_000,
          emergency_floor_krw: 3_000_000,
        },
        {
          period: '2027-02',
          confirmed_cash_krw: 1_000_000,
          p20_krw: 500_000,
          p50_krw: 1_000_000,
          p80_krw: 1_500_000,
          emergency_floor_krw: 3_000_000,
        },
      ],
      risks: [
        {
          period: '2027-02',
          severity: 'critical',
          cause_codes: ['BELOW_EMERGENCY_FLOOR'],
          expected_gap_krw: -2_000_000,
          probability: 0.8,
          confidence: 'medium',
          source: 'derived',
          trace_ids: ['trc_risk_1'],
        },
      ],
      safe_contribution: {
        eligible: false,
        monthly_amount_krw: 0,
        reason_codes: ['BELOW_EMERGENCY_FLOOR'],
        valid_until: '2027-03',
      },
    },
    limitations: ['SYNTHETIC_DATA'],
    input_hash: null,
    result_hash: null,
    random_seed: null,
    generated_at: null,
    ...overrides,
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

function renderResultScreen(response: AnalysisResponse | null) {
  return render(
    <OnboardingSessionProvider>
      <FinancialInputSessionProvider>
        <SetAnalysisResponseOnMount response={response}>
          <ResultScreen />
        </SetAnalysisResponseOnMount>
      </FinancialInputSessionProvider>
    </OnboardingSessionProvider>,
  );
}

describe('ResultScreen — 상태별 표시', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ready면 차트·위험 카드·안전 적립 카드를 보여준다', async () => {
    await renderResultScreen(buildAnalysisResponse({ status: 'ready' }));

    expect(screen.getByTestId('result-chart')).toBeTruthy();
    expect(screen.getByTestId('result-risk-2027-02')).toBeTruthy();
    expect(screen.getByTestId('result-safe-contribution')).toBeTruthy();
  });

  it('limited여도 결과를 오류로 취급하지 않고 그대로 보여준다', async () => {
    await renderResultScreen(
      buildAnalysisResponse({
        status: 'limited',
        limitations: ['SYNTHETIC_DATA', 'ASSUMED_INPUT'],
      }),
    );

    expect(screen.getByTestId('result-chart')).toBeTruthy();
    expect(screen.getByTestId('result-risk-2027-02')).toBeTruthy();
  });

  it('needs_input처럼 결과를 쓸 수 없는 상태면 결과 대신 안내를 보여준다', async () => {
    await renderResultScreen(buildAnalysisResponse({ status: 'needs_input' }));

    expect(screen.queryByTestId('result-chart')).toBeNull();
    expect(screen.getByText(/아직 결과를 보여드릴 수 없어요/)).toBeTruthy();
  });

  it('위험월이 없으면 위험 카드 대신 안내 문구를 보여준다', async () => {
    const response = buildAnalysisResponse();
    response.result!.risks = [];

    await renderResultScreen(response);

    expect(screen.getByText('현재 가정에서 뚜렷한 위험월이 없어요.')).toBeTruthy();
    expect(screen.queryByTestId('result-risk-2027-02')).toBeNull();
  });

  it('세션에 분석 응답이 없으면 검토 화면으로 돌아가는 안내를 보여준다', async () => {
    await renderResultScreen(null);

    expect(screen.getByText('결과를 찾을 수 없어요')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: '검토 화면으로' }));
    expect(router.push).toHaveBeenCalledWith('/review');
  });
});

describe('ResultScreen — limitations 문구 매핑', () => {
  it('SYNTHETIC_DATA·ASSUMED_INPUT을 한국어 안내 문구로 보여준다', async () => {
    await renderResultScreen(
      buildAnalysisResponse({ limitations: ['SYNTHETIC_DATA', 'ASSUMED_INPUT'] }),
    );

    expect(screen.getByText('지금 보시는 수치는 실제 데이터가 아닌 합성 데이터예요.')).toBeTruthy();
    expect(
      screen.getByText('일부 입력값은 직접 채운 값이 아니라 서버가 가정한 값이에요.'),
    ).toBeTruthy();
  });
});

describe('ResultScreen — 차트·카드 선택 동기화', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('차트에서 위험월을 누르면 해당 카드가 선택 표시된다', async () => {
    await renderResultScreen(buildAnalysisResponse());

    await fireEvent.press(screen.getByTestId('result-chart-select-2027-02'));

    const card = screen.getByTestId('result-risk-2027-02');
    expect(card.props.accessibilityState.selected).toBe(true);
    expect(screen.getByText('2027-02 · 선택됨')).toBeTruthy();
  });

  it('카드를 누르면 차트 선택도 함께 바뀐다', async () => {
    await renderResultScreen(buildAnalysisResponse());

    await fireEvent.press(screen.getByTestId('result-risk-2027-02'));

    const chartContainer = screen.getByTestId('result-chart-svg-container');
    expect(chartContainer.props.accessibilityLabel).toContain('선택한 달: 2027-02');
  });
});

describe('ResultScreen — 근거·화면 이동', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('근거 보기를 누르면 trace id를 담아 근거 자리표시 화면으로 이동한다', async () => {
    await renderResultScreen(buildAnalysisResponse());

    await fireEvent.press(screen.getByRole('button', { name: '근거 보기' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/evidence/[traceId]',
      params: { traceId: 'trc_risk_1' },
    });
  });

  it('입력 수정을 누르면 /plan으로 이동한다', async () => {
    await renderResultScreen(buildAnalysisResponse());

    await fireEvent.press(screen.getByRole('button', { name: '입력 수정' }));

    expect(router.push).toHaveBeenCalledWith('/plan');
  });

  it('대안 비교를 누르면 /alternatives 자리표시로 이동한다', async () => {
    await renderResultScreen(buildAnalysisResponse());

    await fireEvent.press(screen.getByRole('button', { name: '대안 비교' }));

    expect(router.push).toHaveBeenCalledWith('/alternatives');
  });

  it('안전 적립을 누르면 /asset-start로 이동한다', async () => {
    await renderResultScreen(buildAnalysisResponse());

    await fireEvent.press(screen.getByRole('button', { name: '안전 적립' }));

    expect(router.push).toHaveBeenCalledWith('/asset-start');
  });
});
