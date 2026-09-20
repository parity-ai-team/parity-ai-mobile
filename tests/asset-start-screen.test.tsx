import { fireEvent, render, screen } from '@testing-library/react-native';
import { useEffect, type ReactNode } from 'react';

import { AssetStartScreen } from '@/features/asset-plan';
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

function renderAssetStartScreen(response: AnalysisResponse | null) {
  return render(
    <OnboardingSessionProvider>
      <FinancialInputSessionProvider>
        <SetAnalysisResponseOnMount response={response}>
          <AssetStartScreen />
        </SetAnalysisResponseOnMount>
      </FinancialInputSessionProvider>
    </OnboardingSessionProvider>,
  );
}

describe('AssetStartScreen — 진입 가능 여부', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('세션에 분석 응답이 없으면 검토 화면으로 돌아가는 안내를 보여준다', async () => {
    await renderAssetStartScreen(null);

    expect(screen.getByText('세션이 만료됐어요. 검토 화면에서 다시 시작해 주세요.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: '검토 화면으로' }));
    expect(router.push).toHaveBeenCalledWith('/review');
  });

  it('needs_input처럼 결과를 쓸 수 없는 상태면 안전 적립을 보여주지 않는다', async () => {
    await renderAssetStartScreen(buildAnalysisResponse({ status: 'needs_input' }));

    expect(screen.getByText('아직 안전 적립을 판단할 수 없어요')).toBeTruthy();
    expect(screen.queryByTestId('asset-start-safe-contribution')).toBeNull();
  });
});

describe('AssetStartScreen — eligible 표시', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('eligible=true면 월 적립액과 유효기한을 보여준다', async () => {
    await renderAssetStartScreen(
      buildAnalysisResponse({
        result: {
          cashflow: [],
          risks: [],
          safe_contribution: {
            eligible: true,
            monthly_amount_krw: 250_000,
            reason_codes: [],
            valid_until: '2027-12',
          },
        },
      }),
    );

    expect(screen.getByText('250,000원')).toBeTruthy();
    expect(screen.getByText(/2027-12까지 유효한 판단이에요/)).toBeTruthy();
  });

  it('eligible=false면 안전한 적립 금액을 제시하지 않는다는 안내와 사유를 보여준다', async () => {
    await renderAssetStartScreen(
      buildAnalysisResponse({
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
      }),
    );

    expect(screen.getByText(/안전한 적립 금액을 제시하지 않아요/)).toBeTruthy();
    expect(screen.getByText('비상금 기준 미달')).toBeTruthy();
  });

  it('시작을 유도하는 문구나 상품 CTA 버튼이 없다', async () => {
    await renderAssetStartScreen(
      buildAnalysisResponse({
        result: {
          cashflow: [],
          risks: [],
          safe_contribution: {
            eligible: true,
            monthly_amount_krw: 250_000,
            reason_codes: [],
            valid_until: '2027-12',
          },
        },
      }),
    );

    expect(screen.queryByText(/시작하세요/)).toBeNull();
    expect(screen.queryByText(/가입/)).toBeNull();
  });
});
