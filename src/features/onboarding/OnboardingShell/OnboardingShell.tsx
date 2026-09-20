import type { ReactNode } from 'react';
import { Image, Text, View, useWindowDimensions } from 'react-native';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Container, DataModeBadge, useTheme } from '@/shared/ui';
import { InteractivePressable } from '@/shared/ui/InteractivePressable/InteractivePressable';

import { ONBOARDING_DATA_VERSION } from '../constants';
import { OnboardingSessionProvider } from '../OnboardingSessionContext';
import { createStyles } from './OnboardingShell.styles';

const brandLogo = require('../../../../assets/parity-ai-logo-final.png');

export interface OnboardingShellProps {
  children: ReactNode;
}

// docs/frontend.md "합성 데이터 모드에는 모든 화면 상단에 '데모 데이터' 배지를
// 지속 표시한다": 화면마다 배지를 반복해서 그리는 대신 라우트 스택을 감싸는
// 이 셸에 한 번만 두어, 화면이 바뀌어도 배지는 그대로 남아 있게 한다. 헤더
// 안쪽은 Page(wide)와 같은 Container를 써서 본문 왼쪽 끝과 정확히 맞춘다.
export function OnboardingShell({ children }: OnboardingShellProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const showStage = width >= theme.layout.tablet;
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
          <Container style={styles.headerRow}>
            <InteractivePressable
              style={styles.brandLockup}
              onPress={() => router.replace('/')}
              accessibilityRole="button"
              accessibilityLabel="첫 화면으로 돌아가기"
            >
              <Image
                source={brandLogo}
                style={styles.brandLogo}
                resizeMode="contain"
                accessible={false}
              />
              <Text style={styles.brand}>PARITY AI</Text>
            </InteractivePressable>
            <View style={styles.headerRight}>
              {showStage ? <Text style={styles.stage}>{stage}</Text> : null}
              <DataModeBadge
                mode="synthetic"
                dataVersion={ONBOARDING_DATA_VERSION}
                compact={width < theme.layout.deviceWidth}
              />
            </View>
          </Container>
        </View>
        {children}
      </SafeAreaView>
    </OnboardingSessionProvider>
  );
}
