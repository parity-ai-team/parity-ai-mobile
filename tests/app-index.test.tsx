import { render, screen } from '@testing-library/react-native';

import StartScreen from '@/app/index';

describe('StartScreen', () => {
  it('renders the app name', async () => {
    await render(<StartScreen />);

    expect(screen.getByText('PARITY AI')).toBeTruthy();
  });
});
