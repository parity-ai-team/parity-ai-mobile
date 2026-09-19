import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text } from 'react-native';

import { Button, useTheme } from '@/shared/ui';

import { createStyles } from './EvidencePlaceholderScreen.styles';

// S12 근거 화면(/evidence/[traceId])의 자리표시. 로드맵 #8~#9(S08~S09) 범위는
// 결과 화면의 "근거 보기"에서 이 경로로 이동하는 것까지다 — 실제 근거 표시는
// 이후 PR에서 구현한다.
export default function EvidencePlaceholderScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { traceId } = useLocalSearchParams<{ traceId: string }>();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>근거</Text>
      <Text style={styles.body}>추적 ID: {traceId}</Text>
      <Text style={styles.body}>이 근거의 상세 화면은 다음 PR에서 구현돼요.</Text>
      <Button label="결과로 돌아가기" onPress={() => router.push('/analysis/result')} />
    </ScrollView>
  );
}
