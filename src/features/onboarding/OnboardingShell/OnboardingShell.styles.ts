import { Platform, StyleSheet, type ViewStyle } from 'react-native';
import type { Theme } from '@/shared/ui';
export function createStyles(theme: Theme) {
  const webDeviceFrame =
    Platform.OS === 'web'
      ? ({
          flex: theme.layout.zero,
          flexBasis: 'auto',
          flexShrink: theme.layout.zero,
          width: theme.layout.deviceWidth,
          maxWidth: theme.layout.full,
          aspectRatio: theme.layout.deviceAspectRatio,
          alignSelf: 'center',
          marginVertical: theme.spacing.lg,
          paddingTop: theme.layout.deviceStatusBarHeight,
          borderWidth: theme.layout.deviceBorderWidth,
          borderColor: theme.colors.deviceFrame,
          borderRadius: theme.radii.device,
          overflow: 'hidden',
          boxShadow: theme.layout.deviceShadow,
          backgroundImage: theme.layout.deviceStatusBackground,
          backgroundPosition: 'top',
          backgroundRepeat: 'no-repeat',
          backgroundSize: theme.layout.deviceStatusBackgroundSize,
        } as unknown as ViewStyle)
      : undefined;

  return StyleSheet.create({
    container: {
      flex: theme.layout.flex,
      backgroundColor: theme.colors.surface,
      ...webDeviceFrame,
    },
    header: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: theme.layout.zero,
      zIndex: theme.layout.headerZIndex,
    },
    headerRow: {
      minHeight: theme.layout.headerHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.xs,
      gap: theme.spacing.sm,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      flexShrink: theme.layout.flex,
    },
    brandLockup: {
      width: theme.layout.brandLogoWidth,
      height: theme.layout.brandLogoHeight,
      justifyContent: 'center',
    },
    brandLogo: {
      width: theme.layout.brandLogoWidth,
      height: theme.layout.brandLogoHeight,
      transform: [
        { translateX: theme.layout.brandLogoTranslateX },
        { scale: theme.layout.brandLogoScale },
      ],
    },
    brand: {
      position: 'absolute',
      width: theme.layout.visuallyHiddenSize,
      height: theme.layout.visuallyHiddenSize,
      opacity: theme.layout.zero,
    },
    stage: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      flexShrink: theme.layout.flex,
    },
  });
}
