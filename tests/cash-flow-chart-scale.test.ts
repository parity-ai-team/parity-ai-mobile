import {
  buildAxisTicks,
  computeValueDomain,
  formatKrwCompactAxis,
  monthSlotBounds,
  scaleIndexToX,
  scaleValueToY,
} from '@/shared/ui/CashFlowChart/scale';
import type { CashflowPoint } from '@/shared/types';

function point(overrides: Partial<CashflowPoint> & { period: string }): CashflowPoint {
  return {
    confirmed_cash_krw: 1_000_000,
    p20_krw: 800_000,
    p50_krw: 1_000_000,
    p80_krw: 1_200_000,
    emergency_floor_krw: 500_000,
    ...overrides,
  };
}

describe('computeValueDomain', () => {
  it('finds the min and max across every series, including 0', () => {
    const points = [
      point({ period: '2027-01', confirmed_cash_krw: 500_000, p20_krw: 400_000, p50_krw: 600_000, p80_krw: 700_000 }),
      point({ period: '2027-02', confirmed_cash_krw: 2_000_000, p20_krw: 1_800_000, p50_krw: 2_000_000, p80_krw: 2_200_000 }),
    ];

    expect(computeValueDomain(points)).toEqual({ min: 0, max: 2_200_000 });
  });

  it('handles negative cashflow values (a real scenario in the analysis example)', () => {
    const points = [
      point({ period: '2027-01', confirmed_cash_krw: -4_580_000, p20_krw: -357_208, p50_krw: 270_005, p80_krw: 932_869 }),
    ];

    expect(computeValueDomain(points)).toEqual({ min: -4_580_000, max: 932_869 });
  });

  it('always includes 0 even when every value is positive', () => {
    const points = [point({ period: '2027-01' })];

    expect(computeValueDomain(points).min).toBe(0);
  });

  it('returns {min: 0, max: 0} for an empty series', () => {
    expect(computeValueDomain([])).toEqual({ min: 0, max: 0 });
  });
});

describe('scaleValueToY', () => {
  const domain = { min: -1000, max: 1000 };

  it('maps the max value to the top (y=0)', () => {
    expect(scaleValueToY(1000, domain, 200)).toBe(0);
  });

  it('maps the min value to the bottom (y=chartHeight)', () => {
    expect(scaleValueToY(-1000, domain, 200)).toBe(200);
  });

  it('maps 0 to the vertical middle when the domain is symmetric', () => {
    expect(scaleValueToY(0, domain, 200)).toBe(100);
  });

  it('falls back to the middle when min === max (degenerate domain)', () => {
    expect(scaleValueToY(5, { min: 5, max: 5 }, 200)).toBe(100);
  });
});

describe('scaleIndexToX — 12개월 매핑', () => {
  it('spreads 12 months evenly across the chart width, centered in each slot', () => {
    const width = 120;
    const xs = Array.from({ length: 12 }, (_, index) => scaleIndexToX(index, 12, width));

    expect(xs).toHaveLength(12);
    expect(xs[0]).toBe(5); // slot width 10, centered at 5
    expect(xs[11]).toBe(115);
    // strictly increasing and evenly spaced
    for (let i = 1; i < xs.length; i += 1) {
      expect(xs[i] - xs[i - 1]).toBeCloseTo(10);
    }
  });

  it('returns 0 for a non-positive count', () => {
    expect(scaleIndexToX(0, 0, 120)).toBe(0);
  });
});

describe('monthSlotBounds', () => {
  it('divides the chart width into count equal, adjacent slots', () => {
    expect(monthSlotBounds(0, 4, 100)).toEqual({ left: 0, right: 25 });
    expect(monthSlotBounds(3, 4, 100)).toEqual({ left: 75, right: 100 });
  });
});

describe('buildAxisTicks', () => {
  it('returns sorted, de-duplicated [min, 0, max]', () => {
    expect(buildAxisTicks({ min: -100, max: 500 })).toEqual([-100, 0, 500]);
  });

  it('de-duplicates when min or max is already 0', () => {
    expect(buildAxisTicks({ min: 0, max: 500 })).toEqual([0, 500]);
    expect(buildAxisTicks({ min: -100, max: 0 })).toEqual([-100, 0]);
  });
});

describe('formatKrwCompactAxis', () => {
  it('formats a positive amount in 만원 units', () => {
    expect(formatKrwCompactAxis(12_000_000)).toBe('1,200만원');
  });

  it('formats a negative amount in 만원 units', () => {
    expect(formatKrwCompactAxis(-2_000_000)).toBe('-200만원');
  });

  it('rounds to the nearest 만원', () => {
    expect(formatKrwCompactAxis(15_000)).toBe('2만원');
  });
});
