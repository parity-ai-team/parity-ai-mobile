import { StyleSheet } from 'react-native';

import type { Theme } from '../theme';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      borderWidth: 1,
    },
    chipLabel: {
      ...theme.typography.bodySmall,
    },
    // 신뢰도(level): 정보 성격이라 severity 팔레트를 그대로 재사용한다.
    levelHigh: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.success,
    },
    levelHighLabel: { color: theme.colors.success },
    levelMedium: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.severityWarning,
    },
    levelMediumLabel: { color: theme.colors.severityWarning },
    levelLow: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.severityCritical,
    },
    levelLowLabel: { color: theme.colors.severityCritical },
    // 출처(source): user_confirmed(성공/초록)와 assumed(경고/주황)를
    // 반대쪽 색으로 둬서 절대 헷갈리지 않게 한다.
    sourceUserConfirmed: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    sourceUserConfirmedLabel: { color: theme.colors.textInverse },
    sourceAssumed: {
      backgroundColor: theme.colors.severityWarning,
      borderColor: theme.colors.severityWarning,
    },
    sourceAssumedLabel: { color: theme.colors.textInverse },
    sourceSynthetic: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.dataModeSynthetic,
    },
    sourceSyntheticLabel: { color: theme.colors.dataModeSynthetic },
    sourceNeutral: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
    },
    sourceNeutralLabel: { color: theme.colors.textSecondary },
  });
}
