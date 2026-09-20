import { fireEvent, render, screen } from '@testing-library/react-native';

import { firstBirthFixture } from '@/mocks/scenarios/first-birth';
import { CashFlowChart } from '@/shared/ui/CashFlowChart';

const points = firstBirthFixture.result.cashflow;

describe('CashFlowChart', () => {
  it('starts at the lowest forecast month and updates the amount with month navigation', async () => {
    await render(<CashFlowChart points={points} testID="chart" />);
    const lowest = points.reduce((best, p, i) => (p.p50_krw < points[best].p50_krw ? i : best), 0);
    expect(screen.getByTestId('chart-selected-amount').props.children).toBe(
      points[lowest].p50_krw.toLocaleString('ko-KR') + '원',
    );
    await fireEvent.press(screen.getByRole('button', { name: '다음 달' }));
    expect(screen.getByTestId('chart-selected-amount').props.children).toBe(
      points[lowest + 1].p50_krw.toLocaleString('ko-KR') + '원',
    );
  });

  it('disables navigation at both boundaries for a single month, including zero values', async () => {
    await render(
      <CashFlowChart
        points={[
          {
            ...points[0],
            p20_krw: 0,
            p50_krw: 0,
            p80_krw: 0,
            confirmed_cash_krw: 0,
            emergency_floor_krw: 0,
          },
        ]}
        testID="chart"
      />,
    );
    expect(screen.getByRole('button', { name: '이전 달' }).props.accessibilityState.disabled).toBe(
      true,
    );
    expect(screen.getByRole('button', { name: '다음 달' }).props.accessibilityState.disabled).toBe(
      true,
    );
    expect(screen.getByTestId('chart-selected-amount').props.children).toBe('0원');
  });

  it('shows a readable empty state without plotting invalid coordinates', async () => {
    await render(<CashFlowChart points={[]} testID="chart" />);
    expect(screen.getByText('아직 표시할 월별 금액이 없어요.')).toBeTruthy();
    expect(screen.queryByTestId('chart-svg-container')).toBeNull();
  });

  it('preserves negative amounts and explains a shortfall below the emergency reserve', async () => {
    await render(
      <CashFlowChart
        points={[{ ...points[0], p20_krw: -2000000, p50_krw: -1000000, p80_krw: 0 }]}
        testID="chart"
      />,
    );
    expect(screen.getByTestId('chart-selected-amount').props.children).toBe('-1,000,000원');
    expect(screen.getByText('비상금보다 적게 남는 달이에요')).toBeTruthy();
  });

  it('renders an accessible summary label covering the chart', async () => {
    await render(<CashFlowChart points={points} testID="chart" />);

    const container = screen.getByTestId('chart-svg-container');
    expect(container.props.accessibilityLabel).toContain(points[0].period);
    expect(container.props.accessibilityLabel).toContain(points[points.length - 1].period);
  });

  it('calls onSelectPeriod when a month is tapped on the chart', async () => {
    const onSelectPeriod = jest.fn();
    await render(<CashFlowChart points={points} onSelectPeriod={onSelectPeriod} testID="chart" />);

    await fireEvent.press(screen.getByTestId(`chart-select-${points[3].period}`));

    expect(onSelectPeriod).toHaveBeenCalledWith(points[3].period);
  });

  it('updates the selected amount locally when no selection callback is provided', async () => {
    await render(<CashFlowChart points={points} testID="chart" />);

    await fireEvent.press(screen.getByTestId(`chart-select-${points[0].period}`));
    expect(screen.getByTestId('chart-selected-amount').props.children).toBe(
      points[0].p50_krw.toLocaleString('ko-KR') + '원',
    );
  });

  it('the table (accessible alternative) is hidden until toggled, then shows every month', async () => {
    await render(<CashFlowChart points={points} testID="chart" />);

    expect(screen.queryByTestId('chart-table')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: '월별 금액 보기' }));

    const table = screen.getByTestId('chart-table');
    expect(table).toBeTruthy();
    for (const p of points) {
      expect(screen.getByText(p.period)).toBeTruthy();
    }
  });

  it('table rows also call onSelectPeriod (a properly-sized touch target alternative to the chart)', async () => {
    const onSelectPeriod = jest.fn();
    await render(<CashFlowChart points={points} onSelectPeriod={onSelectPeriod} testID="chart" />);

    await fireEvent.press(screen.getByRole('button', { name: '월별 금액 보기' }));
    await fireEvent.press(screen.getByRole('button', { name: new RegExp(points[5].period) }));

    expect(onSelectPeriod).toHaveBeenCalledWith(points[5].period);
  });

  it('marks the selected period as selected in the table', async () => {
    await render(
      <CashFlowChart
        points={points}
        selectedPeriod={points[2].period}
        onSelectPeriod={jest.fn()}
        testID="chart"
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: '월별 금액 보기' }));

    const row = screen.getByRole('button', { name: new RegExp(points[2].period) });
    expect(row.props.accessibilityState.selected).toBe(true);
  });
});
