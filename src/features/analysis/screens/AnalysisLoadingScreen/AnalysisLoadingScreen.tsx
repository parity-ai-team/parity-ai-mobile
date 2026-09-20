import { Page } from '@/shared/ui/Page/Page';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { useFinancialInputSession } from '@/features/financial-input';
import { LoadingCards, Button, useTheme } from '@/shared/ui';

import { createStyles } from './AnalysisLoadingScreen.styles';

// S08 계산 화면(/analysis). docs/frontend.md는 이 단계를 "검증·계산 진행,
// 중복 제출 방지"라고 정의하지만, 백엔드가 동기 응답이라(S07의 POST가 이미
// 끝난 뒤에만 이 화면에 온다) 별도 폴링은 하지 않는다 — 세션에 이미 있는
// 분석 응답을 확인하고 바로 결과 화면으로 넘기는 게이트 역할만 한다.
// 응답이 없으면(세션 만료, 직접 진입 등) 실패로 보고 재시도 경로를 보여준다.
export default function AnalysisLoadingScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { analysisResponse } = useFinancialInputSession();

  useEffect(() => {
    if (analysisResponse) {
      router.push('/analysis/result');
    }
  }, [analysisResponse]);

  if (analysisResponse) {
    return (
      <Page contentContainerStyle={styles.content}>
        <LoadingCards />
        <Text style={styles.title}>분석 중이에요…</Text>
      </Page>
    );
  }

  return (
    <Page contentContainerStyle={styles.content}>
      <Text style={styles.title}>분석 결과를 찾을 수 없어요</Text>
      <Text style={styles.body}>
        세션이 만료되었거나 아직 분석을 시작하지 않았어요. 검토 화면에서 다시 시도해 주세요.
      </Text>
      <Button label="다시 시도" onPress={() => router.push('/review')} />
    </Page>
  );
}
