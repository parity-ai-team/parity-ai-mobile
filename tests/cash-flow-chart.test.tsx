import { fireEvent, render, screen } from '@testing-library/react-native';

import { firstBirthFixture } from '@/mocks/scenarios/first-birth';
import { CashFlowChart } from '@/shared/ui/CashFlowChart';

const points = firstBirthFixture.result.cashflow;

describe('CashFlowChart', () => {
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

  it('does not render selection hit areas when onSelectPeriod is not provided', async () => {
    await render(<CashFlowChart points={points} testID="chart" />);

    expect(screen.queryByTestId(`chart-select-${points[0].period}`)).toBeNull();
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
