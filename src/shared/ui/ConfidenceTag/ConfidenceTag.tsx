import { Text, View } from 'react-native';

import type { ConfidenceLevel, DataSource } from '@/shared/types';

import { useTheme } from '../theme';
import { createStyles } from './ConfidenceTag.styles';
import { CONFIDENCE_LEVEL_LABEL, DATA_SOURCE_LABEL } from './labels';

export interface ConfidenceTagProps {
  /** 없으면 출처 칩만 보여준다(예: S12 근거 화면의 EvidenceInputFact는 신뢰도 없이 출처만 내려온다). */
  level?: ConfidenceLevel;
  source: DataSource;
  testID?: string;
}

// docs/frontend.md "핵심 UI 컴포넌트": 신뢰도(level)와 출처(source)를 색+
// 텍스트로 표시한다. source의 assumed/user_confirmed는 의미가 정반대라
// (labels.ts 참고) 색도 반대로 두고 라벨도 "가정값(미확인)"처럼 뜻을
// 분명히 적는다.
export function ConfidenceTag({ level, source, testID }: ConfidenceTagProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const levelStyle = level
    ? {
        high: styles.levelHigh,
        medium: styles.levelMedium,
        low: styles.levelLow,
      }[level]
    : undefined;
  const levelLabelStyle = level
    ? {
        high: styles.levelHighLabel,
        medium: styles.levelMediumLabel,
        low: styles.levelLowLabel,
      }[level]
    : undefined;

  const sourceStyle = {
    user_confirmed: styles.sourceUserConfirmed,
    assumed: styles.sourceAssumed,
    synthetic: styles.sourceSynthetic,
    policy_rule: styles.sourceNeutral,
    derived: styles.sourceNeutral,
  }[source];
  const sourceLabelStyle = {
    user_confirmed: styles.sourceUserConfirmedLabel,
    assumed: styles.sourceAssumedLabel,
    synthetic: styles.sourceSyntheticLabel,
    policy_rule: styles.sourceNeutralLabel,
    derived: styles.sourceNeutralLabel,
  }[source];

  const levelLabel = level ? `신뢰도 ${CONFIDENCE_LEVEL_LABEL[level]}` : null;
  const sourceLabel = DATA_SOURCE_LABEL[source];

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityLabel={levelLabel ? `${levelLabel}, ${sourceLabel}` : sourceLabel}
    >
      {levelLabel ? (
        <View style={[styles.chip, levelStyle]} testID={testID && `${testID}-level`}>
          <Text style={[styles.chipLabel, levelLabelStyle]}>{levelLabel}</Text>
        </View>
      ) : null}
      <View style={[styles.chip, sourceStyle]} testID={testID && `${testID}-source`}>
        <Text style={[styles.chipLabel, sourceLabelStyle]}>{sourceLabel}</Text>
      </View>
    </View>
  );
}
