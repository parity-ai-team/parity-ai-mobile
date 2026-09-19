import { Stack } from 'expo-router';

import { FinancialInputSessionProvider } from '@/features/financial-input';
import { OnboardingShell } from '@/features/onboarding';

export default function RootLayout() {
  return (
    <OnboardingShell>
      <FinancialInputSessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </FinancialInputSessionProvider>
    </OnboardingShell>
  );
}
