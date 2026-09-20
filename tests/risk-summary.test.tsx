import { render, screen } from '@testing-library/react-native';
import { RiskSummary } from '@/features/analysis/screens/ResultScreen/RiskSummary';
import { firstBirthFixture } from '@/mocks/scenarios/first-birth';
import { formatKrw } from '@/shared/format';

it('서버 부족액이 가장 낮은 항목을 순서·금액 변경 없이 요약한다', async () => {
  const risk = firstBirthFixture.result.risks[0];
  const risks = Object.freeze([
    Object.freeze({ ...risk, period: '2027-01', expected_gap_krw: -100_000 }),
    Object.freeze({ ...risk, period: '2027-03', expected_gap_krw: -900_000 }),
    Object.freeze({ ...risk, period: '2027-02', expected_gap_krw: -300_000 }),
  ]);
  await render(<RiskSummary risks={risks} />);
  expect(screen.getByText('2027-03')).toBeTruthy();
  expect(screen.getByText(formatKrw(-900_000))).toBeTruthy();
  expect(risks.map((item) => item.period)).toEqual(['2027-01', '2027-03', '2027-02']);
});

it('위험 항목이 없으면 금액을 만들어 표시하지 않는다', async () => {
  await render(<RiskSummary risks={[]} />);
  expect(screen.getByText('표시할 위험월 없음')).toBeTruthy();
  expect(screen.queryByText('예상 부족액')).toBeNull();
});
