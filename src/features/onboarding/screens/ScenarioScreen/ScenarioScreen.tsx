import { ScrollView, Text } from 'react-native';

import { useTheme } from '@/shared/ui';

import { ScenarioCard } from '../../components/ScenarioCard';
import { useOnboardingSession } from '../../OnboardingSessionContext';
import { DEMO_SCENARIOS } from '../../scenarios';
import { createStyles } from './ScenarioScreen.styles';

const MANUAL_OPTION_TITLE = '직접 입력';
const MANUAL_OPTION_DESCRIPTION = '내 가구·소득·의무 정보를 직접 입력해 비교해요.';

// S03 시나리오 화면. docs/frontend.md: 직접 입력 또는 데모 3개 선택. 선택은
// 상태에만 반영한다 — 이후 입력 화면(S04)은 이번 PR 범위 밖이다.
export default function ScenarioScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { scenarioSelection, selectScenario } = useOnboardingSession();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>시나리오 선택</Text>
      <Text style={styles.intro}>내 상황과 가까운 데모를 선택하거나, 직접 입력해 비교해요.</Text>

      <ScenarioCard
        title={MANUAL_OPTION_TITLE}
        description={MANUAL_OPTION_DESCRIPTION}
        selected={scenarioSelection?.type === 'manual'}
        onPress={() => selectScenario({ type: 'manual' })}
        testID="scenario-card-manual"
      />

      {DEMO_SCENARIOS.map((scenario) => (
        <ScenarioCard
          key={scenario.scenario_id}
          title={scenario.title}
          description={scenario.description}
          selected={
            scenarioSelection?.type === 'demo' &&
            scenarioSelection.scenarioId === scenario.scenario_id
          }
          onPress={() => selectScenario({ type: 'demo', scenarioId: scenario.scenario_id })}
          testID={`scenario-card-demo-${scenario.scenario_id}`}
        />
      ))}
    </ScrollView>
  );
}
