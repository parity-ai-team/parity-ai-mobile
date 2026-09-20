import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const pathname = usePathname();
  const stage = pathname.startsWith('/evidence')
    ? '계산 근거'
    : ((
        {
          '/': '서비스 안내',
          '/consent': '정보 동의',
          '/scenario': '시나리오 선택',
          '/household': '가구 정보',
          '/financial': '금융 정보',
          '/plan': '휴직·소득 계획',
          '/review': '입력 검토',
          '/analysis': '분석 준비',
          '/analysis/result': '분석 결과',
          '/alternatives': '대안 비교',
          '/asset-start': '안전 적립',
        } as Record<string, string>
      )[pathname] ?? '안내');

  return (
    <OnboardingSessionProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.badgeBar}>
            <View style={styles.brandRow}>
              <Text style={styles.brand}>PARITY AI</Text>
              <Text style={styles.stage}>{stage}</Text>
            </View>
            <DataModeBadge mode="synthetic" dataVersion={ONBOARDING_DATA_VERSION} />
          </View>
        </View>
        {children}
      </SafeAreaView>
    </OnboardingSessionProvider>
  );
}
