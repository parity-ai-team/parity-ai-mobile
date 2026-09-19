import { router } from 'expo-router';
import { ScrollView, Text } from 'react-native';

import { Button, useTheme } from '@/shared/ui';

import { createStyles } from './StartScreen.styles';

// S01 시작 화면. docs/frontend.md "사용자 여정과 화면 명세": 서비스 범위 안내,
// 합성 데이터 고지, 시작·데모 선택을 보여준다. 두 버튼 모두 동의 화면(S02)으로
// 이동한다 — 금융·출산일정·가구구조 동의는 데모 여부와 무관하게 필요하고,
// 데모/직접입력 선택 자체는 S03에서 한다.
export default function StartScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const goToConsent = () => router.push('/consent');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>PARITY AI</Text>
      <Text style={styles.body}>
        PARITY AI는 출산 전후 12개월의 가용 현금 흐름을 비교해 보여주는 안내 서비스예요. 의료나 금융
        상담을 대신하지 않고, 계산에 필요한 근거와 가정을 함께 보여줘요.
      </Text>
      <Text style={styles.notice}>
        지금 보시는 화면과 예시 데이터는 실제 정보가 아닌 합성 데이터예요.
      </Text>
      <Button label="시작" onPress={goToConsent} />
      <Button label="데모로 보기" onPress={goToConsent} variant="secondary" />
    </ScrollView>
  );
}
