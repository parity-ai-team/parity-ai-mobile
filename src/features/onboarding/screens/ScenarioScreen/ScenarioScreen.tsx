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
const MANUAL_OPTION_API_DESCRIPTION = '거래 CSV를 등록하고 내 정보로 분석해요.';

// S03 시나리오 화면. 직접 입력은 api 모드에서 CSV 등록(/dataset)을 먼저
// 거치고, 데모 또는 mock 모드 직접 입력은 기존 가구 화면(/household)으로
// 이동한다. features/financial-input은 데모 선택이면 default_analysis로 폼을 채운다.
export default function ScenarioScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { scenarioSelection, selectScenario } = useOnboardingSession();
  const usesDatasetUpload = getAppMode() === 'api';

  const goToNext = () => {
    if (usesDatasetUpload && scenarioSelection?.type === 'manual') {
      router.push('/dataset');
      return;
    }
    router.push('/household');
  };

  return (
    <Page
      wide
      contentContainerStyle={styles.content}
      footer={<Button label="다음" onPress={goToNext} disabled={scenarioSelection === null} />}
    >
      <Text style={styles.title}>시나리오 선택</Text>
      <Text style={styles.intro}>내 상황과 가까운 데모를 선택하거나, 직접 입력해 비교해요.</Text>

      <ScenarioCard
        title={MANUAL_OPTION_TITLE}
        description={usesDatasetUpload ? MANUAL_OPTION_API_DESCRIPTION : MANUAL_OPTION_DESCRIPTION}
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
    </Page>
  );
}
