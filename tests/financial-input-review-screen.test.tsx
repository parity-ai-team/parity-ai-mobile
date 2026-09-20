import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useEffect, type ReactNode } from 'react';

import {
  FinancialInputSessionProvider,
  ReviewScreen,
  useFinancialInputSession,
} from '@/features/financial-input';
import {
  DEMO_SCENARIOS,
  OnboardingSessionProvider,
  useOnboardingSession,
} from '@/features/onboarding';

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
const { apiRequest, ApiError } = require('@/shared/api');

function SelectFirstBirthOnMount({ children }: { children: ReactNode }) {
  const { selectScenario } = useOnboardingSession();
  useEffect(() => {
    selectScenario({ type: 'demo', scenarioId: 'first_birth_dual_income' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}

function renderReviewScreenWithDemo() {
  return render(
    <OnboardingSessionProvider>
      <SelectFirstBirthOnMount>
        <FinancialInputSessionProvider>
          <ReviewScreen />
        </FinancialInputSessionProvider>
      </SelectFirstBirthOnMount>
    </OnboardingSessionProvider>,
  );
}

function SelectManualOnMount({ children }: { children: ReactNode }) {
  const { scenarioSelection, selectScenario } = useOnboardingSession();
  useEffect(() => {
    selectScenario({ type: 'manual' });
  }, [selectScenario]);
  return scenarioSelection?.type === 'manual' ? <>{children}</> : null;
}

function SeedManualDataset({ children }: { children: ReactNode }) {
  const session = useFinancialInputSession();
  useEffect(() => {
    const defaults = DEMO_SCENARIOS[0].default_analysis;
    session.updateHousehold(defaults.household);
    session.updateFinancial(defaults.financial);
    session.updatePlan(defaults.plan);
    session.updateStress(defaults.stress ?? { income_delay_weeks: 0, child_support_missed: false });
    session.setDatasetResponse({
      request_id: 'req_dataset',
      dataset_id: 'dts_0123456789abcdef0123',
      status: 'ready',
      data_version: 'synthetic-1.0.0',
      intelligence: {
        classification: {
          total_count: 1,
          provided_count: 1,
          inferred_count: 0,
          user_confirmed_count: 0,
          low_confidence_count: 0,
          model_version: 'transaction-nb-1.0.0',
        },
        review_items: [],
        recurring_patterns: [],
      },
    });
    // 테스트 시드이므로 최초 마운트에만 실행한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}

function renderReviewScreenWithManualDataset() {
  return render(
    <OnboardingSessionProvider>
      <SelectManualOnMount>
        <FinancialInputSessionProvider>
          <SeedManualDataset>
            <ReviewScreen />
          </SeedManualDataset>
        </FinancialInputSessionProvider>
      </SelectManualOnMount>
    </OnboardingSessionProvider>,
  );
}

describe('ReviewScreen — 사용자 입력/가정값 구분', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('데모 기본값을 바꾸지 않았으면 모든 행이 가정값으로 표시된다', async () => {
    await renderReviewScreenWithDemo();

    expect(screen.getAllByText('가정값').length).toBeGreaterThan(0);
    expect(screen.queryByText('사용자 입력')).toBeNull();
  });

  it('금액은 천 단위 구분과 함께 표시된다', async () => {
    await renderReviewScreenWithDemo();

    expect(screen.getByText('12,000,000원')).toBeTruthy();
  });
});

describe('ReviewScreen — 분석 시작', () => {
  afterEach(() => {
    jest.clearAllMocks();
    (apiRequest as jest.Mock).mockReset();
  });

  it('성공하면 응답을 세션에 보관하고 S08 게이트(/analysis)로 이동한다', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      data: { analysis_id: 'ana_test', status: 'ready' },
      meta: { requestId: 'req_test', revision: '1', apiVersion: '1.5.0' },
    });

    await renderReviewScreenWithDemo();
    await fireEvent.press(screen.getByRole('button', { name: '분석 시작' }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/analysis'));
    expect(apiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/analyses',
        body: expect.objectContaining({ scenario_id: 'first_birth_dual_income' }),
      }),
    );
  });

  it('서버 422 field_errors가 해당 행에 매핑되어 표시된다', async () => {
    (apiRequest as jest.Mock).mockRejectedValue(
      new ApiError(
        {
          request_id: 'req_err',
          error: {
            code: 'VALIDATION_ERROR',
            message: '확인할 입력이 있어요.',
            field_errors: [{ path: 'financial.current_cash_krw', reason: 'greater_than_equal' }],
            retryable: false,
          },
        },
        422,
      ),
    );

    await renderReviewScreenWithDemo();
    await fireEvent.press(screen.getByRole('button', { name: '분석 시작' }));

    await waitFor(() => expect(screen.getByText('오류: greater_than_equal')).toBeTruthy());
    expect(screen.getByText('오류: 확인할 입력이 있어요.')).toBeTruthy();
    expect(router.push).not.toHaveBeenCalledWith('/analysis');
  });

  it('분류 확인이 필요한 422면 데이터셋 분류 화면으로 안내한다', async () => {
    (apiRequest as jest.Mock)
      .mockRejectedValueOnce(
        new ApiError(
          {
            request_id: 'req_err',
            error: {
              code: 'INSUFFICIENT_DATA',
              message: '거래 분류 확인이 필요해요.',
              field_errors: [{ path: 'dataset_id', reason: 'confirmation_required' }],
              retryable: false,
            },
          },
          422,
        ),
      )
      .mockResolvedValueOnce({
        data: {
          request_id: 'req_intelligence',
          dataset_id: 'dts_0123456789abcdef0123',
          status: 'needs_input',
          data_version: 'synthetic-1.0.0',
          intelligence: {
            classification: {
              total_count: 1,
              provided_count: 0,
              inferred_count: 1,
              user_confirmed_count: 0,
              low_confidence_count: 1,
              model_version: 'transaction-nb-1.0.0',
            },
            review_items: [],
            recurring_patterns: [],
          },
        },
        meta: {},
      });

    await renderReviewScreenWithManualDataset();
    await waitFor(() => expect(screen.getByRole('button', { name: '분석 시작' })).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: '분석 시작' }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/dataset'));
    expect(apiRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        method: 'GET',
        path: '/v1/datasets/dts_0123456789abcdef0123/intelligence',
      }),
    );
  });

  // 콜드 스타트 대응: apiRequest에 onSlowRequest를 넘기고, 그게 호출되면
  // "서버를 깨우는 중" 안내를 보여준다. 실제 5초/90초 타이밍은
  // tests/shared-api-client.test.ts가 realApiRequest 단에서 확인한다 — 여기서는
  // 화면이 그 콜백을 받아 올바르게 반응하는지만 본다.
  it('요청이 느려지면(onSlowRequest 호출) 서버를 깨우는 중이라는 안내를 보여준다', async () => {
    let capturedOnSlowRequest: (() => void) | undefined;
    (apiRequest as jest.Mock).mockImplementation((options: { onSlowRequest?: () => void }) => {
      capturedOnSlowRequest = options.onSlowRequest;
      return new Promise(() => {});
    });

    await renderReviewScreenWithDemo();
    // apiRequest가 절대 resolve되지 않는 Promise를 반환하므로 press 자체를
    // await하면 테스트가 멈춘다 — 핸들러가 apiRequest를 호출할 때까지만
    // waitFor로 기다린다.
    fireEvent.press(screen.getByRole('button', { name: '분석 시작' }));
    await waitFor(() => expect(capturedOnSlowRequest).toBeDefined());

    expect(screen.queryByText(/서버를 깨우는 중이에요/)).toBeNull();

    await act(async () => {
      capturedOnSlowRequest?.();
    });

    expect(screen.getByText(/서버를 깨우는 중이에요/)).toBeTruthy();
  });
});
