/**
 * PasswordStrengthIndicator Component
 * Visual indicator for password strength with animated progress bar
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { PasswordStrength } from '@/types';

interface PasswordStrengthIndicatorProps {
  password: string;
  strength?: PasswordStrength;
  entropy?: number;
  showLabel?: boolean;
}

const STRENGTH_CONFIG: Record<
  PasswordStrength,
  { label: string; color: string; percentage: number }
> = {
  weak: { label: 'Weak', color: '#EF4444', percentage: 0.25 },
  fair: { label: 'Fair', color: '#F59E0B', percentage: 0.5 },
  good: { label: 'Good', color: '#10B981', percentage: 0.75 },
  strong: { label: 'Strong', color: '#6366F1', percentage: 1 },
};

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength,
  entropy,
  showLabel = true,
}) => {
  const { colors } = useTheme();
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  const currentStrength = useMemo(() => {
    return strength || STRENGTH_CONFIG.weak.label;
  }, [strength]);

  const config = useMemo(() => {
    return STRENGTH_CONFIG[currentStrength];
  }, [currentStrength]);

  // Animate progress bar
  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: config.percentage,
      duration: 300,
    }).start();
  }, [config.percentage, progressAnim]);

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {showLabel && (
          <Text style={[styles.label, { color: colors.textSecondary }]}>Password Strength</Text>
        )}
        <View style={styles.labelRow}>
          <Text style={[styles.strengthLabel, { color: config.color }]}>{config.label}</Text>
          {entropy !== undefined && (
            <Text style={[styles.entropyLabel, { color: colors.textMuted }]}>
              ({Math.round(entropy)} bits)
            </Text>
          )}
        </View>
      </View>
      <View style={[styles.barContainer, { backgroundColor: colors.inputBorder }]}>
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: config.color,
              width: barWidth,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strengthLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  entropyLabel: {
    fontSize: 11,
  },
  barContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
});
