/**
 * PinLockScreen Component
 * PIN entry screen for app authentication
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassButton } from '@/components';
import { hapticService, accountsStorage } from '@/services';
import { STORAGE_KEYS } from '@/types';

interface PinLockScreenProps {
  storedPin: string | null;
  onUnlock: () => void;
  onForgotPin?: () => void;
}

// Helper to generate PIN hint (e.g., "1***" for PIN "1234")
const getPinHint = (pin: string | null): string | null => {
  if (!pin) return null;
  return `${pin[0]}***`;
};

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  storedPin,
  onUnlock,
  onForgotPin,
}) => {
  const { colors, isDark } = useTheme();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      hapticService.trigger('warning');
      return;
    }

    setIsLoading(true);
    setError('');

    // Verify against stored PIN
    // If no PIN is set, allow any PIN to unlock
    if (!storedPin || pin === storedPin) {
      setTimeout(() => {
        setIsLoading(false);
        hapticService.trigger('success');
        onUnlock();
      }, 500);
    } else {
      setIsLoading(false);
      setError('Incorrect PIN');
      hapticService.trigger('error');
      setTimeout(() => setError(''), 1500);
    }
  }, [pin, storedPin, onUnlock]);

  const handlePinChange = useCallback((value: string) => {
    if (error) setError('');
    // Only allow digits
    const numericValue = value.replace(/\D/g, '');
    setPin(numericValue);
    // Hide hint when user starts typing
    if (showHint) setShowHint(false);
  }, [error, showHint]);

  const toggleHint = useCallback(() => {
    hapticService.trigger('light');
    setShowHint(!showHint);
  }, [showHint]);

  const handleForgotPin = useCallback(() => {
    hapticService.trigger('light');
    onForgotPin?.();
  }, [onForgotPin]);

  const pinDots = Array(4)
    .fill(0)
    .map((_, i) => (
      <View
        key={i}
        style={[
          styles.pinDot,
          {
            backgroundColor:
              i < pin.length
                ? colors.accent
                : isDark
                ? colors.input
                : '#E0E0E',
          },
        ]}
      />
    ));

  // Get hint from stored PIN
  const pinHint = getPinHint(storedPin);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
          <Lock size={48} color={colors.accent} strokeWidth={2} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>Enter PIN</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {storedPin ? 'Enter your 4-digit PIN to unlock' : 'Set a 4-digit PIN to protect'} your vault
        </Text>

        {/* PIN Hint Display */}
        {showHint && pinHint && (
          <View style={styles.hintContainer}>
            <Text style={[styles.hintLabel, { color: colors.textSecondary }]}>PIN Hint:</Text>
            <Text style={[styles.hintValue, { color: colors.text }]}>{pinHint}</Text>
          </View>
        )}

        {/* PIN Dots Display */}
        <View style={styles.pinDotsContainer}>{pinDots}</View>

        {/* PIN Input (hidden) */}
        <TextInput
          style={styles.hiddenInput}
          value={pin}
          onChangeText={handlePinChange}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
          autoFocus
          placeholder={storedPin ? '••••' : '•••••'}
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={handleSubmit}
        />

        {/* Error Message */}
        {error ? (
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        ) : null}

        {/* Submit Button */}
        <GlassButton
          title={isLoading ? 'Verifying...' : 'Unlock'}
          onPress={handleSubmit}
          fullWidth
          disabled={pin.length !== 4 || isLoading}
        />

        {/* Forgot PIN / Hint Toggle */}
        <TouchableOpacity
          style={styles.forgotPinButton}
          onPress={toggleHint}
        >
          <Text style={[styles.forgotPinText, { color: colors.textSecondary }]}>
            {showHint ? 'Hide Hint' : 'Forgot PIN?'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  hintLabel: {
    fontSize: 13,
    marginRight: 8,
  },
  hintValue: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 4,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  forgotPinButton: {
    marginTop: 24,
    padding: 8,
  },
  forgotPinText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
