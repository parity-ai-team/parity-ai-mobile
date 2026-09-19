import type { ReactNode } from 'react';
import { View } from 'react-native';

import { DataModeBadge, useTheme } from '@/shared/ui';

import { ONBOARDING_DATA_VERSION } from '../constants';
import { OnboardingSessionProvider } from '../OnboardingSessionContext';
import { createStyles } from './OnboardingShell.styles';

export interface OnboardingShellProps {
  children: ReactNode;
}

// docs/frontend.md "합성 데이터 모드에는 모든 화면 상단에 '데모 데이터' 배지를
// 지속 표시한다": 화면마다 배지를 반복해서 그리는 대신 라우트 스택을 감싸는
// 이 셸에 한 번만 두어, 화면이 바뀌어도 배지는 그대로 남아 있게 한다.
export function OnboardingShell({ children }: OnboardingShellProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <OnboardingSessionProvider>
      <View style={styles.container}>
        <View style={styles.badgeBar}>
          <DataModeBadge mode="synthetic" dataVersion={ONBOARDING_DATA_VERSION} />
        </View>
        {children}
      </View>
    </OnboardingSessionProvider>
  );
}
