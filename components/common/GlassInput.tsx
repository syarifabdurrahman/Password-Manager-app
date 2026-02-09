/**
 * GlassInput Component
 * A glassmorphism-styled input field
 */

import React, { forwardRef } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerStyle?: any;
}

export const GlassInput = forwardRef<TextInput, GlassInputProps>(
  ({ label, error, icon, containerStyle, onFocus, onBlur, ...props }, ref) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        )}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.input,
              borderColor: error
                ? colors.danger
                : isFocused
                ? colors.accent
                : colors.inputBorder,
            },
          ]}
        >
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              { color: colors.text },
              icon && { paddingLeft: 0 },
            ]}
            placeholderTextColor={colors.textMuted}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </View>
        {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 52,
    overflow: 'hidden',
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});
