import type { CashflowPoint } from '@/shared/types';

import { buildTraceId } from './shared';

type MonthOverride = Partial<Omit<CashflowPoint, 'period'>> & { period: string };

// 매 시나리오마다 12개월치 CashflowPoint를 손으로 다 적지 않기 위한 헬퍼.
// startMonth('YYYY-MM')부터 12개월의 period를 만들고, baseline 값 위에
// overrides로 지정한 달만 덮어쓴다. startMonth가 연말 근처면 다음 해로
// 자연스럽게 넘어간다(예: 2027-08 시작 → ... → 2028-07). trace_ids는 실제
// 계약(docs/api/analysis-response-example.json)처럼 매 포인트마다 채운다 —
// overrides에서 지정하면 그 값이 우선한다.
export function buildCashflow(
  startMonth: string,
  scenarioSlug: string,
  baseline: Omit<CashflowPoint, 'period' | 'trace_ids'>,
  overrides: MonthOverride[] = [],
): CashflowPoint[] {
  const periods = generateMonths(startMonth, 12);
  const overrideByPeriod = new Map(overrides.map((override) => [override.period, override]));

  return periods.map((period) => ({
    period,
    ...baseline,
    trace_ids: [buildTraceId(scenarioSlug, 'cashflow', period)],
    ...overrideByPeriod.get(period),
  }));
}

export function generateMonths(startMonth: string, count: number): string[] {
  const [startYear, startMonthNumber] = startMonth.split('-').map(Number);

  return Array.from({ length: count }, (_, index) => {
    const zeroBasedMonth = startMonthNumber - 1 + index;
    const year = startYear + Math.floor(zeroBasedMonth / 12);
    const month = (zeroBasedMonth % 12) + 1;
    return `${year}-${String(month).padStart(2, '0')}`;
  });
}
