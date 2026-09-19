import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text } from 'react-native';

import { Button, TextField, useTheme } from '@/shared/ui';

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
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>금융 정보</Text>
      <Text style={styles.intro}>가용 현금과 매달 들어오고 나가는 금액을 원 단위로 입력해요.</Text>

      <Controller
        control={control}
        name="financial.current_cash_krw"
        render={({ field }) => (
          <TextField
            label="가용 현금"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            placeholder="예: 12000000"
            keyboardType="numeric"
            hint="원 단위 정수로 입력해요."
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
            label="비상금 최소 기준 (선택)"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            placeholder="예: 6000000"
            keyboardType="numeric"
            hint="비워두면 서버가 기본값을 적용해요."
            error={errors.financial?.emergency_floor_krw?.message}
            testID="financial-emergency-floor"
          />
        )}
      />

      <Controller
        control={control}
        name="financial.monthly_income_krw"
        render={({ field }) => (
          <TextField
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
            label="월 재량 지출 (선택)"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            placeholder="예: 500000"
            keyboardType="numeric"
            hint="비워두면 0으로 처리해요."
            error={errors.financial?.monthly_discretionary_krw?.message}
            testID="financial-monthly-discretionary"
          />
        )}
      />

      <Button label="다음" onPress={onSubmit} />
    </ScrollView>
  );
}
