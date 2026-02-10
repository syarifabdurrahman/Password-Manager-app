/**
 * GeneratorScreen Component
 * Password generator with slider-based controls and real-time strength indicator
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {
  Shuffle,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';

import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard, GlassButton, PasswordStrengthIndicator } from '@/components';
import { hapticService, passwordGenerator, clipboardService } from '@/services';
import {
  DEFAULT_PASSWORD_OPTIONS,
  PASSWORD_RANGES,
  type PasswordGenerationOptions,
} from '@/types';

interface GeneratorScreenProps {
  onBack?: () => void;
}

const OPTION_ITEMS = [
  { key: 'includeUppercase', label: 'Uppercase', icon: 'A-Z' },
  { key: 'includeLowercase', label: 'Lowercase', icon: 'a-z' },
  { key: 'includeNumbers', label: 'Numbers', icon: '0-9' },
  { key: 'includeSymbols', label: 'Symbols', icon: '!@#' },
] as const;

export const GeneratorScreen: React.FC<GeneratorScreenProps> = ({
  onBack,
}) => {
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordGenerationOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [copied, setCopied] = useState(false);

  const entropy = useMemo(
    () => passwordGenerator.calculateEntropy(password),
    [password]
  );

  const strength = useMemo(
    () => passwordGenerator.estimateStrength(password),
    [password]
  );

  const generatePassword = useCallback(() => {
    hapticService.trigger('light');
    try {
      const generated = passwordGenerator.generate(options);
      setPassword(generated);
      setCopied(false);
    } catch (error) {
      Alert.alert('Error', 'Please select at least one character type');
    }
  }, [options]);

  const handleCopy = useCallback(async () => {
    hapticService.trigger('success');
    await clipboardService.copyToClipboard(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  const handleLengthChange = useCallback(
    (value: number) => {
      const length = Math.round(value);
      hapticService.trigger('light');
      setOptions((prev) => ({ ...prev, length }));
    },
    []
  );

  const toggleOption = useCallback(
    (key: keyof PasswordGenerationOptions) => {
      hapticService.trigger('light');

      // Count currently selected options
      const selectedOptions = Object.entries(options).filter(([k, v]) =>
        k.startsWith('include') && v === true
      );

      // Only prevent unchecking if this would leave zero options selected
      if (options[key] && selectedOptions.length <= 1) {
        // User is trying to turn OFF the only selected option
        hapticService.trigger('warning');
        Alert.alert('Cannot Deselect', 'At least one character type must be selected');
        return;
      }

      setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [options]
  );

  // Generate initial password on mount
  React.useEffect(() => {
    generatePassword();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              hapticService.trigger('light');
              onBack();
            }}
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <Sparkles size={20} color={colors.accent} strokeWidth={1.5} />
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Password Generator</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Create strong, secure passwords instantly.</Text>
          </View>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Single Card with all generator options */}
        <GlassCard style={styles.singleCard}>
          {/* Generated Password Display - Input style */}
          <View style={styles.passwordSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Generated Password
            </Text>
            <View style={[styles.passwordInputWrapper, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
              <Text style={[styles.passwordInputText, { color: colors.text }]}>
                {password || 'Generate a password'}
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={generatePassword}
              >
                <Shuffle size={20} color={colors.accent} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <GlassButton
              title={copied ? 'Copied!' : 'Copy Password'}
              icon={
                copied ? (
                  <Check size={18} color={colors.success} strokeWidth={1.5} />
                ) : (
                  <Copy size={18} strokeWidth={1.5} />
                )
              }
              onPress={handleCopy}
              fullWidth
            />
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Password Strength */}
          <PasswordStrengthIndicator
            password={password}
            strength={strength}
            entropy={entropy}
          />

          {/* Password Length Slider */}
          <View style={styles.optionHeader}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>
              Password Length
            </Text>
            <View style={[styles.lengthBadge, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.lengthValue, { color: colors.accent }]}>
                {options.length}
              </Text>
            </View>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={PASSWORD_RANGES.MIN_LENGTH}
            maximumValue={PASSWORD_RANGES.MAX_LENGTH}
            step={1}
            value={options.length}
            onValueChange={handleLengthChange}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.inputBorder}
            thumbTintColor={colors.accent}
          />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: colors.textMuted }]}>
              {PASSWORD_RANGES.MIN_LENGTH}
            </Text>
            <Text style={[styles.sliderLabel, { color: colors.textMuted }]}>
              {PASSWORD_RANGES.MAX_LENGTH}
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Character Type Options */}
          <View style={styles.optionHeader}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>
              Character Types
            </Text>
            <View style={[styles.lengthBadge, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.lengthValue, { color: colors.accent }]}>
                {Object.values(options).filter((v, i) => i >= 2 && v === true).length}/4
              </Text>
            </View>
          </View>
          <View style={styles.optionsGrid}>
            {OPTION_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.optionItem,
                  {
                    backgroundColor: options[item.key as keyof PasswordGenerationOptions]
                      ? colors.accentLight
                      : colors.input,
                    borderColor:
                      options[item.key as keyof PasswordGenerationOptions]
                        ? colors.accent
                        : colors.inputBorder,
                  },
                ]}
                onPress={() => toggleOption(item.key as keyof PasswordGenerationOptions)}
              >
                <Text style={styles.optionIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color: options[item.key as keyof PasswordGenerationOptions]
                        ? colors.accent
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleContainer: {
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  singleCard: {
    padding: 20,
  },
  passwordSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 12,
  },
  passwordInputText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  refreshButton: {
    padding: 8,
    marginLeft: 8,
  },
  optionsCard: {
    padding: 20,
    marginBottom: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  lengthBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  lengthValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 48,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionItem: {
    width: (100 - 9) / 4 + '%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  optionIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
