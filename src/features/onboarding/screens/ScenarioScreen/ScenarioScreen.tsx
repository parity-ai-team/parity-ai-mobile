import { Page } from '@/shared/ui/Page/Page';
import { router } from 'expo-router';
import { Text } from 'react-native';

import { getAppMode } from '@/shared/api';
import { Button, useTheme } from '@/shared/ui';

import { ScenarioCard } from '../../components/ScenarioCard';
import { useOnboardingSession } from '../../OnboardingSessionContext';
import { DEMO_SCENARIOS } from '../../scenarios';
import { createStyles } from './ScenarioScreen.styles';

const MANUAL_OPTION_TITLE = '직접 입력';
const MANUAL_OPTION_DESCRIPTION = '내 가구·소득·의무 정보를 직접 입력해 비교해요.';
// api 모드는 dataset_id(CSV 업로드) 없이 직접 입력을 받아줄 방법이 없다
// (scenario_id·dataset_id 중 정확히 하나가 필수라 둘 다 없으면 422가 난다).
// CSV 업로드 화면은 아직 없어 지금은 비활성화하고 이유만 안내한다.
const MANUAL_OPTION_DISABLED_DESCRIPTION = 'CSV 업로드가 필요해 준비 중이에요.';

// S03 시나리오 화면. docs/frontend.md: 직접 입력 또는 데모 3개 선택. 선택하면
// S04 가구 화면(/household)으로 이동한다 — features/financial-input이 이
// scenarioSelection을 읽어 데모면 default_analysis로 폼을 미리 채운다.
export default function ScenarioScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { scenarioSelection, selectScenario } = useOnboardingSession();
  const isManualDisabled = getAppMode() === 'api';

  const goToHousehold = () => router.push('/household');

  return (
    <Page
      wide
      contentContainerStyle={styles.content}
      footer={<Button label="다음" onPress={goToHousehold} disabled={scenarioSelection === null} />}
    >
      <Text style={styles.title}>시나리오 선택</Text>
      <Text style={styles.intro}>내 상황과 가까운 데모를 선택하거나, 직접 입력해 비교해요.</Text>

      <ScenarioCard
        title={MANUAL_OPTION_TITLE}
        description={isManualDisabled ? MANUAL_OPTION_DISABLED_DESCRIPTION : MANUAL_OPTION_DESCRIPTION}
        selected={scenarioSelection?.type === 'manual'}
        onPress={() => selectScenario({ type: 'manual' })}
        disabled={isManualDisabled}
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
    </Page>
  );
}
