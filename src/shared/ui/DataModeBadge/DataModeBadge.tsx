import { Text, View } from 'react-native';

import { AppIcon } from '../AppIcon';
import { useTheme } from '../theme';
import { createStyles } from './DataModeBadge.styles';

export type DataMode = 'synthetic' | 'verified' | 'assumed';

export interface DataModeBadgeProps {
  mode: DataMode;
  dataVersion: string;
}

// docs/frontend.md "핵심 UI 컴포넌트": synthetic/verified/assumed를 색+텍스트로
// 구분한다. 라벨 문구 자체가 모드마다 다르므로 색맹 사용자도 텍스트만으로
// 구분할 수 있다.
const MODE_LABEL: Record<DataMode, string> = {
  synthetic: '데모 데이터',
  verified: '검증된 데이터',
  assumed: '가정 적용 데이터',
};

// docs/frontend.md 화면 상단에 지속 표시하는 배지. 로직(DataModeBadge.tsx)과
// 스타일(DataModeBadge.styles.ts)을 분리한다. src/shared/ui/theme/README.md 참고.
export function DataModeBadge({ mode, dataVersion }: DataModeBadgeProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const dotColor = {
    synthetic: theme.colors.dataModeSynthetic,
    verified: theme.colors.dataModeVerified,
    assumed: theme.colors.dataModeAssumed,
  }[mode];
  const label = `${MODE_LABEL[mode]} · ${dataVersion}`;

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={label}
      testID="data-mode-badge"
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} testID="data-mode-badge-dot">
        <AppIcon
          name="database"
          size={theme.layout.badgeIconGlyphSize}
          color={theme.colors.textInverse}
          accentColor={theme.colors.brandSoft}
        />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
