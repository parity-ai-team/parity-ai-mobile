import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { useEffect, type ReactNode } from 'react';

import { AlternativesScreen } from '@/features/alternatives';
import {
  FinancialInputSessionProvider,
  useFinancialInputSession,
} from '@/features/financial-input';
import { OnboardingSessionProvider } from '@/features/onboarding';
import type { AlternativeComparisonResponse, AnalysisResponse } from '@/shared/types';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@/shared/api', () => {
  const actual = jest.requireActual('@/shared/api');
  return { ...actual, apiRequest: jest.fn() };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { router } = require('expo-router');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { apiRequest } = require('@/shared/api');

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
      cashflow: [],
      risks: [],
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

function buildComparison(
  overrides: Partial<AlternativeComparisonResponse> = {},
): AlternativeComparisonResponse {
  return {
    request_id: 'req_test_alternatives',
    analysis_id: 'ana_test',
    revision: 1,
    current_state: {
      minimum_cash_krw: 6_000_000,
      closing_cash_krw: 7_000_000,
      floor_breach_days: 0,
    },
    alternatives: [
      {
        alternative_id: 'alt_worse',
        kind: 'liquidity_protection',
        immediate_cash_change_krw: 500_000,
        future_cost_krw: 0,
        recovery_period_months: 1,
        action_burden: 'medium',
        trace_ids: ['trc_alt_worse'],
        actions: [
          {
            action_type: 'reduce_discretionary',
            amount_krw: 500_000,
            affected_event_ids: ['discretionary:2027-04'],
            affected_periods: ['2027-04'],
            shift_days: 0,
            shift_months: 0,
          },
        ],
        outcome: {
          minimum_cash_krw: 5_000_000,
          closing_cash_krw: 6_000_000,
          floor_breach_days: 3,
        },
      },
      {
        alternative_id: 'alt_better',
        kind: 'minimum_change',
        immediate_cash_change_krw: 0,
        future_cost_krw: 0,
        recovery_period_months: 0,
        action_burden: 'low',
        trace_ids: ['trc_alt_better'],
        actions: [],
        outcome: {
          minimum_cash_krw: 6_500_000,
          closing_cash_krw: 7_500_000,
          floor_breach_days: 0,
        },
      },
    ],
    model_version: 'cashflow-1.4.0',
    generated_at: '2026-09-19T14:58:11.201007Z',
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

function renderAlternativesScreen(response: AnalysisResponse | null) {
  return render(
    <OnboardingSessionProvider>
      <FinancialInputSessionProvider>
        <SetAnalysisResponseOnMount response={response}>
          <AlternativesScreen />
        </SetAnalysisResponseOnMount>
      </FinancialInputSessionProvider>
    </OnboardingSessionProvider>,
  );
}

describe('AlternativesScreen — 진입 가능 여부', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('세션에 분석 응답이 없으면 대안을 불러오지 않고 안내를 보여준다', async () => {
    await renderAlternativesScreen(null);

    expect(screen.getByText(/결과가 준비돼야 대안을 비교할 수 있어요/)).toBeTruthy();
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('needs_input처럼 결과를 쓸 수 없는 상태면 진입시키지 않는다', async () => {
    await renderAlternativesScreen(buildAnalysisResponse({ status: 'needs_input' }));

    expect(screen.getByText(/결과가 준비돼야 대안을 비교할 수 있어요/)).toBeTruthy();
    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('AlternativesScreen — 기준선과 대안 비교', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('기준선 카드와 대안 카드를 나란히 보여준다', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      data: buildComparison(),
      meta: { requestId: 'req', revision: '1', apiVersion: null },
    });

    await renderAlternativesScreen(buildAnalysisResponse());

    await waitFor(() => expect(screen.getByTestId('alternatives-baseline')).toBeTruthy());
    expect(screen.getByTestId('alternatives-card-alt_worse')).toBeTruthy();
    expect(screen.getByTestId('alternatives-card-alt_better')).toBeTruthy();
    expect(screen.getByText('당장 쓸 돈 확보')).toBeTruthy();
    expect(screen.getByText('계획 조금만 바꾸기')).toBeTruthy();
  });

  it('기준선보다 나빠지는 지표를 문구로 표시한다', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      data: buildComparison(),
      meta: { requestId: 'req', revision: '1', apiVersion: null },
    });

    await renderAlternativesScreen(buildAnalysisResponse());
    await waitFor(() => expect(screen.getByTestId('alternatives-baseline')).toBeTruthy());

    const worseCard = screen.getByTestId('alternatives-card-alt_worse');
    expect(within(worseCard).getAllByText('기준선보다 낮아요').length).toBeGreaterThan(0);
    expect(within(worseCard).getByText('기준선보다 길어요')).toBeTruthy();

    const betterCard = screen.getByTestId('alternatives-card-alt_better');
    expect(within(betterCard).queryByText('기준선보다 낮아요')).toBeNull();
    expect(within(betterCard).queryByText('기준선보다 길어요')).toBeNull();
  });

  it('근거 보기를 누르면 trace id를 담아 근거 화면으로 이동한다', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      data: buildComparison(),
      meta: { requestId: 'req', revision: '1', apiVersion: null },
    });

    await renderAlternativesScreen(buildAnalysisResponse());
    await waitFor(() => expect(screen.getByTestId('alternatives-baseline')).toBeTruthy());

    await fireEvent.press(screen.getAllByRole('button', { name: '근거 보기' })[0]);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/evidence/[traceId]',
      params: { traceId: 'trc_alt_worse' },
    });
  });

  it('대안 조회가 실패하면 오류 안내를 보여준다', async () => {
    (apiRequest as jest.Mock).mockRejectedValue(new Error('network down'));

    await renderAlternativesScreen(buildAnalysisResponse());

    await waitFor(() => expect(screen.getByText('대안을 불러오지 못했어요')).toBeTruthy());
  });
});
