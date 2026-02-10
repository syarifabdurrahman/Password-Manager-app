/**
 * GlassCard Component
 * A glassmorphism-styled card component with backdrop blur and semi-transparent background
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'light' | 'accent';
  reducedTransparency?: boolean;
  backgroundColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
  reducedTransparency = false,
  backgroundColor,
}) => {
  const { colors, isDark } = useTheme();

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
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
  content: {
    zIndex: 1,
  },
});
