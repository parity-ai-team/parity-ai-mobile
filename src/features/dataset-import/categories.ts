import type { TransactionCategory } from '@/shared/types';
import type { ChoiceFieldOption } from '@/shared/ui';

export const TRANSACTION_CATEGORY_LABELS: Record<TransactionCategory, string> = {
  income: '소득',
  housing: '주거',
  food: '식비',
  transport: '교통',
  healthcare: '의료',
  childcare: '육아',
  finance: '금융',
  insurance: '보험',
  utilities: '공과금',
  discretionary: '선택 지출',
  benefit: '지원금',
  other: '기타',
  savings: '저축',
};

export const TRANSACTION_CATEGORY_OPTIONS = Object.entries(TRANSACTION_CATEGORY_LABELS).map(
  ([value, label]) => ({ value: value as TransactionCategory, label }),
) satisfies readonly ChoiceFieldOption<TransactionCategory>[];
