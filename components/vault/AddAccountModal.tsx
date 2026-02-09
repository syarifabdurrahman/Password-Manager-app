/**
 * AddAccountModal Component
 * Modal for adding/editing accounts with form validation
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Film, Code, MessageCircle, CreditCard, Briefcase, Folder, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard, GlassButton, GlassInput } from '@/components/common';
import { hapticService, passwordGenerator } from '@/services';
import { ACCOUNT_CATEGORIES } from '@/types';
import type { Account, AccountCategory } from '@/types';

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editAccount?: Account;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  visible,
  onClose,
  onSave,
  editAccount,
}) => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState<AccountCategory>('other');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Icon map for categories
  const CATEGORY_ICONS: Record<string, React.ReactElement> = {
    entertainment: <Film size={18} strokeWidth={1.5} />,
    development: <Code size={18} strokeWidth={1.5} />,
    social: <MessageCircle size={18} strokeWidth={1.5} />,
    finance: <CreditCard size={18} strokeWidth={1.5} />,
    work: <Briefcase size={18} strokeWidth={1.5} />,
    other: <Folder size={18} strokeWidth={1.5} />,
  };

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name);
      setUsername(editAccount.username);
      setPassword(editAccount.password);
      setWebsite(editAccount.website || '');
      setCategory(editAccount.category);
    } else {
      resetForm();
    }
  }, [editAccount, visible]);

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setWebsite('');
    setCategory('other');
    setErrors({});
  };

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Account name is required';
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, username, password]);

  const handleGeneratePassword = useCallback(() => {
    hapticService.trigger('medium');
    const generated = passwordGenerator.generate({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });
    setPassword(generated);
  }, []);

  const handleSave = useCallback(() => {
    if (!validate()) {
      hapticService.trigger('error');
      return;
    }

    hapticService.trigger('success');
    onSave({
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      website: website.trim() || undefined,
      category,
    });

    resetForm();
    onClose();
  }, [name, username, password, website, category, validate, onSave, onClose]);

  const handleClose = useCallback(() => {
    hapticService.trigger('light');
    resetForm();
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]} />
        <SafeAreaView edges={['top', 'left', 'right']} mode="padding" style={styles.safeArea}>
          <GlassCard style={styles.modalContent} reducedTransparency>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={20} color={colors.text} strokeWidth={1.5} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>
                {editAccount ? 'Edit Account' : 'Add Account'}
              </Text>
              <View style={styles.headerSpacer} />
            </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentInner}
            showsVerticalScrollIndicator={false}
          >
            {/* Account Name */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Account Name</Text>
              <GlassInput
                placeholder="e.g., Netflix, GitHub"
                value={name}
                onChangeText={setName}
                error={errors.name}
                autoCapitalize="words"
              />
            </View>

            {/* Username/Email */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Username / Email</Text>
              <GlassInput
                placeholder="Enter username or email"
                value={username}
                onChangeText={setUsername}
                error={errors.username}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Password</Text>
              <View style={styles.passwordRow}>
                <View style={styles.passwordInputWrapper}>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.input,
                        borderColor: errors.password
                          ? colors.danger
                          : colors.inputBorder,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Enter password"
                      placeholderTextColor={colors.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => {
                        hapticService.trigger('light');
                        setShowPassword(!showPassword);
                      }}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color={colors.textSecondary} strokeWidth={1.5} />
                      ) : (
                        <Eye size={18} color={colors.textSecondary} strokeWidth={1.5} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text style={[styles.errorText, { color: colors.danger }]}>{errors.password}</Text>
                  )}
                </View>
                <GlassButton
                  title="Generate"
                  variant="secondary"
                  size="small"
                  onPress={handleGeneratePassword}
                />
              </View>
            </View>

            {/* Website (Optional) */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Website (Optional)</Text>
              <GlassInput
                placeholder="https://example.com"
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Category</Text>
              <View style={styles.categoryGrid}>
              {ACCOUNT_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor:
                        category === cat.value ? colors.accentLight : colors.input,
                      borderColor: category === cat.value ? colors.accent : colors.inputBorder,
                    },
                  ]}
                  onPress={() => {
                    hapticService.trigger('light');
                    setCategory(cat.value as AccountCategory);
                  }}
                >
                  {React.cloneElement(CATEGORY_ICONS[cat.value], {
                    color: category === cat.value ? colors.accent : colors.textSecondary,
                  } as { color: string })}
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: category === cat.value ? colors.accent : colors.textSecondary },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.footerButtons}>
              <GlassButton
                title="Cancel"
                variant="ghost"
                onPress={handleClose}
                style={styles.cancelButton}
              />
              <GlassButton
                title={editAccount ? 'Update' : 'Save'}
                onPress={handleSave}
                style={styles.saveButton}
              />
            </View>
          </ScrollView>
        </GlassCard>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    maxHeight: '85%',
  },
  modalContent: {
    margin: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentInner: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  passwordInputWrapper: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    width: (100 - 10) / 3 + '%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    height: 52,
  },
  saveButton: {
    flex: 1,
    height: 52,
  },
});
