/**
 * SearchBar Component
 * A glassmorphism-styled search input with animated states
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { hapticService } from '@/services';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search accounts...',
  onClear,
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [focusAnim] = useState(new Animated.Value(0));

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const handleClear = useCallback(() => {
    hapticService.trigger('light');
    onChangeText('');
    onClear?.();
  }, [onChangeText, onClear]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.inputBorder, colors.accent],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.input,
          borderColor,
        },
      ]}
    >
      <Search size={20} color={colors.textSecondary} strokeWidth={1.5} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={18} color={colors.textSecondary} strokeWidth={1.5} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 4,
    minHeight: 40,
  },
  input: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 2,
  },
  clearButton: {
    padding: 6,
  },
});
