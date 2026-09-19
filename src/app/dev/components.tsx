import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { firstBirthFixture } from '@/mocks/scenarios/first-birth';
import { pastMeFixture } from '@/mocks/scenarios/past-me';
import { singleParentFixture, singleParentStressedFixture } from '@/mocks/scenarios/single-parent';
import type { AnalysisResponse } from '@/shared/types';
import { CashFlowChart, ConfidenceTag, RiskCauseCard, useTheme, type Theme } from '@/shared/ui';

// 개발용 컴포넌트 미리보기. __DEV__가 아니면 아무것도 렌더링하지 않는다 —
// 프로덕션 번들 진입점(src/app/index.tsx 등)에서도 이 라우트로 링크하지
// 않는다. 로드맵 #9(핵심 UI 컴포넌트) 검토용 임시 화면이라 커밋 여부는
// 별도로 확인받았다.
const SCENARIOS: { title: string; fixture: AnalysisResponse }[] = [
  { title: '초산 · 맞벌이 (first_birth)', fixture: firstBirthFixture },
  { title: '경산 · 외벌이 전환 (past_me)', fixture: pastMeFixture },
  { title: '경산 · 한부모 — 기본 (single_parent)', fixture: singleParentFixture },
  {
    title: '경산 · 한부모 — 스트레스 토글 (single_parent, stressed)',
    fixture: singleParentStressedFixture,
  },
];

function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    title: {
      ...theme.typography.headingSmall,
      color: theme.colors.textPrimary,
    },
    notice: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    sectionLabel: {
      ...theme.typography.labelMedium,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.sm,
    },
    confidenceGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    scenario: {
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    scenarioTitle: {
      ...theme.typography.headingSmall,
      color: theme.colors.textPrimary,
    },
    footerSpacer: {
      height: theme.spacing.xxxl,
    },
  });
}

function ScenarioPreview({ title, fixture }: { title: string; fixture: AnalysisResponse }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const result = fixture.result;

  if (!result) {
    return null;
  }

  return (
    <View style={styles.scenario}>
      <Text style={styles.scenarioTitle}>{title}</Text>

      <Text style={styles.sectionLabel}>CashFlowChart (선택된 위험월: {selectedPeriod ?? '없음'})</Text>
      <CashFlowChart
        points={result.cashflow}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        testID={`chart-${fixture.analysis_id}`}
      />

      <Text style={styles.sectionLabel}>RiskCauseCard</Text>
      {result.risks.map((risk) => (
        <RiskCauseCard
          key={`${fixture.analysis_id}-${risk.period}`}
          risk={risk}
          onPressEvidence={(traceId) => console.log('[dev] onPressEvidence', traceId)}
        />
      ))}
    </View>
  );
}

export default function DevComponentsPreviewScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (!__DEV__) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>컴포넌트 미리보기 (개발용)</Text>
      <Text style={styles.notice}>
        이 화면은 __DEV__에서만 보이고 프로덕션에서는 렌더링되지 않아요. 아무 화면에서도 이
        경로로 링크하지 않아요.
      </Text>

      <Text style={styles.sectionLabel}>ConfidenceTag — 모든 신뢰도 × 출처 조합</Text>
      <View style={styles.confidenceGrid}>
        {(['high', 'medium', 'low'] as const).map((level) =>
          (['user_confirmed', 'synthetic', 'policy_rule', 'derived', 'assumed'] as const).map(
            (source) => <ConfidenceTag key={`${level}-${source}`} level={level} source={source} />,
          ),
        )}
      </View>

      {SCENARIOS.map((scenario) => (
        <ScenarioPreview
          key={scenario.fixture.analysis_id}
          title={scenario.title}
          fixture={scenario.fixture}
        />
      ))}

      <View style={styles.footerSpacer} />
    </ScrollView>
  );
}
