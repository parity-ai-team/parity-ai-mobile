import { Page } from '@/shared/ui/Page/Page';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { Button, Card, Chip, useTheme } from '@/shared/ui';

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
    <Page contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        {/* 순수 장식용 배경 그라데이션이라 accessible 트리에 넣지 않는다.
            react-native-svg 15.x는 웹에서 Shape에 accessible을 주면 그대로
            DOM 속성으로 새어나가 "Received `false` for a non-boolean
            attribute" 경고가 났다 — focusable은 React가 인식하는 boolean
            속성이라 안전하다. */}
        <Svg
          width={theme.layout.full}
          height={theme.layout.full}
          style={styles.gradient}
          focusable={false}
        >
          <Defs>
            <LinearGradient
              id="parity-hero"
              x1={theme.layout.gradientStart}
              y1={theme.layout.gradientStart}
              x2={theme.layout.gradientEnd}
              y2={theme.layout.gradientEnd}
            >
              <Stop offset={theme.layout.gradientStart} stopColor={theme.colors.mint} />
              <Stop offset={theme.layout.gradientMid} stopColor={theme.colors.brandBright} />
              <Stop offset={theme.layout.gradientEnd} stopColor={theme.colors.deepGreen} />
            </LinearGradient>
          </Defs>
          <Rect width={theme.layout.full} height={theme.layout.full} fill="url(#parity-hero)" />
        </Svg>
        <View style={styles.heroIntro}>
          <Text style={styles.eyebrow}>PARITY AI</Text>
          <Text style={styles.title}>가족의 새로운 시작,{'\n'}현금흐름부터 차분하게</Text>
          <Chip label="출산 전후 12개월 · 비교와 안내" tone="brand" />
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.heroNumber}>12개월</Text>
          <Text style={styles.heroCaption}>변화하는 수입과 지출을 한눈에</Text>
          <Text style={styles.heroCaption}>현금흐름 · 대안 비교 · 계산 근거</Text>
        </View>
      </View>
      <Card>
        <Text style={styles.sectionTitle}>내일의 계획을 위한 오늘의 확인</Text>
        <Text style={styles.body}>
          PARITY AI는 출산 전후 12개월의 가용 현금 흐름을 비교해 보여주는 안내 서비스예요. 의료나
          금융 상담을 대신하지 않고, 계산에 필요한 근거와 가정을 함께 보여줘요.
        </Text>
        <Text style={styles.notice}>
          지금 보시는 화면과 예시 데이터는 실제 정보가 아닌 합성 데이터예요.
        </Text>
      </Card>
      <Button label="시작" onPress={goToConsent} />
      <Button label="데모로 보기" onPress={goToConsent} variant="secondary" />
    </Page>
  );
}
