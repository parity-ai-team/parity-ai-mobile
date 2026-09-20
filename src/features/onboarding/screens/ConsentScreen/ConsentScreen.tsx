import { Page } from '@/shared/ui/Page/Page';
import { router } from 'expo-router';
import { Text } from 'react-native';

import { Button, useTheme } from '@/shared/ui';

import { ConsentItem } from '../../components/ConsentItem';
import { useOnboardingSession } from '../../OnboardingSessionContext';
import { createStyles } from './ConsentScreen.styles';

// S02 동의 화면. docs/frontend.md: 금융·출산일정·가구구조 동의를 각각 분리된
// 체크로 받고, 철회 안내를 포함하며, 모두 동의해야 다음으로 진행할 수 있다.
export default function ConsentScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { consent, setConsent, allConsentsGranted } = useOnboardingSession();

  const goToScenario = () => router.push('/scenario');

  return (
    <Page contentContainerStyle={styles.content}>
      <Text style={styles.title}>동의</Text>
      <Text style={styles.intro}>
        다음 정보를 12개월 현금흐름 비교에 사용하려면 각 항목에 동의해 주세요.
      </Text>

      <ConsentItem
        label="금융 정보 동의"
        description="가용 현금, 수입, 카드·대출·보험 납부 일정을 계산에 사용하는 데 동의해요."
        checked={consent.financialInfo}
        onToggle={(next) => setConsent('financialInfo', next)}
        testID="consent-financial-info"
      />
      <ConsentItem
        label="출산 일정 동의"
        description="출산 예정월과 순서 정보를 일정 기반 비교에 사용하는 데 동의해요."
        checked={consent.birthSchedule}
        onToggle={(next) => setConsent('birthSchedule', next)}
        testID="consent-birth-schedule"
      />
      <ConsentItem
        label="가구 구조 동의"
        description="가구 구성(동거 가족 수 등) 정보를 대안 비교에 사용하는 데 동의해요."
        checked={consent.householdStructure}
        onToggle={(next) => setConsent('householdStructure', next)}
        testID="consent-household-structure"
      />

      <Text style={styles.withdrawalNotice}>
        동의는 언제든 철회할 수 있어요. 철회하면 해당 정보 처리를 중단하고, 근거 화면에서 삭제를
        요청할 수 있어요.
      </Text>

      <Button label="다음" onPress={goToScenario} disabled={!allConsentsGranted} />
    </Page>
  );
}
