/**
 * GlassButton Component
 * A glassmorphism-styled button with haptic feedback support
 */

import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { hapticService } from '@/services';

interface GlassButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
  loading?: boolean;
  haptic?: boolean;
  fullWidth?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  haptic = true,
  fullWidth = false,
  onPress,
  ...props
}) => {
  const { colors, isDark } = useTheme();

  const handlePress = (event: any) => {
    if (haptic) {
      hapticService.trigger('medium');
    }
    onPress?.(event);
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size], styles.noShadow];

    if (variant === 'ghost') {
      return [...baseStyle, { backgroundColor: 'transparent', borderColor: 'transparent' }];
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    return [styles.text, styles[size === 'large' ? 'largeText' : size === 'small' ? 'smallText' : 'mediumText']];
  };

  const getTextColor = () => {
    if (variant === 'ghost') return colors.accent;
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        variant === 'secondary' && { backgroundColor: colors.backgroundSecondary },
        variant === 'danger' && { backgroundColor: colors.danger },
        variant === 'ghost' && { borderWidth: 0 },
      ]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={getTextStyle()} numberOfLines={1}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  minimalShadow: {
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 0,
  },
  noShadow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
  },
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
