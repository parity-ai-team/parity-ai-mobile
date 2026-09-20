import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type AppIconName = 'household' | 'wallet' | 'calendar' | 'review' | 'database';

export interface AppIconProps {
  name: AppIconName;
  size: number;
  color: string;
  accentColor: string;
}

export function AppIcon({ name, size, color, accentColor }: AppIconProps) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    focusable: false,
  } as const;

  if (name === 'household') {
    return (
      <Svg {...commonProps}>
        <Circle cx="9" cy="8" r="3" fill={accentColor} />
        <Circle cx="16.5" cy="9" r="2.5" fill={color} />
        <Path d="M3.5 19c0-3.4 2.4-5.5 5.5-5.5s5.5 2.1 5.5 5.5v1h-11z" fill={accentColor} />
        <Path d="M12.5 19.8c.2-3 1.9-4.8 4.4-4.8 2.6 0 4.6 2 4.6 5h-9z" fill={color} />
      </Svg>
    );
  }

  if (name === 'wallet') {
    return (
      <Svg {...commonProps}>
        <Path
          d="M4 5.5h13.5a2.5 2.5 0 0 1 2.5 2.5v10.5H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z"
          fill={color}
        />
        <Path d="M4.5 3.5h12v3h-12a1.5 1.5 0 0 1 0-3z" fill={accentColor} />
        <Rect x="14" y="10" width="8" height="5" rx="2" fill={accentColor} />
        <Circle cx="17" cy="12.5" r="1" fill={color} />
      </Svg>
    );
  }

  if (name === 'calendar') {
    return (
      <Svg {...commonProps}>
        <Rect x="3" y="4.5" width="18" height="17" rx="3" fill={accentColor} />
        <Path d="M3 8.5h18v2H3z" fill={color} />
        <Path d="M7 2.5v4M17 2.5v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path
          d="m8 15 2.5 2.5L16.5 12"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === 'review') {
    return (
      <Svg {...commonProps}>
        <Circle cx="12" cy="12" r="9" fill={accentColor} />
        <Path
          d="m7.5 12 3 3 6-6"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <Svg {...commonProps}>
      <Path d="M4 6c0-2 3.6-3.5 8-3.5S20 4 20 6v12c0 2-3.6 3.5-8 3.5S4 20 4 18z" fill={color} />
      <Path
        d="M4 6c0 2 3.6 3.5 8 3.5S20 8 20 6M4 12c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5"
        fill="none"
        stroke={accentColor}
        strokeWidth="2"
      />
    </Svg>
  );
}
