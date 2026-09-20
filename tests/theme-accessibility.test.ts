/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { colors, theme } from '@/shared/ui/theme';

function luminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const [r, g, b] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}
function contrast(foreground: string, background: string) {
  const [dark, light] = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  return (light + 0.05) / (dark + 0.05);
}

// 실제 화면에서 사용하는 작은 글자 조합도 모두 4.5:1을 만족해야 한다.
const textPairs: [keyof typeof colors, keyof typeof colors][] = [
  ...(['surface', 'background'] as const).flatMap((background) =>
    (
      [
        'textPrimary',
        'textSecondary',
        'brand',
        'severityInfo',
        'severityWarning',
        'severityCritical',
        'success',
        'dataModeSynthetic',
      ] as const
    ).map((foreground): [keyof typeof colors, keyof typeof colors] => [foreground, background]),
  ),
  ['textInverse', 'brand'],
  ['textInverse', 'brandPressed'],
  ['textInverse', 'severityInfo'],
  ['textInverse', 'severityWarning'],
  ['textInverse', 'severityCritical'],
  ['textInverse', 'success'],
  ['disabledText', 'disabledSurface'],
  ['deepGreen', 'mint'],
  ['mint', 'deepGreen'],
  ['textInverse', 'deepGreen'],
  ['brandPressed', 'brandSoft'],
  ['deepGreen', 'brandSoft'],
  ['textPrimary', 'brandSoft'],
  ['textSecondary', 'brandSoft'],
  ['severityWarning', 'warningSoft'],
  ['textPrimary', 'warningSoft'],
  ['severityCritical', 'criticalSoft'],
];
it.each(textPairs)('%s / %s 글자 대비는 4.5:1 이상이다', (foreground, background) => {
  expect(contrast(colors[foreground], colors[background])).toBeGreaterThanOrEqual(4.5);
});

it('터치 영역과 간격은 접근성·4pt 기준을 유지한다', () => {
  expect(theme.accessibility.minTouchTarget).toBeGreaterThanOrEqual(44);
  Object.values(theme.spacing).forEach((value) => expect(value % 4).toBe(0));
  expect(
    new Set([colors.severityInfo, colors.severityWarning, colors.severityCritical, colors.brand])
      .size,
  ).toBe(4);
});

it('웹 기기 프레임은 화면 크기와 관계없이 아이폰 비율을 유지한다', () => {
  expect(theme.layout.deviceAspectRatio).toBeCloseTo(
    theme.layout.deviceWidth / theme.layout.deviceHeight,
  );
});

function styleFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? styleFiles(path) : entry.name.endsWith('.styles.ts') ? [path] : [];
  });
}
it('스타일 파일은 숫자·색상 리터럴 대신 테마 토큰을 사용한다', () => {
  const violations: string[] = [];
  for (const path of [...styleFiles('src/shared/ui'), ...styleFiles('src/features')]) {
    const file = ts.createSourceFile(
      path,
      readFileSync(path, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    function visit(node: ts.Node) {
      if (ts.isNumericLiteral(node) || (ts.isStringLiteral(node) && /^#|^rgba?\(/.test(node.text)))
        violations.push(`${path}: ${node.getText(file)}`);
      ts.forEachChild(node, visit);
    }
    visit(file);
  }
  expect(violations).toEqual([]);
});
