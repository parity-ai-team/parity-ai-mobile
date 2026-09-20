import { Text, View } from 'react-native';

import { AppIcon, useTheme } from '@/shared/ui';

import { createStyles } from './DemoPrefillNotice.styles';

export function DemoPrefillNotice() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container} accessibilityRole="summary" testID="demo-prefill-notice">
      <View style={styles.icon}>
        <AppIcon
          name="database"
          size={theme.layout.sectionIconSize}
          color={theme.colors.brand}
          accentColor={theme.colors.brandSoft}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>데모 데이터로 미리 채웠어요</Text>
        <Text style={styles.body}>
          현재 화면에는 시연용 데이터가 들어 있어요. 실제 서비스에서는 처음 동의한 범위 안에서 연동
          가능한 정보를 불러와 자동으로 채우고, 사용자가 직접 확인·수정할 수 있어요.
        </Text>
      </View>
    </View>
  );
}
