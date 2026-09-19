import { ScrollView, Text } from 'react-native';

import { useFinancialInputSession } from '@/features/financial-input';
import { useTheme } from '@/shared/ui';

import { createStyles } from './ResultPlaceholderScreen.styles';

// S09 결과 화면(/analysis/result)의 자리표시. 로드맵 #7(S04~S07 입력 화면) 범위는
// POST /v1/analyses 호출까지다 — 현금흐름·위험·대안 표시는 이후 PR에서
// 구현한다. 여기서는 분석이 생성됐다는 것과 analysis_id만 확인시켜 준다.
export default function ResultPlaceholderScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { analysisResponse } = useFinancialInputSession();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>분석을 시작했어요</Text>
      {analysisResponse ? (
        <Text style={styles.body}>
          분석 ID: {analysisResponse.analysis_id}
          {'\n'}상태: {analysisResponse.status}
        </Text>
      ) : (
        <Text style={styles.body}>
          분석 정보를 찾을 수 없어요. 검토 화면에서 다시 시작해 주세요.
        </Text>
      )}
      <Text style={styles.body}>현금흐름·위험·대안 결과 화면은 다음 PR에서 구현돼요.</Text>
    </ScrollView>
  );
}
