import { render, screen, fireEvent, within } from '@testing-library/react-native';
import * as Native from 'react-native';
import { Button, Page, Columns, Column, TextField, theme } from '@/shared/ui';

const originalWindow = Native.Dimensions.get('window');
const originalScreen = Native.Dimensions.get('screen');
function viewport(width: number, fontScale = 1) {
  const dimensions = { width, height: 844, scale: 1, fontScale };
  Native.Dimensions.set({ window: dimensions, screen: dimensions });
}
afterEach(() => Native.Dimensions.set({ window: originalWindow, screen: originalScreen }));

it.each([
  [390, false, undefined],
  [768, false, 560],
  [1280, false, 560],
  [390, true, undefined],
  [1099, true, 560],
  [1280, true, 1120],
] as const)('폭 %s, wide=%s에서 컨테이너 규칙을 적용한다', async (width, wide, maximum) => {
  viewport(width);
  await render(
    <Page wide={wide} testID="page">
      <Native.Text>본문</Native.Text>
    </Page>,
  );
  const scroll = screen.getByTestId('page');
  const style = Native.StyleSheet.flatten(scroll.props.contentContainerStyle);
  expect(style.maxWidth).toBe(maximum);
  expect(style.width).toBe('100%');
  expect(style.alignSelf).toBe('center');
});

it.each([
  [390, undefined],
  [1280, 'row'],
] as const)('폭 %s에서 결과 영역의 열 방향을 적용한다', async (width, direction) => {
  viewport(width);
  await render(
    <Columns>
      <Column>
        <Native.Text>차트</Native.Text>
      </Column>
      <Column>
        <Native.Text>카드</Native.Text>
      </Column>
    </Columns>,
  );
  const view = screen.root!;
  expect(Native.StyleSheet.flatten(view.props.style).flexDirection).toBe(direction);
});

it('글꼴 확대에서도 하단 액션은 스크롤 밖에 있고 고정 높이를 사용하지 않는다', async () => {
  viewport(390, 2);
  await render(
    <Page testID="page" footer={<Button label="다음" onPress={() => {}} />}>
      <Native.Text>본문</Native.Text>
    </Page>,
  );
  const scroll = screen.getByTestId('page');
  expect(within(scroll).queryAllByRole('button')).toHaveLength(0);
  const button = screen.getByRole('button', { name: '다음' });
  const style = Native.StyleSheet.flatten(button.props.style);
  expect(style.height).toBeUndefined();
  expect(style.minHeight).toBeGreaterThanOrEqual(44);
});

it.each(['primary', 'secondary', 'text', 'pill'] as const)(
  '%s 버튼은 포커스를 표시하고 44pt 터치 영역을 유지한다',
  async (variant) => {
    await render(<Button label="확인" variant={variant} onPress={() => {}} />);
    const button = screen.getByRole('button', { name: '확인' });
    await fireEvent(button, 'focus', {});
    const style = Native.StyleSheet.flatten(button.props.style);
    expect(style.minWidth).toBeGreaterThanOrEqual(44);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
    expect(style.outlineColor ?? style.borderColor).toBe(
      Native.Platform.OS === 'web' ? theme.colors.brand : theme.colors.deepGreen,
    );
  },
);

it('단위가 추가되어도 필드 이름·오류·입력 이벤트는 유지된다', async () => {
  const onChange = jest.fn();
  const onBlur = jest.fn();
  await render(
    <TextField
      label="가용 현금"
      value=""
      onChangeText={onChange}
      onBlur={onBlur}
      unit="원"
      error="금액을 확인해 주세요."
    />,
  );
  const input = screen.getByLabelText('가용 현금');
  await fireEvent.changeText(input, '5000');
  await fireEvent(input, 'blur');
  expect(onChange).toHaveBeenCalledWith('5000');
  expect(onBlur).toHaveBeenCalledTimes(1);
  expect(screen.getByText('원')).toBeTruthy();
  expect(screen.getByRole('alert')).toBeTruthy();
});

it('원 단위 금액은 천 단위 쉼표로 보이고 폼에는 숫자만 전달한다', async () => {
  const onChange = jest.fn();
  await render(<TextField label="가용 현금" value="12000000" onChangeText={onChange} unit="원" />);

  const input = screen.getByLabelText('가용 현금');
  expect(input.props.value).toBe('12,000,000');

  await fireEvent.changeText(input, '12,345,678');
  expect(onChange).toHaveBeenCalledWith('12345678');
});
