import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '@/shared/ui/Button';
import { theme } from '@/shared/ui/theme';

function flattenStyle(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.flat(Infinity).filter(Boolean).map(flattenStyle));
  }
  return (style as Record<string, unknown>) ?? {};
}

describe('Button', () => {
  it('renders the label and fires onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<Button label="분석 시작" onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: '분석 시작' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="분석 시작" onPress={onPress} disabled />);

    fireEvent.press(screen.getByRole('button', { name: '분석 시작' }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('meets the 44pt minimum touch target from the accessibility token', async () => {
    await render(<Button label="확인" onPress={() => {}} />);

    const button = screen.getByRole('button', { name: '확인' });
    const style = flattenStyle(button.props.style);

    expect(style.minHeight).toBe(theme.accessibility.minTouchTarget);
    expect(style.minWidth).toBe(theme.accessibility.minTouchTarget);
  });

  it('uses the surface/border tokens instead of the primary brand color for the secondary variant', async () => {
    await render(<Button label="취소" onPress={() => {}} variant="secondary" />);

    const button = screen.getByRole('button', { name: '취소' });
    const style = flattenStyle(button.props.style);

    expect(style.backgroundColor).toBe(theme.colors.surface);
    expect(style.borderColor).toBe(theme.colors.border);
  });
});
