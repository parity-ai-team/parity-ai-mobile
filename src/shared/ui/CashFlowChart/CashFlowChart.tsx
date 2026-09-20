import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { formatKrw } from '@/shared/format';
import type { CashflowPoint } from '@/shared/types';
import { InteractivePressable } from '../InteractivePressable/InteractivePressable';
import { useTheme } from '../theme';
import { createStyles } from './CashFlowChart.styles';
import {
  buildAxisTicks,
  computeValueDomain,
  monthSlotBounds,
  scaleIndexToX,
  scaleValueToY,
} from './scale';

export interface CashFlowChartProps {
  points: readonly CashflowPoint[];
  selectedPeriod?: string | null;
  onSelectPeriod?: (period: string) => void;
  testID?: string;
}

function linePath(coords: readonly { x: number; y: number }[]) {
  return coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
}
function monthLabel(period: string) {
  const [year, month] = period.split('-');
  return `${year}년 ${Number(month)}월`;
}

// 금액을 재계산하지 않고 서버의 월별 응답과 선택 상태를 표시한다.
export function CashFlowChart({
  points,
  selectedPeriod,
  onSelectPeriod,
  testID,
}: CashFlowChartProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [width, setWidth] = useState<number>(theme.chart.width);
  const [localPeriod, setLocalPeriod] = useState<string | null>(null);
  const [tableExpanded, setTableExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const count = points.length;
  const lowestIndex = points.reduce(
    (best, p, i) => (p.p50_krw < points[best].p50_krw ? i : best),
    0,
  );
  const requestedIndex = points.findIndex((p) => p.period === (selectedPeriod ?? localPeriod));
  const selectedIndex = requestedIndex >= 0 ? requestedIndex : lowestIndex;
  const selected = points[selectedIndex];
  const select = (period: string) => {
    setLocalPeriod(period);
    onSelectPeriod?.(period);
  };

  if (!selected) {
    return (
      <Text style={styles.hint} testID={testID}>
        아직 표시할 월별 금액이 없어요.
      </Text>
    );
  }

  const domain = computeValueDomain(points);
  const plotWidth = Math.max(width - theme.chart.axisWidth - theme.chart.rightPadding, 0);
  const plotHeight = theme.chart.height - theme.chart.monthHeight - theme.chart.topPadding;
  const yFor = (value: number) => theme.chart.topPadding + scaleValueToY(value, domain, plotHeight);
  const coords = (getValue: (p: CashflowPoint) => number) =>
    points.map((p, i) => ({
      x: theme.chart.axisWidth + scaleIndexToX(i, count, plotWidth),
      y: yFor(getValue(p)),
    }));
  const forecast = coords((p) => p.p50_krw);
  const lower = coords((p) => p.p20_krw);
  const upper = coords((p) => p.p80_krw);
  const confirmed = coords((p) => p.confirmed_cash_krw);
  const floor = coords((p) => p.emergency_floor_krw);
  const band = `${linePath(upper)} ${[...lower]
    .reverse()
    .map((p) => `L ${p.x},${p.y}`)
    .join(' ')} Z`;
  const belowFloor = selected.p50_krw < selected.emergency_floor_krw;
  const monthStride = Math.max(1, Math.ceil(count / 6));
  const summary =
    `${points[0].period}부터 ${points[count - 1].period}까지 ${count}개월 현금흐름. ` +
    `선택한 달: ${selected.period}. 예상 잔액 ${formatKrw(selected.p50_krw)}, ` +
    `필요 비상금 ${formatKrw(selected.emergency_floor_krw)}. ` +
    '이전 달과 다음 달 버튼 또는 월별 금액 보기로 자세히 확인할 수 있어요.';

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.monthHeader}>
        <InteractivePressable
          accessibilityRole="button"
          accessibilityLabel="이전 달"
          accessibilityState={{ disabled: selectedIndex === 0 }}
          disabled={selectedIndex === 0}
          style={[styles.monthButton, selectedIndex === 0 && styles.disabled]}
          onPress={() => select(points[selectedIndex - 1].period)}
        >
          <Text style={styles.arrow}>‹</Text>
        </InteractivePressable>
        <View style={styles.monthHeading} accessibilityLiveRegion="polite">
          <Text style={styles.period}>{monthLabel(selected.period)}</Text>
        </View>
        <InteractivePressable
          accessibilityRole="button"
          accessibilityLabel="다음 달"
          accessibilityState={{ disabled: selectedIndex === count - 1 }}
          disabled={selectedIndex === count - 1}
          style={[styles.monthButton, selectedIndex === count - 1 && styles.disabled]}
          onPress={() => select(points[selectedIndex + 1].period)}
        >
          <Text style={styles.arrow}>›</Text>
        </InteractivePressable>
      </View>
      <View style={styles.selectedSummary} accessibilityLiveRegion="polite">
        <Text style={styles.amount} testID={testID && `${testID}-selected-amount`}>
          {formatKrw(selected.p50_krw)}
        </Text>
        <Text style={styles.hint}>이 달에 남을 것으로 예상되는 돈</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={styles.forecastSwatch} />
          <Text style={styles.hint}>예상 잔액</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.floorSwatch} />
          <Text style={styles.hint}>필요 비상금</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.confirmedSwatch} />
          <Text style={styles.hint}>확정 현금</Text>
        </View>
      </View>
      <Text style={styles.unit}>단위: 만원</Text>
      <View style={styles.chartArea} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={summary}
          testID={testID && `${testID}-svg-container`}
        >
          <Svg width={width} height={theme.chart.height}>
            {buildAxisTicks(domain).map((tick) => (
              <G key={tick}>
                <Line
                  x1={theme.chart.axisWidth}
                  y1={yFor(tick)}
                  x2={width - theme.chart.rightPadding}
                  y2={yFor(tick)}
                  stroke={theme.colors.border}
                  strokeWidth={theme.chart.thinStroke}
                />
                <SvgText
                  x={theme.chart.axisWidth - theme.chart.axisInset}
                  y={yFor(tick) + theme.chart.labelOffset}
                  textAnchor="end"
                  fontSize={theme.typography.chartLabel.fontSize}
                  fill={theme.colors.textSecondary}
                >
                  {Number((tick / 10000).toFixed(1)).toLocaleString('ko-KR')}
                </SvgText>
              </G>
            ))}
            <Path d={band} fill={theme.colors.brand} fillOpacity={theme.chart.bandOpacity} />
            <Path
              d={linePath(floor)}
              stroke={theme.colors.severityCritical}
              strokeWidth={theme.chart.axisStroke}
              strokeDasharray={theme.chart.floorDash}
              fill="none"
            />
            <Path
              d={linePath(confirmed)}
              stroke={theme.colors.chartConfirmed}
              strokeWidth={theme.chart.lineStroke}
              strokeDasharray={theme.chart.confirmedDash}
              fill="none"
            />
            <Path
              d={linePath(forecast)}
              stroke={theme.colors.brand}
              strokeWidth={theme.chart.forecastStroke}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
            <Line
              x1={forecast[selectedIndex].x}
              y1={theme.chart.topPadding}
              x2={forecast[selectedIndex].x}
              y2={yFor(domain.min)}
              stroke={theme.colors.inputBorder}
              strokeWidth={theme.chart.thinStroke}
              strokeDasharray={theme.chart.selectedDash}
            />
            <Circle
              cx={forecast[selectedIndex].x}
              cy={forecast[selectedIndex].y}
              r={theme.chart.markerHaloRadius}
              fill={theme.colors.surface}
            />
            <Circle
              cx={forecast[selectedIndex].x}
              cy={forecast[selectedIndex].y}
              r={theme.chart.markerRadius}
              fill={theme.colors.brand}
            />
            {points.map((p, i) =>
              (i % monthStride === 0 && i < count - monthStride) || i === count - 1 ? (
                <SvgText
                  key={p.period}
                  x={forecast[i].x}
                  y={theme.chart.height - theme.chart.labelOffset}
                  textAnchor="middle"
                  fontSize={theme.typography.chartLabel.fontSize}
                  fill={theme.colors.textSecondary}
                >
                  {Number(p.period.slice(5))}월
                </SvgText>
              ) : null,
            )}
          </Svg>
        </View>
        {count > 0 ? (
          <View
            style={[styles.hitOverlay, { top: theme.chart.topPadding, height: plotHeight }]}
            pointerEvents="box-none"
          >
            {points.map((p, i) => {
              const { left, right } = monthSlotBounds(i, count, plotWidth);
              return (
                <Pressable
                  key={p.period}
                  accessible={false}
                  focusable={false}
                  style={[
                    styles.hitArea,
                    { left: theme.chart.axisWidth + left, width: right - left },
                  ]}
                  onPress={() => select(p.period)}
                  testID={testID && `${testID}-select-${p.period}`}
                />
              );
            })}
          </View>
        ) : null}
      </View>
      <Text style={styles.dateRange}>
        {monthLabel(points[0].period)} — {monthLabel(points[count - 1].period)}
      </Text>
      <View
        style={[styles.insight, belowFloor && styles.insightWarning]}
        accessibilityLiveRegion="polite"
      >
        <Text style={[styles.insightTitle, belowFloor && styles.warningText]}>
          {belowFloor ? '비상금보다 적게 남는 달이에요' : '예상 잔액이 비상금 기준 이상이에요'}
        </Text>
        <Text style={styles.hint}>
          이 달에 남겨둘 비상금 {formatKrw(selected.emergency_floor_krw)}
        </Text>
        <Text style={styles.hint}>
          예상 범위 {formatKrw(selected.p20_krw)} ~ {formatKrw(selected.p80_krw)}
        </Text>
      </View>
      <InteractivePressable
        accessibilityRole="button"
        accessibilityLabel="그래프 읽는 방법"
        accessibilityState={{ expanded: detailsExpanded }}
        style={styles.disclosure}
        onPress={() => setDetailsExpanded(!detailsExpanded)}
      >
        <Text style={styles.disclosureLabel}>그래프 읽는 방법</Text>
        <Text style={styles.disclosureLabel}>{detailsExpanded ? '−' : '+'}</Text>
      </InteractivePressable>
      {detailsExpanded ? (
        <View style={styles.guide}>
          <Text style={styles.hint}>
            초록 선은 예상 잔액이에요. 빨간 점선 아래로 내려가면 남겨둘 비상금이 부족해져요.
          </Text>
          <Text style={styles.hint}>
            연한 초록 영역은 예상의 변동 범위예요. 실제 잔액은 이 범위 밖일 수도 있어요.
          </Text>
          <View style={styles.legendItem}>
            <View style={styles.confirmedSwatch} />
            <Text style={styles.hint}>회색 점선은 확정 현금 기준이에요.</Text>
          </View>
        </View>
      ) : null}
      <InteractivePressable
        accessibilityRole="button"
        accessibilityLabel={tableExpanded ? '월별 금액 닫기' : '월별 금액 보기'}
        accessibilityState={{ expanded: tableExpanded }}
        style={styles.disclosure}
        onPress={() => setTableExpanded(!tableExpanded)}
      >
        <Text style={styles.disclosureLabel}>
          {tableExpanded ? '월별 금액 닫기' : '월별 금액 보기'}
        </Text>
        <Text style={styles.disclosureLabel}>{tableExpanded ? '−' : '+'}</Text>
      </InteractivePressable>
      {tableExpanded ? (
        <View style={styles.monthList} testID={testID && `${testID}-table`}>
          {points.map((p) => (
            <InteractivePressable
              key={p.period}
              style={[styles.monthRow, p.period === selected.period && styles.monthRowSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected: p.period === selected.period }}
              accessibilityLabel={`${p.period}, 예상 잔액 ${formatKrw(p.p50_krw)}, 비상금 ${formatKrw(p.emergency_floor_krw)}`}
              onPress={() => select(p.period)}
            >
              <View style={styles.monthRowHeader}>
                <Text style={styles.period}>{p.period}</Text>
                <Text style={styles.monthRowAmount}>{formatKrw(p.p50_krw)}</Text>
              </View>
              <Text style={styles.hint}>
                비상금 {formatKrw(p.emergency_floor_krw)}
                {p.p50_krw < p.emergency_floor_krw ? ' · 기준 미달' : ''}
              </Text>
              <Text style={styles.hint}>
                예상 범위 {formatKrw(p.p20_krw)} ~ {formatKrw(p.p80_krw)}
              </Text>
              <Text style={styles.hint}>확정 현금 {formatKrw(p.confirmed_cash_krw)}</Text>
            </InteractivePressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
