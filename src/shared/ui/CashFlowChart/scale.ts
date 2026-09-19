import type { CashflowPoint } from '@/shared/types';

// CashFlowChart의 좌표 계산만 모은 순수 함수 모음. 컴포넌트(CashFlowChart.tsx)는
// 이 함수들의 결과만 그리고, 여기서 값을 다시 계산하지 않는다 —
// docs/frontend.md "화면은 금액을 재계산하지 않는다"는 표시값(그리는 좌표)에도
// 그대로 적용된다: 입력 KRW 값 자체는 절대 바꾸지 않고, 화면 픽셀 위치로만
// 변환한다.

export interface ValueDomain {
  min: number;
  max: number;
}

// docs/frontend.md "차트 표시 규칙": 금액축은 0을 포함하고 음수 영역을 명확히
// 표시한다. confirmed_cash_krw·p20~p80·emergency_floor_krw 전부를 살펴서
// 실제 최솟값·최댓값을 찾는다(emergency_floor_krw는 계약상 포인트마다 다를
// 수 있어 각 점을 개별로 본다).
export function computeValueDomain(points: readonly CashflowPoint[]): ValueDomain {
  const values = points.flatMap((point) => [
    point.confirmed_cash_krw,
    point.p20_krw,
    point.p50_krw,
    point.p80_krw,
    point.emergency_floor_krw,
  ]);
  values.push(0);

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

// domain이 한 점으로 쪼그라들면(min === max, 포인트가 없거나 전부 0인 경우)
// 0으로 나누기를 피하려고 세로 중앙에 그린다.
export function scaleValueToY(value: number, domain: ValueDomain, chartHeight: number): number {
  const { min, max } = domain;
  if (max === min) {
    return chartHeight / 2;
  }
  const ratio = (value - min) / (max - min);
  // SVG의 y축은 아래로 갈수록 커지므로, 값이 클수록 y가 작아지도록 뒤집는다.
  return chartHeight - ratio * chartHeight;
}

// index번째 달의 x좌표(칸 중앙). count는 전체 달 수(보통 12).
export function scaleIndexToX(index: number, count: number, chartWidth: number): number {
  if (count <= 0) {
    return 0;
  }
  const slotWidth = chartWidth / count;
  return slotWidth * (index + 0.5);
}

// index번째 달이 차지하는 x축 구간([left, right)) — 선택 터치 영역 계산용.
export function monthSlotBounds(
  index: number,
  count: number,
  chartWidth: number,
): { left: number; right: number } {
  if (count <= 0) {
    return { left: 0, right: chartWidth };
  }
  const slotWidth = chartWidth / count;
  return { left: slotWidth * index, right: slotWidth * (index + 1) };
}

// docs/frontend.md "축은 KRW 축약 표시": 만원 단위로 줄여서 보여준다.
// (예: -2,000,000 -> "-200만원") 표시용일 뿐 값 자체는 그대로 둔다.
const COMPACT_KRW_FORMAT = new Intl.NumberFormat('ko-KR');

export function formatKrwCompactAxis(amountKrw: number): string {
  const manwon = Math.round(amountKrw / 10_000);
  return `${COMPACT_KRW_FORMAT.format(manwon)}만원`;
}

// 세로축 눈금값. 0을 항상 포함하고(도메인 계산에서 이미 보장) min·max와
// 함께 3개만 쓴다 — 12개월치 좁은 차트에 눈금이 많으면 오히려 읽기 어렵다.
export function buildAxisTicks(domain: ValueDomain): number[] {
  return Array.from(new Set([domain.min, 0, domain.max])).sort((a, b) => a - b);
}
