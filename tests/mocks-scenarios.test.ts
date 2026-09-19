import { buildCashflow, generateMonths } from '@/mocks/scenarios/build-cashflow';
import { firstBirthAlternativesFixture, firstBirthFixture } from '@/mocks/scenarios/first-birth';
import { pastMeAlternativesFixture, pastMeFixture } from '@/mocks/scenarios/past-me';
import {
  singleParentAlternativesFixture,
  singleParentFixture,
  singleParentStressedAlternativesFixture,
  singleParentStressedFixture,
} from '@/mocks/scenarios/single-parent';

const ALL_FIXTURES = [
  firstBirthFixture,
  pastMeFixture,
  singleParentFixture,
  singleParentStressedFixture,
];

const ALL_ALTERNATIVES_FIXTURES = [
  firstBirthAlternativesFixture,
  pastMeAlternativesFixture,
  singleParentAlternativesFixture,
  singleParentStressedAlternativesFixture,
];

describe('generateMonths', () => {
  it('produces 12 sequential periods, rolling over into the next year', () => {
    expect(generateMonths('2027-08', 12)).toEqual([
      '2027-08',
      '2027-09',
      '2027-10',
      '2027-11',
      '2027-12',
      '2028-01',
      '2028-02',
      '2028-03',
      '2028-04',
      '2028-05',
      '2028-06',
      '2028-07',
    ]);
  });
});

describe('buildCashflow', () => {
  it('fills every month with the baseline unless overridden', () => {
    const points = buildCashflow(
      '2027-01',
      'test',
      { confirmed_cash_krw: 1, p20_krw: 1, p50_krw: 1, p80_krw: 1, emergency_floor_krw: 1 },
      [{ period: '2027-03', confirmed_cash_krw: 999 }],
    );

    expect(points).toHaveLength(12);
    expect(points[0].confirmed_cash_krw).toBe(1);
    expect(points[2].period).toBe('2027-03');
    expect(points[2].confirmed_cash_krw).toBe(999);
    expect(points[2].p50_krw).toBe(1); // 오버라이드하지 않은 필드는 baseline 유지
  });

  it('fills a trace id for every point unless overridden', () => {
    const points = buildCashflow(
      '2027-01',
      'test',
      { confirmed_cash_krw: 1, p20_krw: 1, p50_krw: 1, p80_krw: 1, emergency_floor_krw: 1 },
      [{ period: '2027-03', trace_ids: ['trc_custom'] }],
    );

    expect(points[0].trace_ids).toEqual(['trc_mock_test_cashflow_2027-01']);
    expect(points[2].trace_ids).toEqual(['trc_custom']);
  });
});

describe('fixture structure', () => {
  it.each(ALL_FIXTURES.map((fixture) => [fixture.analysis_id, fixture] as const))(
    '%s has a full 12-month cashflow and SYNTHETIC_DATA limitation',
    (_id, fixture) => {
      expect(fixture.result.cashflow).toHaveLength(12);
      expect(fixture.limitations).toContain('SYNTHETIC_DATA');
      expect(fixture.status).toBe('ready');
    },
  );
});

describe('scenario differentiation', () => {
  it('gives each base scenario a different risk period and cause codes', () => {
    expect(firstBirthFixture.result.risks[0].period).not.toBe(pastMeFixture.result.risks[0].period);
    expect(firstBirthFixture.result.risks[0].cause_codes).not.toEqual(
      pastMeFixture.result.risks[0].cause_codes,
    );
    expect(singleParentFixture.result.risks[0].cause_codes).not.toEqual(
      firstBirthFixture.result.risks[0].cause_codes,
    );
  });

  it('gives each base scenario a different safe_contribution outcome', () => {
    expect(firstBirthFixture.result.safe_contribution.eligible).toBe(false);
    expect(pastMeFixture.result.safe_contribution.eligible).toBe(false);
    expect(firstBirthFixture.result.safe_contribution.reason_codes).not.toEqual(
      pastMeFixture.result.safe_contribution.reason_codes,
    );
    expect(singleParentFixture.result.safe_contribution.eligible).toBe(true);
  });

  it('flips the single-parent safe_contribution and risk severity when the stress toggle is on', () => {
    expect(singleParentFixture.result.safe_contribution.eligible).toBe(true);
    expect(singleParentStressedFixture.result.safe_contribution.eligible).toBe(false);
    expect(singleParentStressedFixture.result.risks[0].severity).toBe('critical');
    expect(singleParentFixture.result.risks[0].severity).not.toBe('critical');
    expect(singleParentStressedFixture.result.risks[0].expected_gap_krw).toBeLessThan(
      singleParentFixture.result.risks[0].expected_gap_krw,
    );
  });

  it('gives every fixture a distinct analysis_id for round-trip lookup', () => {
    const ids = ALL_FIXTURES.map((fixture) => fixture.analysis_id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('real contract fields (docs/api/analysis-response-example.json)', () => {
  it.each(ALL_FIXTURES.map((fixture) => [fixture.analysis_id, fixture] as const))(
    '%s fills CashflowPoint.trace_ids and RiskItem.probability/confidence/source on every entry',
    (_id, fixture) => {
      for (const point of fixture.result.cashflow) {
        expect(point.trace_ids?.length).toBeGreaterThan(0);
      }
      for (const risk of fixture.result.risks) {
        expect(typeof risk.probability).toBe('number');
        expect(risk.confidence).toBeTruthy();
        expect(risk.source).toBeTruthy();
      }
    },
  );

  it.each(ALL_FIXTURES.map((fixture) => [fixture.analysis_id, fixture] as const))(
    '%s caps result.alternatives at 3 summaries',
    (_id, fixture) => {
      expect(fixture.result.alternatives?.length).toBeLessThanOrEqual(3);
    },
  );

  it.each(
    ALL_ALTERNATIVES_FIXTURES.map((fixture) => [fixture.analysis_id, fixture] as const),
  )('%s alternatives-compare fixture shares alternative_ids with the analysis result summary', (id, alternativesFixture) => {
    const analysisFixture = ALL_FIXTURES.find((fixture) => fixture.analysis_id === id);
    expect(analysisFixture).toBeDefined();

    const summaryIds = analysisFixture?.result.alternatives?.map((item) => item.alternative_id);
    const detailIds = alternativesFixture.alternatives.map((item) => item.alternative_id);
    expect(detailIds).toEqual(summaryIds);
  });
});
