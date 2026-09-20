import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useEffect, type ReactNode } from 'react';

import { FinancialInputSessionProvider, ReviewScreen } from '@/features/financial-input';
import { OnboardingSessionProvider, useOnboardingSession } from '@/features/onboarding';

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
});
