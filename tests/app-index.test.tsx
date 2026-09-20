import { render, screen } from '@testing-library/react-native';

import StartScreen from '@/app/index';
import { OnboardingSessionProvider } from '@/features/onboarding';

describe('StartScreen', () => {
  it('renders the app name', async () => {
    await render(
      <OnboardingSessionProvider>
        <StartScreen />
      </OnboardingSessionProvider>,
    );

    expect(screen.getByText('PARITY AI')).toBeTruthy();
  });
});
