import { Page } from '@/shared/ui/Page/Page';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';

import {
  Card,
  Columns,
  Column,
  StepProgress,
  Button,
  ChoiceField,
  TextField,
  useTheme,
} from '@/shared/ui';

import { useFinancialInputSession } from '../../FinancialInputSessionContext';
import {
  EMPTY_HOUSEHOLD_FORM_VALUES,
  fromHouseholdInput,
  HOUSEHOLD_TYPE_OPTIONS,
  householdFormSchema,
  toHouseholdInput,
  type HouseholdFormValues,
} from '../../schemas';
import { createStyles } from './HouseholdScreen.styles';

// S04 가구 화면. docs/api/openapi-1.5.0.json HouseholdInput 필드 그대로 받는다:
// expected_month, birth_order, household_type, dependents.
export default function HouseholdScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { draft, updateHousehold } = useFinancialInputSession();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HouseholdFormValues>({
    resolver: zodResolver(householdFormSchema),
    defaultValues: {
      household:
        Object.keys(draft.household).length > 0
          ? fromHouseholdInput(draft.household)
          : EMPTY_HOUSEHOLD_FORM_VALUES.household,
    },
  });

  // 온보딩(S03)의 데모 선택이 이 화면 마운트보다 늦게 반영되는 경우를 대비한
  // 안전망이다 — draft.household가 (재)채워지면 폼도 같이 맞춘다. 정상 흐름
  // (S03에서 고르고 나서 S04로 이동)에서는 마운트 시점 defaultValues로 이미
  // 충분하다.
  useEffect(() => {
    if (Object.keys(draft.household).length > 0) {
      reset({ household: fromHouseholdInput(draft.household) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.household]);

  const onSubmit = handleSubmit((values) => {
    updateHousehold(toHouseholdInput(values.household));
    router.push('/financial');
  });

  return (
    <Page
      wide
      contentContainerStyle={styles.content}
      footer={<Button label="다음" onPress={onSubmit} />}
    >
      <Columns>
        <Column width={theme.layout.sidebarWidth}>
          <StepProgress current="가구" />
        </Column>
        <Column>
          <Text style={styles.title}>가구 정보</Text>
          <Text style={styles.intro}>출산 예정과 가족 구성을 알려주세요.</Text>

          <Card>
            <Controller
              control={control}
              name="household.expected_month"
              render={({ field }) => (
                <TextField
                  label="출산 예정월"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="예: 2027-03"
                  hint="연도-월 형식으로 입력해요."
                  error={errors.household?.expected_month?.message}
                  testID="household-expected-month"
                />
              )}
            />

            <Controller
              control={control}
              name="household.birth_order"
              render={({ field }) => (
                <TextField
                  label="출산 순서"
                  unit="번째"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="예: 1"
                  keyboardType="number-pad"
                  error={errors.household?.birth_order?.message}
                  testID="household-birth-order"
                />
              )}
            />
          </Card>
          <Card>
            <Controller
              control={control}
              name="household.household_type"
              render={({ field }) => (
                <ChoiceField
                  label="가족 구조"
                  options={HOUSEHOLD_TYPE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.household?.household_type?.message}
                  testID="household-type"
                />
              )}
            />

            <Controller
              control={control}
              name="household.dependents"
              render={({ field }) => (
                <TextField
                  label="부양가족 수"
                  unit="명"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="예: 0"
                  keyboardType="number-pad"
                  error={errors.household?.dependents?.message}
                  testID="household-dependents"
                />
              )}
            />
          </Card>
        </Column>
      </Columns>
    </Page>
  );
}
