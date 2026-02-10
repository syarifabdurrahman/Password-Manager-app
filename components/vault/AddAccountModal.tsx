/**
 * AddAccountModal Component
 * Modal for adding/editing accounts with form validation
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  Film,
  Code,
  MessageCircle,
  CreditCard,
  Briefcase,
  Folder,
  Eye,
  EyeOff,
  Globe,
  User,
  Key,
  ChevronDown,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { GlassCard, GlassButton } from "@/components/common";
import { hapticService, passwordGenerator } from "@/services";
import { ACCOUNT_CATEGORIES } from "@/types";
import type { Account, AccountCategory } from "@/types";

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, "id" | "createdAt" | "updatedAt">) => void;
  editAccount?: Account;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  visible,
  onClose,
  onSave,
  editAccount,
}) => {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState<AccountCategory>("other");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
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
      setCategory(editAccount.category);
    } else {
      resetForm();
    }
  }, [editAccount, visible]);

  const resetForm = () => {
    setName("");
    setUsername("");
    setPassword("");
    setCategory("other");
    setErrors({});
    setShowCategoryDropdown(false);
  };

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Service name is required";
    if (!username.trim()) newErrors.username = "Username is required";
    if (!password.trim()) newErrors.password = "Password is required";
    if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, username, password]);

  const handleGeneratePassword = useCallback(() => {
    hapticService.trigger("medium");
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
      hapticService.trigger("error");
      return;
    }

    hapticService.trigger("success");
    onSave({
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      category,
    });

    resetForm();
    onClose();
  }, [name, username, password, category, validate, onSave, onClose]);

  const handleClose = useCallback(() => {
    hapticService.trigger("light");
    resetForm();
    onClose();
  }, [onClose]);

  const selectedCategoryLabel =
    ACCOUNT_CATEGORIES.find((c) => c.value === category)?.label ||
    "Select Category";
  const SelectedCategoryIcon = CATEGORY_ICONS[category];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.overlay} />

        <View style={styles.centeredContainer}>
          <GlassCard style={styles.modalContent} reducedTransparency>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <X size={20} color={colors.text} strokeWidth={1.5} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>
                {editAccount ? "Edit Account" : "Add Account"}
              </Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.formContent}>
              {/* Service Name */}
              <View style={styles.inputSection}>
                <Text
                  style={[styles.sectionLabel, { color: colors.textSecondary }]}
                >
                  Service Name
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.input,
                      borderColor: errors.name
                        ? colors.danger
                        : colors.inputBorder,
                    },
                  ]}
                >
                  <Globe
                    size={18}
                    color={colors.textSecondary}
                    strokeWidth={1.5}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="e.g., Netflix, GitHub"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
                {errors.name && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>
                    {errors.name}
                  </Text>
                )}
              </View>

              {/* Username/Email */}
              <View style={styles.inputSection}>
                <Text
                  style={[styles.sectionLabel, { color: colors.textSecondary }]}
                >
                  Username / Email
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.input,
                      borderColor: errors.username
                        ? colors.danger
                        : colors.inputBorder,
                    },
                  ]}
                >
                  <User
                    size={18}
                    color={colors.textSecondary}
                    strokeWidth={1.5}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter username or email"
                    placeholderTextColor={colors.textMuted}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                {errors.username && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>
                    {errors.username}
                  </Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.inputSection}>
                <Text
                  style={[styles.sectionLabel, { color: colors.textSecondary }]}
                >
                  Password
                </Text>
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
                  <Key
                    size={18}
                    color={colors.textSecondary}
                    strokeWidth={1.5}
                    style={styles.inputIcon}
                  />
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
                      hapticService.trigger("light");
                      setShowPassword(!showPassword);
                    }}
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                        color={colors.textSecondary}
                        strokeWidth={1.5}
                      />
                    ) : (
                      <Eye
                        size={18}
                        color={colors.textSecondary}
                        strokeWidth={1.5}
                      />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>
                    {errors.password}
                  </Text>
                )}
              </View>

              {/* Category Dropdown */}
              <View style={styles.inputSection}>
                <Text
                  style={[styles.sectionLabel, { color: colors.textSecondary }]}
                >
                  Category
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    {
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                  onPress={() => {
                    hapticService.trigger("light");
                    setShowCategoryDropdown(!showCategoryDropdown);
                  }}
                >
                  <View style={styles.dropdownContent}>
                    {React.cloneElement(SelectedCategoryIcon, {
                      color: colors.accent,
                    } as { color: string })}
                    <Text style={[styles.dropdownText, { color: colors.text }]}>
                      {selectedCategoryLabel}
                    </Text>
                  </View>
                  <ChevronDown
                    size={18}
                    color={colors.textSecondary}
                    strokeWidth={1.5}
                  />
                </TouchableOpacity>
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
                  title={editAccount ? "Update" : "Save"}
                  onPress={handleSave}
                  style={styles.saveButton}
                />
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Dropdown Modal - Overlay */}
        <Modal
          visible={showCategoryDropdown}
          transparent
          animationType="none"
          onRequestClose={() => setShowCategoryDropdown(false)}
        >
          <SafeAreaView style={styles.dropdownSafeArea} edges={['bottom', 'left', 'right']}>
            <TouchableOpacity
              style={styles.dropdownOverlayTouchable}
              activeOpacity={1}
              onPress={() => setShowCategoryDropdown(false)}
            >
              <View style={styles.dropdownMenuWrapper}>
                <View
                  style={[
                    styles.dropdownMenu,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <ScrollView
                    style={styles.dropdownScroll}
                    contentContainerStyle={styles.dropdownScrollContent}
                    showsVerticalScrollIndicator={true}
                    bounces={false}
                  >
                    {ACCOUNT_CATEGORIES.map((cat) => {
                      const CatIcon = CATEGORY_ICONS[cat.value];
                      return (
                        <TouchableOpacity
                          key={cat.value}
                          style={[
                            styles.dropdownItem,
                            category === cat.value && {
                              backgroundColor: colors.accentLight,
                            },
                            { borderBottomColor: colors.divider },
                          ]}
                          onPress={() => {
                            hapticService.trigger("light");
                            setCategory(cat.value as AccountCategory);
                            setShowCategoryDropdown(false);
                          }}
                        >
                          {React.cloneElement(CatIcon, {
                            color:
                              category === cat.value
                                ? colors.accent
                                : colors.textSecondary,
                          } as { color: string })}
                          <Text
                            style={[
                              styles.dropdownItemText,
                              {
                                color:
                                  category === cat.value
                                    ? colors.accent
                                    : colors.text,
                              },
                            ]}
                          >
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 450,
    borderRadius: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: 600,
  },
  inputSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
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
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 52,
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "500",
  },
  chevron: {
    transition: { transform: { duration: 200 } },
  },
  dropdownOverlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  dropdownSafeArea: {
    flex: 1,
  },
  dropdownMenuWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  dropdownMenu: {
    width: "100%",
    maxWidth: 330,
    alignSelf: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 240,
  },
  dropdownScrollContent: {
    flexGrow: 1,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: "500",
  },
  footerButtons: {
    flexDirection: "row",
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
