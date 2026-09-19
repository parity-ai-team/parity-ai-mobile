import { render, screen } from '@testing-library/react-native';

import { DataModeBadge } from '@/shared/ui/DataModeBadge';
import { theme } from '@/shared/ui/theme';

function flattenStyle(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.flat(Infinity).filter(Boolean).map(flattenStyle));
  }
  return (style as Record<string, unknown>) ?? {};
}

describe('DataModeBadge', () => {
  it('shows the synthetic label and color', async () => {
    await render(<DataModeBadge mode="synthetic" dataVersion="demo-2026-09" />);

    expect(screen.getByText('데모 데이터 · demo-2026-09')).toBeTruthy();
    const dot = screen.getByTestId('data-mode-badge-dot');
    expect(flattenStyle(dot.props.style).backgroundColor).toBe(theme.colors.dataModeSynthetic);
  });

  it('shows the verified label and color', async () => {
    await render(<DataModeBadge mode="verified" dataVersion="demo-2026-09" />);

    expect(screen.getByText('검증된 데이터 · demo-2026-09')).toBeTruthy();
    const dot = screen.getByTestId('data-mode-badge-dot');
    expect(flattenStyle(dot.props.style).backgroundColor).toBe(theme.colors.dataModeVerified);
  });

  it('shows the assumed label and color', async () => {
    await render(<DataModeBadge mode="assumed" dataVersion="demo-2026-09" />);

    expect(screen.getByText('가정 적용 데이터 · demo-2026-09')).toBeTruthy();
    const dot = screen.getByTestId('data-mode-badge-dot');
    expect(flattenStyle(dot.props.style).backgroundColor).toBe(theme.colors.dataModeAssumed);
  });
});
