import { Stack } from 'expo-router';

import { OnboardingShell } from '@/features/onboarding';

export default function RootLayout() {
  return (
    <OnboardingShell>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingShell>
  );
}
