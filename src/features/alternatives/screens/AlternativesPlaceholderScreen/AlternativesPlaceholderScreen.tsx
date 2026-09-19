import { router } from 'expo-router';
import { ScrollView, Text } from 'react-native';

import { Button, useTheme } from '@/shared/ui';

import { createStyles } from './AlternativesPlaceholderScreen.styles';

// S10 대안 비교 화면(/alternatives)의 자리표시. 로드맵 #8~#9(S08~S09) 범위는
// 결과 화면에서 이 경로로 이동하는 것까지다 — 실제 비교 화면은 이후 PR에서
// 구현한다.
export default function AlternativesPlaceholderScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>대안 비교</Text>
      <Text style={styles.body}>대안 비교 화면은 다음 PR에서 구현돼요.</Text>
      <Button label="결과로 돌아가기" onPress={() => router.push('/analysis/result')} />
    </ScrollView>
  );
}
