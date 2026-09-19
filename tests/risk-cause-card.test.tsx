import { fireEvent, render, screen } from '@testing-library/react-native';

import { CAUSE_CODE_LABEL, getCauseCodeLabel, RiskCauseCard } from '@/shared/ui/RiskCauseCard';
import type { CauseCode, RiskItem } from '@/shared/types';

// 생성 타입(CauseCode)의 유니온을 그대로 나열한다 — CAUSE_CODE_LABEL이
// Record<CauseCode, string>으로 선언돼 있어 새 코드가 추가되면 소스 쪽에서
// 먼저 컴파일이 깨지지만, 이 목록도 손으로 맞춰 둬서 라벨 내용 자체(코드
// 그대로 노출되지 않는지)를 런타임으로 한 번 더 확인한다.
const ALL_CAUSE_CODES: CauseCode[] = [
  'INCOME_DROP',
  'PAYMENT_DELAY',
  'EXPENSE_SPIKE',
  'CARD_DUE_COLLISION',
  'LOAN_DUE',
  'INSURANCE_DUE',
  'BELOW_EMERGENCY_FLOOR',
  'SHORTAGE_RISK_HIGH',
  'RESTRICTED_FUND_MISMATCH',
  'BENEFIT_EXPIRY',
  'MISSING_SCHEDULE',
  'LOW_CLASSIFICATION_CONFIDENCE',
  'MANDATORY_PAYMENT_UNMET',
];

function baseRisk(overrides: Partial<RiskItem> = {}): RiskItem {
  return {
    period: '2027-04',
    severity: 'warning',
    cause_codes: ['INCOME_DROP', 'CARD_DUE_COLLISION'],
    expected_gap_krw: -650_000,
    probability: 0.45,
    confidence: 'medium',
    source: 'derived',
    trace_ids: ['trc_1'],
    ...overrides,
  };
}

describe('CAUSE_CODE_LABEL — 전체 CauseCode 커버', () => {
  it.each(ALL_CAUSE_CODES)('%s는 코드 원문이 아닌 한국어 문구로 매핑된다', (code) => {
    expect(CAUSE_CODE_LABEL[code]).toBeTruthy();
    expect(CAUSE_CODE_LABEL[code]).not.toBe(code);
  });

  it('알 수 없는 코드는 깨지지 않고 원문 그대로 보여준다', () => {
    expect(getCauseCodeLabel('SOME_FUTURE_CODE')).toBe('SOME_FUTURE_CODE');
  });
});

describe('RiskCauseCard', () => {
  it('severity를 색+텍스트로 표시한다', async () => {
    await render(<RiskCauseCard risk={baseRisk({ severity: 'critical' })} testID="risk" />);

    expect(screen.getByText('위험')).toBeTruthy();
  });

  it('cause_codes를 한국어 문구로 최대 3개까지 보여준다', async () => {
    await render(
      <RiskCauseCard
        risk={baseRisk({
          cause_codes: ['INCOME_DROP', 'CARD_DUE_COLLISION', 'INSURANCE_DUE', 'LOAN_DUE'],
        })}
      />,
    );

    expect(screen.getByText('소득 감소')).toBeTruthy();
    expect(screen.getByText('카드 대금 겹침')).toBeTruthy();
    expect(screen.getByText('보험료 납부일')).toBeTruthy();
    expect(screen.queryByText('대출 상환일')).toBeNull();
  });

  it('probability가 있으면 퍼센트로 보여준다', async () => {
    await render(<RiskCauseCard risk={baseRisk({ probability: 0.72 })} />);

    expect(screen.getByText('부족 확률 72%')).toBeTruthy();
  });

  it('probability가 null이면 아무것도 보여주지 않는다', async () => {
    await render(<RiskCauseCard risk={baseRisk({ probability: null })} />);

    expect(screen.queryByText(/부족 확률/)).toBeNull();
  });

  it('trace_id별로 근거 보기 버튼을 렌더링하고 누르면 콜백을 호출한다', async () => {
    const onPressEvidence = jest.fn();
    await render(
      <RiskCauseCard
        risk={baseRisk({ trace_ids: ['trc_a', 'trc_b'] })}
        onPressEvidence={onPressEvidence}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: '근거 보기 1' }));
    expect(onPressEvidence).toHaveBeenCalledWith('trc_a');

    await fireEvent.press(screen.getByRole('button', { name: '근거 보기 2' }));
    expect(onPressEvidence).toHaveBeenCalledWith('trc_b');
  });
});
