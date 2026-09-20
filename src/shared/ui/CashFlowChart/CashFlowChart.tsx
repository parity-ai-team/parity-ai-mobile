import { useState } from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { formatKrw } from '@/shared/format';
import type { CashflowPoint } from '@/shared/types';

import { Button } from '../Button';
import { useTheme } from '../theme';
import { createStyles } from './CashFlowChart.styles';
import {
  buildAxisTicks,
  computeValueDomain,
  formatKrwCompactAxis,
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

// 차트 그리기 전용 크기 상수. theme 토큰(색·간격·타이포그래피)과 달리 이건
// "SVG 안에서 몇 px를 차지하는가"라는 그리기 좌표 문제라 토큰화 대상이
// 아니다 — 색상·글자 크기 등 실제 스타일 값은 전부 theme에서 가져온다.
function buildLinePath(coords: readonly { x: number; y: number }[]): string {
  return coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`).join(' ');
}

function buildBandPath(
  topCoords: readonly { x: number; y: number }[],
  bottomCoords: readonly { x: number; y: number }[],
): string {
  const top = topCoords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`);
  const bottom = [...bottomCoords].reverse().map((point) => `L ${point.x},${point.y}`);
  return [...top, ...bottom, 'Z'].join(' ');
}

// docs/frontend.md "핵심 UI 컴포넌트"/"차트 표시 규칙": p50 선, p20~p80 구간,
// 비상금 하한선, 확정 현금을 하나의 차트에 그린다. 위험월(selectedPeriod)은
// 세로 강조선 + 마커로 표시하고 선택 시 onSelectPeriod를 호출한다. 값은 전부
// 서버 응답 그대로이며 이 컴포넌트는 화면 좌표로 변환만 한다(scale.ts).
export function CashFlowChart({
  points,
  selectedPeriod,
  onSelectPeriod,
  testID,
}: CashFlowChartProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const DEFAULT_CHART_WIDTH: number = theme.chart.width;
  const CHART_HEIGHT = theme.chart.height;
  const AXIS_LABEL_WIDTH = theme.chart.axisWidth;
  const MONTH_LABEL_HEIGHT = theme.chart.monthHeight;
  const TOP_VALUE_LABEL_PADDING = theme.chart.topPadding;
  const [width, setWidth] = useState(DEFAULT_CHART_WIDTH);
  const [tableExpanded, setTableExpanded] = useState(false);

  const domain = computeValueDomain(points);
  const plotWidth = Math.max(width - AXIS_LABEL_WIDTH, 0);
  const plotHeight = CHART_HEIGHT - MONTH_LABEL_HEIGHT - TOP_VALUE_LABEL_PADDING;
  const count = points.length;

  const coordsFor = (valueOf: (point: CashflowPoint) => number) =>
    points.map((point, index) => ({
      x: AXIS_LABEL_WIDTH + scaleIndexToX(index, count, plotWidth),
      y: TOP_VALUE_LABEL_PADDING + scaleValueToY(valueOf(point), domain, plotHeight),
    }));

  const p50Coords = coordsFor((point) => point.p50_krw);
  const p20Coords = coordsFor((point) => point.p20_krw);
  const p80Coords = coordsFor((point) => point.p80_krw);
  const confirmedCoords = coordsFor((point) => point.confirmed_cash_krw);
  const floorCoords = coordsFor((point) => point.emergency_floor_krw);

  const selectedIndex = points.findIndex((point) => point.period === selectedPeriod);
  const ticks = buildAxisTicks(domain);

  const minP50Index = points.reduce(
    (bestIndex, point, index) => (point.p50_krw < points[bestIndex].p50_krw ? index : bestIndex),
    0,
  );
  const maxP50Index = points.reduce(
    (bestIndex, point, index) => (point.p50_krw > points[bestIndex].p50_krw ? index : bestIndex),
    0,
  );
  const summary =
    count === 0
      ? '현금흐름 데이터가 없어요.'
      : `${points[0].period}부터 ${points[count - 1].period}까지 ${count}개월 현금흐름. ` +
        `p50 기준 최저 ${formatKrw(points[minP50Index].p50_krw)}(${points[minP50Index].period}), ` +
        `최고 ${formatKrw(points[maxP50Index].p50_krw)}(${points[maxP50Index].period}).` +
        (selectedPeriod ? ` 선택된 위험월: ${selectedPeriod}.` : '') +
        ' 자세한 값은 아래 표에서 확인할 수 있어요.';

  const legendItems: { color: string; label: string }[] = [
    { color: theme.colors.brand, label: 'p50(중앙값)' },
    { color: theme.colors.success, label: '확정 현금' },
    { color: theme.colors.severityCritical, label: '비상금 하한선' },
    { color: theme.colors.severityWarning, label: '선택된 위험월' },
  ];

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.legendRow}>
        {legendItems.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
          </View>
        ))}
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: theme.colors.border }]} />
          <Text style={styles.legendLabel}>p20~p80 구간</Text>
        </View>
      </View>

      <Text style={styles.legendLabel}>좌우로 이동해 월별 흐름을 확인할 수 있어요.</Text>
      <ScrollView horizontal contentContainerStyle={styles.chartScroll}>
        <View
          style={[
            styles.chartArea,
            {
              minWidth: points.length * theme.accessibility.minTouchTarget + theme.chart.axisWidth,
            },
          ]}
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
          accessible
          accessibilityRole="image"
          accessibilityLabel={summary}
          testID={testID && `${testID}-svg-container`}
        >
          <Svg width={width} height={CHART_HEIGHT}>
            {ticks.map((tick) => {
              const y = TOP_VALUE_LABEL_PADDING + scaleValueToY(tick, domain, plotHeight);
              return (
                <G key={tick}>
                  <Line
                    x1={AXIS_LABEL_WIDTH}
                    y1={y}
                    x2={width}
                    y2={y}
                    stroke={theme.colors.border}
                    strokeWidth={tick === 0 ? theme.chart.axisStroke : theme.chart.thinStroke}
                  />
                  <SvgText
                    x={AXIS_LABEL_WIDTH - theme.chart.axisInset}
                    y={y + theme.chart.labelOffset}
                    fontSize={theme.typography.bodySmall.fontSize}
                    fill={theme.colors.textSecondary}
                    textAnchor="end"
                  >
                    {formatKrwCompactAxis(tick)}
                  </SvgText>
                </G>
              );
            })}

            <Path
              d={buildBandPath(p80Coords, p20Coords)}
              fill={theme.colors.brand}
              fillOpacity={theme.chart.bandOpacity}
            />

            <Path
              d={buildLinePath(floorCoords)}
              stroke={theme.colors.severityCritical}
              strokeWidth={theme.chart.axisStroke}
              strokeDasharray={theme.chart.floorDash}
              fill="none"
            />

            <Path
              d={buildLinePath(confirmedCoords)}
              stroke={theme.colors.success}
              strokeWidth={theme.chart.lineStroke}
              fill="none"
            />

            <Path
              d={buildLinePath(p50Coords)}
              stroke={theme.colors.brand}
              strokeWidth={theme.chart.lineStroke}
              fill="none"
            />

            {selectedIndex >= 0 ? (
              <>
                <Line
                  x1={p50Coords[selectedIndex].x}
                  y1={TOP_VALUE_LABEL_PADDING}
                  x2={p50Coords[selectedIndex].x}
                  y2={TOP_VALUE_LABEL_PADDING + plotHeight}
                  stroke={theme.colors.severityWarning}
                  strokeWidth={theme.chart.lineStroke}
                  strokeDasharray={theme.chart.selectedDash}
                />
                <Circle
                  cx={p50Coords[selectedIndex].x}
                  cy={p50Coords[selectedIndex].y}
                  r={theme.chart.markerRadius}
                  fill={theme.colors.severityWarning}
                />
              </>
            ) : null}

            {points.map((point, index) => {
              const { left, right } = monthSlotBounds(index, count, plotWidth);
              return (
                <SvgText
                  key={`label-${point.period}`}
                  x={AXIS_LABEL_WIDTH + (left + right) / 2}
                  y={
                    TOP_VALUE_LABEL_PADDING +
                    plotHeight +
                    MONTH_LABEL_HEIGHT -
                    theme.chart.labelOffset
                  }
                  fontSize={theme.typography.bodySmall.fontSize}
                  fill={theme.colors.textSecondary}
                  textAnchor="middle"
                >
                  {point.period.slice(5)}
                </SvgText>
              );
            })}
          </Svg>

          {/* 월별 선택 영역은 44pt를 확보하고, 좁은 화면에서는 차트를 가로로 스크롤한다.
            키보드·스크린리더 선택은 아래의 확장 가능한 표에서 제공한다. */}
          {onSelectPeriod ? (
            <View
              style={[styles.hitOverlay, { top: TOP_VALUE_LABEL_PADDING, height: plotHeight }]}
              pointerEvents="box-none"
            >
              {points.map((point, index) => {
                const { left, right } = monthSlotBounds(index, count, plotWidth);
                return (
                  <Pressable
                    accessible={false}
                    focusable={false}
                    key={`hit-${point.period}`}
                    style={[styles.hitArea, { left: AXIS_LABEL_WIDTH + left, width: right - left }]}
                    onPress={() => onSelectPeriod(point.period)}
                    testID={testID && `${testID}-select-${point.period}`}
                  />
                );
              })}
            </View>
          ) : null}
        </View>
      </ScrollView>
      <View style={styles.toggleRow}>
        <Button
          label={tableExpanded ? '표 접기' : '표로 보기'}
          variant="pill"
          onPress={() => setTableExpanded((prev) => !prev)}
        />
      </View>

      {tableExpanded ? (
        <ScrollView horizontal>
          <View style={styles.table} testID={testID && `${testID}-table`}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeaderCell}>월</Text>
              <Text style={styles.tableHeaderCell}>p20</Text>
              <Text style={styles.tableHeaderCell}>p50</Text>
              <Text style={styles.tableHeaderCell}>p80</Text>
              <Text style={styles.tableHeaderCell}>하한선</Text>
            </View>
            {points.map((point) => {
              const selected = point.period === selectedPeriod;
              return (
                <Pressable
                  key={point.period}
                  style={[styles.tableRow, selected && styles.tableRowSelected]}
                  onPress={onSelectPeriod ? () => onSelectPeriod(point.period) : undefined}
                  accessibilityRole={onSelectPeriod ? 'button' : undefined}
                  accessibilityState={onSelectPeriod ? { selected } : undefined}
                  accessibilityLabel={`${point.period}${selected ? ' · 선택된 위험월' : ''}`}
                >
                  <Text style={styles.tableCell}>{point.period}</Text>
                  <Text style={styles.tableCell}>{formatKrw(point.p20_krw)}</Text>
                  <Text style={styles.tableCell}>{formatKrw(point.p50_krw)}</Text>
                  <Text style={styles.tableCell}>{formatKrw(point.p80_krw)}</Text>
                  <Text style={styles.tableCell}>{formatKrw(point.emergency_floor_krw)}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}
