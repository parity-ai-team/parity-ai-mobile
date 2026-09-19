import { Text, View } from 'react-native';

import type { LimitationCode } from '@/shared/types';

import { useTheme } from '../theme';
import { getLimitationLabel } from './labels';
import { createStyles } from './LimitationsNotice.styles';

export interface LimitationsNoticeProps {
  limitations: readonly LimitationCode[];
  testID?: string;
}

// docs/decisions/result-usable-status.md 후속 조치: limited 상태를 오류로
// 보이지 않게, 사용한 가정을 한국어 안내 문구로 보여준다. limitations가
// 비어 있으면 아무것도 그리지 않는다(빈 배지 방지).
export function LimitationsNotice({ limitations, testID }: LimitationsNoticeProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (limitations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} testID={testID}>
      {limitations.map((code) => (
        <Text key={code} style={styles.item}>
          {getLimitationLabel(code)}
        </Text>
      ))}
    </View>
  );
}
