import { Page } from '@/shared/ui/Page/Page';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
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

import { DemoPrefillNotice } from '../../components/DemoPrefillNotice/DemoPrefillNotice';
import { useFinancialInputSession } from '../../FinancialInputSessionContext';
import {
  BOOLEAN_CHOICE_OPTIONS,
  EMPTY_PLAN_FORM_VALUES,
  fromEmploymentPlanInput,
  fromStressInput,
  planFormSchema,
  toEmploymentPlanInput,
  toStressInput,
  type PlanFormValues,
} from '../../schemas';
import { createStyles } from './PlanScreen.styles';

// S06 계획 화면. docs/api/openapi-1.5.0.json EmploymentPlanInput(leave_start,
// leave_months)과 StressInput(income_delay_weeks, child_support_missed)
// 필드 그대로 받되, 직접 입력에서는 없음·0도 사용자가 명시적으로 확인한다.
export default function PlanScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { draft, origin, updatePlan, updateStress } = useFinancialInputSession();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      plan:
        Object.keys(draft.plan).length > 0
          ? fromEmploymentPlanInput(draft.plan)
          : EMPTY_PLAN_FORM_VALUES.plan,
      stress:
        Object.keys(draft.stress).length > 0
          ? fromStressInput(draft.stress)
          : EMPTY_PLAN_FORM_VALUES.stress,
    },
  });
  const hasLeavePlan = useWatch({ control, name: 'plan.has_leave_plan' });

  // HouseholdScreen과 같은 이유의 안전망 — draft.plan/draft.stress가 마운트
  // 이후 (재)채워지면 폼도 같이 맞춘다.
  useEffect(() => {
    if (Object.keys(draft.plan).length > 0 || Object.keys(draft.stress).length > 0) {
      reset({
        plan:
          Object.keys(draft.plan).length > 0
            ? fromEmploymentPlanInput(draft.plan)
            : EMPTY_PLAN_FORM_VALUES.plan,
        stress:
          Object.keys(draft.stress).length > 0
            ? fromStressInput(draft.stress)
            : EMPTY_PLAN_FORM_VALUES.stress,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.plan, draft.stress]);

  const onSubmit = handleSubmit((values) => {
    updatePlan(toEmploymentPlanInput(values.plan));
    updateStress(toStressInput(values.stress));
    router.push('/review');
  });

  return (
    <Page
      wide
      contentContainerStyle={styles.content}
      footer={<Button label="다음" onPress={onSubmit} />}
    >
      <Columns>
        <Column width={theme.layout.sidebarWidth}>
          <StepProgress current="계획" />
        </Column>
        <Column>
          <Text style={styles.title}>휴직·소득 계획</Text>
          <Text style={styles.intro}>해당 사항이 없어도 0 또는 아니오를 직접 선택해 주세요.</Text>
          {origin === 'demo' ? <DemoPrefillNotice /> : null}

          <Card>
            <Text style={styles.sectionTitle}>휴직 계획</Text>
            <Controller
              control={control}
              name="plan.has_leave_plan"
              render={({ field }) => (
                <ChoiceField
                  label="휴직 계획이 있나요?"
                  options={BOOLEAN_CHOICE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.plan?.has_leave_plan?.message}
                  testID="plan-has-leave-plan"
                />
              )}
            />
            {hasLeavePlan === 'true' ? (
              <>
                <Controller
                  control={control}
                  name="plan.leave_start"
                  render={({ field }) => (
                    <TextField
                      label="휴직 시작월"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="예: 2027-01"
                      hint="연도-월 형식으로 입력해요."
                      error={errors.plan?.leave_start?.message}
                      testID="plan-leave-start"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="plan.leave_months"
                  render={({ field }) => (
                    <TextField
                      label="휴직 개월 수"
                      unit="개월"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="1~12"
                      keyboardType="number-pad"
                      hint="1~12개월 사이로 입력해요."
                      error={errors.plan?.leave_months?.message}
                      testID="plan-leave-months"
                    />
                  )}
                />
              </>
            ) : null}
          </Card>
          <Card>
            <Text style={styles.sectionTitle}>소득·지원금 변수</Text>
            <Controller
              control={control}
              name="stress.income_delay_weeks"
              render={({ field }) => (
                <TextField
                  label="예상 소득 지연 주 수"
                  unit="주"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="0~52"
                  keyboardType="number-pad"
                  hint="지연 가능성이 없으면 0을 입력해요."
                  error={errors.stress?.income_delay_weeks?.message}
                  testID="stress-income-delay-weeks"
                />
              )}
            />
            <Controller
              control={control}
              name="stress.child_support_missed"
              render={({ field }) => (
                <ChoiceField
                  label="양육비 미수령 가능성이 있나요?"
                  options={BOOLEAN_CHOICE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.stress?.child_support_missed?.message}
                  testID="stress-child-support-missed"
                />
              )}
            />
          </Card>
        </Column>
      </Columns>
    </Page>
  );
}
