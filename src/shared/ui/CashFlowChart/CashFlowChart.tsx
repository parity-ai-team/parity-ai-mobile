import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
const DEFAULT_CHART_WIDTH = 320;
const CHART_HEIGHT = 220;
const AXIS_LABEL_WIDTH = 60;
const MONTH_LABEL_HEIGHT = 20;
// 최댓값 눈금(y=0)의 SvgText는 베이스라인이 plot 맨 위와 같은 높이에 놓여
// 글자 위쪽(어센더)이 SVG 밖으로 잘렸다(이전 PR에서 발견된 버그). plot 영역을
// 이만큼 아래로 내려 라벨이 그릴 공간을 확보한다.
const TOP_VALUE_LABEL_PADDING = 12;

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

      <View
        style={styles.chartArea}
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
                  strokeWidth={tick === 0 ? 1.5 : 1}
                />
                <SvgText
                  x={AXIS_LABEL_WIDTH - 6}
                  y={y + 4}
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
            fillOpacity={0.15}
          />

          <Path
            d={buildLinePath(floorCoords)}
            stroke={theme.colors.severityCritical}
            strokeWidth={1.5}
            strokeDasharray="4,3"
            fill="none"
          />

          <Path
            d={buildLinePath(confirmedCoords)}
            stroke={theme.colors.success}
            strokeWidth={2}
            fill="none"
          />

          <Path
            d={buildLinePath(p50Coords)}
            stroke={theme.colors.brand}
            strokeWidth={2}
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
                strokeWidth={2}
                strokeDasharray="2,2"
              />
              <Circle
                cx={p50Coords[selectedIndex].x}
                cy={p50Coords[selectedIndex].y}
                r={5}
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
                y={TOP_VALUE_LABEL_PADDING + plotHeight + MONTH_LABEL_HEIGHT - 4}
                fontSize={theme.typography.bodySmall.fontSize}
                fill={theme.colors.textSecondary}
                textAnchor="middle"
              >
                {point.period.slice(5)}
              </SvgText>
            );
          })}
        </Svg>

        {/*
          달마다 하나씩 두는 선택 터치 영역. RN Pressable을 Svg 위에 절대
          위치로 겹친다 — react-native-svg 15.x는 웹에서 Shape(Rect 등)에
          onPress를 주면 SvgTouchableMixin이 붙이는 onStartShouldSetResponder
          류 RN 전용 responder prop이 그대로 실제 DOM SVG 엘리먼트에 새어나가
          "Unknown event handler property" 경고가 났다(이전 PR에서 발견된
          버그) — Pressable은 이 변환 경로를 타지 않아 문제가 없다.
          12칸을 한 화면 너비에 나누다 보니 칸 하나의 폭이 44pt 접근성
          기준보다 작을 수 있다 — 세로는 plotHeight 전체라 44pt를 넘지만,
          가로까지 만족시키려면 차트 자체가 비현실적으로 넓어진다. 아래 표의
          각 행(Pressable)이 44pt를 만족하는 대체 선택 수단이다.
        */}
        {onSelectPeriod ? (
          <View
            style={[styles.hitOverlay, { top: TOP_VALUE_LABEL_PADDING, height: plotHeight }]}
            pointerEvents="box-none"
          >
            {points.map((point, index) => {
              const { left, right } = monthSlotBounds(index, count, plotWidth);
              return (
                <Pressable
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

      <View style={styles.toggleRow}>
        <Button
          label={tableExpanded ? '표 접기' : '표로 보기'}
          variant="secondary"
          onPress={() => setTableExpanded((prev) => !prev)}
        />
      </View>

      {tableExpanded ? (
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
      ) : null}
    </View>
  );
}
