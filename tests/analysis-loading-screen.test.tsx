import { fireEvent, render, screen } from '@testing-library/react-native';
import { useEffect, type ReactNode } from 'react';

import { AnalysisLoadingScreen } from '@/features/analysis';
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

const READY_RESPONSE: AnalysisResponse = {
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
  limitations: ['SYNTHETIC_DATA'],
  input_hash: null,
  result_hash: null,
  random_seed: null,
  generated_at: null,
};

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

function renderLoadingScreen(response: AnalysisResponse | null) {
  return render(
    <OnboardingSessionProvider>
      <FinancialInputSessionProvider>
        <SetAnalysisResponseOnMount response={response}>
          <AnalysisLoadingScreen />
        </SetAnalysisResponseOnMount>
      </FinancialInputSessionProvider>
    </OnboardingSessionProvider>,
  );
}

describe('AnalysisLoadingScreen (S08)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('세션에 분석 응답이 있으면 결과 화면으로 이동한다', async () => {
    await renderLoadingScreen(READY_RESPONSE);

    expect(router.push).toHaveBeenCalledWith('/analysis/result');
  });

  it('세션에 분석 응답이 없으면 실패 안내와 다시 시도 버튼을 보여준다', async () => {
    await renderLoadingScreen(null);

    expect(router.push).not.toHaveBeenCalled();
    expect(screen.getByText('분석 결과를 찾을 수 없어요')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: '다시 시도' }));

    expect(router.push).toHaveBeenCalledWith('/review');
  });
});
