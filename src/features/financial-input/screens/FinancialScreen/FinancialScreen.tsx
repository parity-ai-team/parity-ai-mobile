import { Page } from '@/shared/ui/Page/Page';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';

import { Card, Columns, Column, StepProgress, Button, TextField, useTheme } from '@/shared/ui';

import { useFinancialInputSession } from '../../FinancialInputSessionContext';
import {
  EMPTY_FINANCIAL_FORM_VALUES,
  financialFormSchema,
  fromFinancialInput,
  toFinancialInput,
  type FinancialFormValues,
} from '../../schemas';
import { createStyles } from './FinancialScreen.styles';

// S05 금융 화면. docs/api/openapi-1.5.0.json FinancialInput 필드 그대로
// 받는다: current_cash_krw, emergency_floor_krw(선택), monthly_income_krw,
// fixed_obligations_krw, monthly_discretionary_krw(선택).
export default function FinancialScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { draft, updateFinancial } = useFinancialInputSession();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FinancialFormValues>({
    resolver: zodResolver(financialFormSchema),
    defaultValues: {
      financial:
        Object.keys(draft.financial).length > 0
          ? fromFinancialInput(draft.financial)
          : EMPTY_FINANCIAL_FORM_VALUES.financial,
    },
  });

  // HouseholdScreen과 같은 이유의 안전망 — draft.financial이 마운트 이후
  // (재)채워지면 폼도 같이 맞춘다.
  useEffect(() => {
    if (Object.keys(draft.financial).length > 0) {
      reset({ financial: fromFinancialInput(draft.financial) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.financial]);

  const onSubmit = handleSubmit((values) => {
    updateFinancial(toFinancialInput(values.financial));
    router.push('/plan');
  });

  return (
    <Page
      wide
      contentContainerStyle={styles.content}
      footer={<Button label="다음" onPress={onSubmit} />}
    >
      <Columns>
        <Column width={theme.layout.sidebarWidth}>
          <StepProgress current="금융" />
        </Column>
        <Column>
          <Text style={styles.title}>금융 정보</Text>
          <Text style={styles.intro}>
            가용 현금과 매달 들어오고 나가는 금액을 원 단위로 입력해요.
          </Text>

          <Card>
            <Controller
              control={control}
              name="financial.current_cash_krw"
              render={({ field }) => (
                <TextField
                  unit="원"
                  label="가용 현금"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="예: 12000000"
                  keyboardType="numeric"
                  hint="예금 등 지금 바로 쓸 수 있는 돈을 입력해요."
                  error={errors.financial?.current_cash_krw?.message}
                  testID="financial-current-cash"
                />
              )}
            />

            <Controller
              control={control}
              name="financial.emergency_floor_krw"
              render={({ field }) => (
                <TextField
                  unit="원"
                  label="비상금 최소 기준 (선택)"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="예: 6000000"
                  keyboardType="numeric"
                  hint="생활비로 꼭 남겨둘 돈이에요. 비워두면 기본값을 적용해요."
                  error={errors.financial?.emergency_floor_krw?.message}
                  testID="financial-emergency-floor"
                />
              )}
            />
          </Card>
          <Card>
            <Controller
              control={control}
              name="financial.monthly_income_krw"
              render={({ field }) => (
                <TextField
                  unit="원"
                  label="월 수입"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="예: 5800000"
                  keyboardType="numeric"
                  error={errors.financial?.monthly_income_krw?.message}
                  testID="financial-monthly-income"
                />
              )}
            />

            <Controller
              control={control}
              name="financial.fixed_obligations_krw"
              render={({ field }) => (
                <TextField
                  unit="원"
                  label="카드·대출·보험 등 고정 지급 의무"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="예: 3100000"
                  keyboardType="numeric"
                  error={errors.financial?.fixed_obligations_krw?.message}
                  testID="financial-fixed-obligations"
                />
              )}
            />

            <Controller
              control={control}
              name="financial.monthly_discretionary_krw"
              render={({ field }) => (
                <TextField
                  unit="원"
                  label="월 재량 지출 (선택)"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="예: 500000"
                  keyboardType="numeric"
                  hint="외식·쇼핑처럼 조절할 수 있는 지출이에요. 비워두면 0원이에요."
                  error={errors.financial?.monthly_discretionary_krw?.message}
                  testID="financial-monthly-discretionary"
                />
              )}
            />
          </Card>
        </Column>
      </Columns>
    </Page>
  );
}
