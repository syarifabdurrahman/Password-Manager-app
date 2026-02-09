/**
 * GlassCard Component
 * A glassmorphism-styled card component with backdrop blur and semi-transparent background
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'light' | 'accent';
  blurAmount?: number;
  reducedTransparency?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
  blurAmount = 10,
  reducedTransparency = false,
}) => {
  const { colors, isDark } = useTheme();

  const getBackgroundColor = () => {
    if (reducedTransparency) {
      return colors.backgroundSecondary;
    }
    switch (variant) {
      case 'light':
        return colors.glass.bgLight;
      case 'accent':
        return colors.accentLight;
      default:
        return colors.glass.bg;
    }
  };

  const getBorderColor = () => {
    return variant === 'accent' ? colors.accent : colors.glass.border;
  };

  return (
    <View
      style={[
        styles.container,
        !isDark && styles.lightMode,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        style,
      ]}
    >
      {/* Blur effect for glassmorphism */}
      {isDark && !reducedTransparency && (
        <BlurView
          style={styles.blur}
          blurType="dark"
          blurAmount={blurAmount}
          reducedTransparencyFallbackColor={colors.background}
        />
      )}
      {!isDark && !reducedTransparency && (
        <BlurView
          style={styles.blur}
          blurType="light"
          blurAmount={blurAmount}
          reducedTransparencyFallbackColor={colors.background}
        />
      )}

      {/* Card content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  lightMode: {},
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    zIndex: 1,
  },
});
