import { Page } from '@/shared/ui/Page/Page';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { apiRequest, ApiError, endpoints } from '@/shared/api';
import { formatKrw } from '@/shared/format';
import type { AnalysisResponse } from '@/shared/types';
import { Card, Chip, StepProgress, Button, useTheme, type Theme } from '@/shared/ui';

import { useFinancialInputSession } from '../../FinancialInputSessionContext';
import {
  buildAnalysisCreateRequest,
  isFinancialComplete,
  isHouseholdComplete,
  isPlanComplete,
  isStressComplete,
  mapFieldErrorsByPath,
} from '../../lib';
import { createStyles } from './ReviewScreen.styles';

const HOUSEHOLD_TYPE_LABEL: Record<string, string> = {
  two_adult: '두 성인(맞벌이·외벌이)',
  single_parent: '한부모',
};

// S07 검토 화면. docs/frontend.md "화면별 행동 규칙"에 맞춰 값을 다시
// 계산하지 않고 입력값을 그대로 보여준 뒤 mock 모드의 POST /v1/analyses를
// 호출한다. 성공하면 응답을 세션에 보관하고 S08 게이트(/analysis)로 이동한다
// — 백엔드가 동기 응답이라 이미 응답을 들고 있지만, S08이 "분석 중" 표시와
// 상태 확인을 한 번 거친 뒤 /analysis/result로 넘긴다.
export default function ReviewScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const session = useFinancialInputSession();
  const { draft, origin, scenarioId, isFieldAssumed, setAnalysisResponse } = session;

  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { household, financial, plan, stress } = draft;
  const incomplete =
    !isHouseholdComplete(household) ||
    !isFinancialComplete(financial) ||
    !isPlanComplete(plan) ||
    !isStressComplete(stress);

  if (incomplete) {
    return (
      <Page contentContainerStyle={styles.content}>
        <Text style={styles.title}>검토</Text>
        <Text style={styles.incompleteNotice}>
          아직 채우지 않은 입력이 있어요. 가구 정보부터 다시 확인해 주세요.
        </Text>
        <Button label="가구 정보로 이동" onPress={() => router.push('/household')} />
      </Page>
    );
  }

  const onSubmit = async () => {
    setSubmitting(true);
    setGeneralError(null);
    setFieldErrors({});

    try {
      const body = buildAnalysisCreateRequest({
        origin,
        scenarioId,
        household,
        financial,
        plan,
        stress,
      });
      const { data } = await apiRequest<AnalysisResponse>({
        method: 'POST',
        path: endpoints.analyses(),
        body,
      });
      setAnalysisResponse(data);
      // 중첩 index 라우트(src/app/analysis/index.tsx)는 파일 경로가 아니라
      // 부모 경로 "/analysis"로 이동한다 — S08 게이트로 향하는 경로다.
      router.push('/analysis');
    } catch (error) {
      if (error instanceof ApiError) {
        setGeneralError(error.message);
        setFieldErrors(mapFieldErrorsByPath(error.envelope.error.field_errors ?? []));
      } else {
        setGeneralError('분석을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page
      contentContainerStyle={styles.content}
      footer={
        <Button
          label={submitting ? '분석 시작 중...' : '분석 시작'}
          onPress={onSubmit}
          disabled={submitting}
        />
      }
    >
      <StepProgress current="검토" />
      <Text style={styles.title}>검토</Text>
      <Text style={styles.intro}>
        입력한 값을 확인해 주세요. 가정값은 비워두어 서버 기본값이 적용될 값이에요.
      </Text>

      <Card>
        <Text style={styles.sectionTitle}>가구 정보</Text>
        <ReviewRow
          theme={theme}
          label="출산 예정월"
          value={household.expected_month}
          assumed={isFieldAssumed('household', 'expected_month')}
          error={fieldErrors['household.expected_month']}
        />
        <ReviewRow
          theme={theme}
          label="출산 순서"
          value={String(household.birth_order)}
          assumed={isFieldAssumed('household', 'birth_order')}
          error={fieldErrors['household.birth_order']}
        />
        <ReviewRow
          theme={theme}
          label="가족 구조"
          value={HOUSEHOLD_TYPE_LABEL[household.household_type] ?? household.household_type}
          assumed={isFieldAssumed('household', 'household_type')}
          error={fieldErrors['household.household_type']}
        />
        <ReviewRow
          theme={theme}
          label="부양가족 수"
          value={String(household.dependents)}
          assumed={isFieldAssumed('household', 'dependents')}
          error={fieldErrors['household.dependents']}
        />
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>금융 정보</Text>
        <ReviewRow
          theme={theme}
          label="가용 현금"
          value={formatKrw(financial.current_cash_krw)}
          assumed={isFieldAssumed('financial', 'current_cash_krw')}
          error={fieldErrors['financial.current_cash_krw']}
        />
        <ReviewRow
          theme={theme}
          label="비상금 최소 기준"
          value={
            financial.emergency_floor_krw === null
              ? '서버 기본값 사용'
              : formatKrw(financial.emergency_floor_krw)
          }
          assumed={isFieldAssumed('financial', 'emergency_floor_krw')}
          error={fieldErrors['financial.emergency_floor_krw']}
        />
        <ReviewRow
          theme={theme}
          label="월 수입"
          value={formatKrw(financial.monthly_income_krw)}
          assumed={isFieldAssumed('financial', 'monthly_income_krw')}
          error={fieldErrors['financial.monthly_income_krw']}
        />
        <ReviewRow
          theme={theme}
          label="고정 지급 의무"
          value={formatKrw(financial.fixed_obligations_krw)}
          assumed={isFieldAssumed('financial', 'fixed_obligations_krw')}
          error={fieldErrors['financial.fixed_obligations_krw']}
        />
        <ReviewRow
          theme={theme}
          label="월 재량 지출"
          value={formatKrw(financial.monthly_discretionary_krw)}
          assumed={isFieldAssumed('financial', 'monthly_discretionary_krw')}
          error={fieldErrors['financial.monthly_discretionary_krw']}
        />
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>휴직·소득 계획</Text>
        <ReviewRow
          theme={theme}
          label="휴직 시작월"
          value={plan.leave_start === null ? '휴직 없음' : plan.leave_start}
          assumed={isFieldAssumed('plan', 'leave_start')}
          error={fieldErrors['plan.leave_start']}
        />
        <ReviewRow
          theme={theme}
          label="휴직 개월 수"
          value={`${plan.leave_months}개월`}
          assumed={isFieldAssumed('plan', 'leave_months')}
          error={fieldErrors['plan.leave_months']}
        />
        <ReviewRow
          theme={theme}
          label="예상 소득 지연"
          value={`${stress.income_delay_weeks}주`}
          assumed={isFieldAssumed('stress', 'income_delay_weeks')}
          error={fieldErrors['stress.income_delay_weeks']}
        />
        <ReviewRow
          theme={theme}
          label="양육비 미수령 가능성"
          value={stress.child_support_missed ? '예' : '아니오'}
          assumed={isFieldAssumed('stress', 'child_support_missed')}
          error={fieldErrors['stress.child_support_missed']}
        />
      </Card>
      {generalError ? (
        <Text style={styles.generalError} accessibilityRole="alert">
          {`오류: ${generalError}`}
        </Text>
      ) : null}
    </Page>
  );
}

interface ReviewRowProps {
  theme: Theme;
  label: string;
  value: string;
  assumed: boolean;
  error?: string;
}

// 값 하나가 "사용자 입력"인지 "가정값"인지 텍스트로 구분해 보여준다
// (docs/decisions/result-usable-status.md 성격의 텍스트 기반 구분과 동일한
// 원칙: 색이 아니라 문구로 구분한다).
function ReviewRow({ theme, label, value, assumed, error }: ReviewRowProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
      <Chip label={assumed ? '가정값' : '사용자 입력'} tone={assumed ? 'warning' : 'brand'} />
      {error ? (
        <Text style={styles.rowError} accessibilityRole="alert">
          {`오류: ${error}`}
        </Text>
      ) : null}
    </View>
  );
}
