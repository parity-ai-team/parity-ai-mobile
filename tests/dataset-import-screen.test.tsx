import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, type ReactNode } from 'react';
import { Text } from 'react-native';

import { DatasetImportScreen } from '@/features/dataset-import';
import {
  FinancialInputSessionProvider,
  useFinancialInputSession,
} from '@/features/financial-input';
import { OnboardingSessionProvider, useOnboardingSession } from '@/features/onboarding';

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@/shared/api', () => {
  const actual = jest.requireActual('@/shared/api');
  return { ...actual, apiRequest: jest.fn() };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { apiRequest } = require('@/shared/api');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { router } = require('expo-router');

const READY_RESPONSE = {
  request_id: 'req_ready',
  dataset_id: 'dts_0123456789abcdef0123',
  status: 'ready',
  row_count: 12,
  coverage_start: '2026-01-01',
  coverage_end: '2026-12-01',
  coverage_months: 12,
  sha256: '0'.repeat(64),
  data_version: 'synthetic-1.0.0',
  intelligence: {
    classification: {
      total_count: 12,
      provided_count: 12,
      inferred_count: 0,
      user_confirmed_count: 0,
      low_confidence_count: 0,
      model_version: 'transaction-nb-1.0.0',
    },
    review_items: [],
    recurring_patterns: [{ pattern_id: 'rcp_0123456789abcdef0123' }],
  },
} as const;

const NEEDS_INPUT_RESPONSE = {
  ...READY_RESPONSE,
  request_id: 'req_review',
  dataset_id: 'dts_aaaaaaaaaaaaaaaaaaaa',
  status: 'needs_input',
  intelligence: {
    ...READY_RESPONSE.intelligence,
    review_items: [
      {
        transaction_id: 'txn_example',
        posted_at: '2026-08-20',
        merchant_label: 'SYNTHETIC_MARKET',
        mcc: '5411',
        predicted_category: 'food',
        confidence: 0.62,
        evidence: ['keyword:market'],
      },
    ],
  },
} as const;

function SelectManualOnMount({ children }: { children: ReactNode }) {
  const { selectScenario } = useOnboardingSession();
  useEffect(() => {
    selectScenario({ type: 'manual' });
  }, [selectScenario]);
  return <>{children}</>;
}

function DatasetIdProbe() {
  const { datasetId } = useFinancialInputSession();
  return <Text testID="dataset-id">{datasetId ?? 'none'}</Text>;
}

function renderScreen() {
  return render(
    <OnboardingSessionProvider>
      <SelectManualOnMount>
        <FinancialInputSessionProvider>
          <DatasetImportScreen />
          <DatasetIdProbe />
        </FinancialInputSessionProvider>
      </SelectManualOnMount>
    </OnboardingSessionProvider>,
  );
}

function mockPickedCsv() {
  (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
    canceled: false,
    assets: [
      {
        name: 'synthetic.csv',
        uri: 'file:///synthetic.csv',
        mimeType: 'text/csv',
        lastModified: 0,
        file: new File(['posted_at,amount_krw'], 'synthetic.csv', { type: 'text/csv' }),
      },
    ],
  });
}

describe('DatasetImportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPickedCsv();
  });

  it('ready 응답이면 반복거래 요약을 표시하고 기존 입력 흐름으로 이동한다', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({ data: READY_RESPONSE, meta: {} });
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'CSV 선택' }));

    await waitFor(() => expect(screen.getByText('거래 내역을 분석할 준비가 됐어요')).toBeTruthy());
    expect(screen.getByText('반복거래 1건 발견')).toBeTruthy();
    expect(apiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', path: '/v1/datasets', body: expect.any(FormData) }),
    );

    await fireEvent.press(screen.getByRole('button', { name: '정보 입력으로 계속' }));
    expect(router.push).toHaveBeenCalledWith('/household');
  });

  it('needs_input 응답이면 AI 예상과 신뢰도를 보여주고 선택 결과를 한 번에 확인한다', async () => {
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({ data: NEEDS_INPUT_RESPONSE, meta: {} })
      .mockResolvedValueOnce({ data: READY_RESPONSE, meta: {} });
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'CSV 선택' }));

    await waitFor(() => expect(screen.getByText('SYNTHETIC_MARKET')).toBeTruthy());
    expect(screen.getByText('2026-08-20')).toBeTruthy();
    expect(screen.getByText('신뢰도 62%')).toBeTruthy();
    expect(screen.getByText('식비')).toBeTruthy();

    await fireEvent.press(screen.getByRole('radio', { name: '교통' }));
    await fireEvent.press(screen.getByRole('button', { name: '분류 확인' }));

    await waitFor(() =>
      expect(apiRequest).toHaveBeenLastCalledWith({
        method: 'POST',
        path: '/v1/datasets/dts_aaaaaaaaaaaaaaaaaaaa/classifications/confirm',
        body: {
          confirmations: [{ transaction_id: 'txn_example', category: 'transport' }],
        },
      }),
    );
    expect(screen.getByText('거래 내역을 분석할 준비가 됐어요')).toBeTruthy();
    expect(screen.getByTestId('dataset-id').props.children).toBe('dts_0123456789abcdef0123');
  });

  it('needs_input인데 확인 목록이 비어 있으면 재조회 가능한 빈 상태를 보여준다', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      data: {
        ...NEEDS_INPUT_RESPONSE,
        intelligence: { ...NEEDS_INPUT_RESPONSE.intelligence, review_items: [] },
      },
      meta: {},
    });
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'CSV 선택' }));

    await waitFor(() =>
      expect(screen.getByText('확인이 필요한 거래 목록이 비어 있어요.')).toBeTruthy(),
    );
    expect(screen.getByRole('button', { name: '분류 항목 다시 불러오기' })).toBeTruthy();
  });

  it('업로드 API 오류를 사용자에게 표시한다', async () => {
    (apiRequest as jest.Mock).mockRejectedValue(new Error('CSV 형식을 확인해 주세요.'));
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'CSV 선택' }));

    await waitFor(() => expect(screen.getByText('오류: CSV 형식을 확인해 주세요.')).toBeTruthy());
  });

  it('업로드 중에는 진행 상태를 표시하고 중복 선택을 막는다', async () => {
    (apiRequest as jest.Mock).mockImplementation(() => new Promise(() => {}));
    await renderScreen();

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'CSV 선택' }));
      await Promise.resolve();
    });

    await waitFor(() => {
      const button = screen.getByRole('button', { name: '업로드 중...' });
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });
});
