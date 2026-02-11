/**
 * SettingsScreen Component
 * App settings and preferences
 */

import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  Lock,
  Moon,
  Sun,
  Info,
  Trash2,
  Download,
  Upload,
  Palette,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { GlassCard } from "@/components";
import { hapticService, accountsStorage, encryptBackup, decryptBackup } from "@/services";
import { STORAGE_KEYS } from "@/types";
import RNFS from 'react-native-fs';

interface SettingsScreenProps {
  onBack?: () => void;
}

interface SettingItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  destructive?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingItem[];
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    title: "Appearance",
    items: [
      {
        id: "theme",
        icon: "palette",
        title: "Theme",
        description: "Dark mode is always on",
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        id: "pin",
        icon: "lock",
        title: "PIN Protection",
        description: "Require PIN to access vault",
      },
    ],
  },
  {
    title: "Data",
    items: [
      {
        id: "backup",
        icon: "download",
        title: "Backup Data",
        description: "Export your vault (Encrypted)",
      },
      {
        id: "restore",
        icon: "upload",
        title: "Restore Backup",
        description: "Import from backup",
      },
      {
        id: "clear",
        icon: "trash",
        title: "Clear All Data",
        description: "Delete all accounts",
        destructive: true,
      },
    ],
  },
  {
    title: "About",
    items: [
      {
        id: "about",
        icon: "info",
        title: "About MaVault",
        description: "Version 1.0.0",
      },
    ],
  },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  palette: <Palette size={18} strokeWidth={1.5} />,
  lock: <Lock size={18} strokeWidth={1.5} />,
  download: <Download size={18} strokeWidth={1.5} />,
  upload: <Upload size={18} strokeWidth={1.5} />,
  trash: <Trash2 size={18} strokeWidth={1.5} />,
  info: <Info size={18} strokeWidth={1.5} />,
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { colors, theme, setTheme, isDark } = useTheme();
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState("");

  // Encryption password modal states
  const [encryptModalVisible, setEncryptModalVisible] = useState(false);
  const [encryptPassword, setEncryptPassword] = useState("");
  const [encryptConfirmPassword, setEncryptConfirmPassword] = useState("");
  const [decryptModalVisible, setDecryptModalVisible] = useState(false);
  const [decryptPassword, setDecryptPassword] = useState("");
  const [backupFilePath, setBackupFilePath] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Load PIN setting on mount
  useEffect(() => {
    const loadPinSetting = async () => {
      try {
        const savedPin = await accountsStorage.get(STORAGE_KEYS.PIN);
        setPinEnabled(!!savedPin);
      } catch (error) {
        console.log("Error loading PIN setting:", error);
      }
    };
    loadPinSetting();
  }, []);

  const handleSettingPress = useCallback(
    async (settingId: string) => {
      hapticService.trigger("light");

      switch (settingId) {
        case "theme":
          setTheme(theme === "dark" ? "light" : "dark");
          hapticService.trigger("medium");
          break;

        case "backup":
          try {
            const accounts = await accountsStorage.get(STORAGE_KEYS.ACCOUNTS);
            if (accounts && accounts.length > 0) {
              // Show encryption password modal
              setEncryptPassword("");
              setEncryptConfirmPassword("");
              setEncryptModalVisible(true);
            } else {
              Alert.alert("No Data", "No accounts to backup");
            }
          } catch (error) {
            console.error("Backup error:", error);
            Alert.alert("Error", "Failed to prepare backup");
          }
          break;

        case "restore":
          setDecryptPassword("");
          setBackupFilePath(null);
          setDecryptModalVisible(true);
          break;

        case "clear":
          Alert.alert(
            "Clear All Data",
            "This will permanently delete all your accounts. This action cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Clear All",
                style: "destructive",
                onPress: async () => {
                  try {
                    await accountsStorage.remove(STORAGE_KEYS.ACCOUNTS);
                    Alert.alert("Success", "All data has been cleared");
                  } catch (error) {
                    Alert.alert("Error", "Failed to clear data");
                  }
                },
              },
            ],
          );
          break;

        case "about":
          Alert.alert("About MaVault", "A secure Password manager", [
            { text: "OK" },
          ]);
          break;

        case "pin":
          // Toggle is handled by Switch component
          break;

        default:
          Alert.alert("Coming Soon", "This feature will be available soon");
      }
    },
    [theme, setTheme],
  );

  const handleEncryptedBackup = useCallback(async () => {
    if (encryptPassword.length < 4) {
      Alert.alert("Weak Password", "Encryption password must be at least 4 characters");
      return;
    }

    if (encryptPassword !== encryptConfirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match");
      return;
    }

    try {
      hapticService.trigger("medium");

      const accounts = await accountsStorage.get(STORAGE_KEYS.ACCOUNTS);
      if (!accounts || accounts.length === 0) {
        Alert.alert("No Data", "No accounts to backup");
        return;
      }

      // Create backup data with metadata
      const backupData = {
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        count: accounts.length,
        accounts: accounts,
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(backupData, null, 2);

      // Encrypt the data
      const encrypted = encryptBackup(jsonString, encryptPassword);

      // Create filename
      const date = new Date().toISOString().split('T')[0];
      const fileName = `MaVault_Backup_${date}.encrypted`;

      if (Platform.OS === 'android') {
        // Save encrypted backup to Downloads/MaVault Backup folder on Android
        try {
          const downloadDirPath = RNFS.DownloadDirectoryPath;
          const backupFolderPath = `${downloadDirPath}/MaVault Backup`;

          // Check if folder exists, create if not
          const folderExists = await RNFS.exists(backupFolderPath);
          if (!folderExists) {
            await RNFS.mkdir(backupFolderPath);
          }

          const backupFilePath = `${backupFolderPath}/${fileName}`;

          // Save encrypted data as JSON
          const encryptedJson = JSON.stringify(encrypted);
          await RNFS.writeFile(backupFilePath, encryptedJson, 'utf8');

          console.log('Encrypted backup saved to:', backupFilePath);

          setEncryptModalVisible(false);
          setEncryptPassword("");
          setEncryptConfirmPassword("");
          hapticService.trigger("success");
          Alert.alert(
            "Backup Complete",
            `Encrypted backup saved to Downloads/MaVault Backup/${fileName}\n\nKeep your encryption password safe! You'll need it to restore.`,
          );
        } catch (writeError) {
          console.error('Failed to write backup:', writeError);
          const errorMessage = (writeError instanceof Error ? writeError.message : typeof writeError === 'string' ? writeError : String(writeError));
          Alert.alert("Error", `Failed to save backup: ${errorMessage}`);
        }
      } else {
        Alert.alert("Coming Soon", "iOS encrypted backup coming soon");
      }
    } catch (error) {
      console.error("Backup error:", error);
      Alert.alert("Error", "Failed to create encrypted backup");
    }
  }, [encryptPassword, encryptConfirmPassword]);

  const handleRestoreBackup = useCallback(async () => {
    if (!backupFilePath || decryptPassword.length < 4) {
      Alert.alert("Invalid Input", "Please select a backup file and enter password");
      return;
    }

    try {
      hapticService.trigger("medium");
      setIsDecrypting(true);

      // Read the encrypted backup file
      const fileContent = await RNFS.readFile(backupFilePath, 'utf8');
      const encryptedBackup = JSON.parse(fileContent);

      // Verify the backup format
      if (!encryptedBackup.data || !encryptedBackup.iv || !encryptedBackup.salt || !encryptedBackup.version) {
        setIsDecrypting(false);
        Alert.alert("Invalid File", "This is not a valid encrypted backup file");
        return;
      }

      // Decrypt the data
      const decryptedJson = decryptBackup(encryptedBackup, decryptPassword);
      const backupData = JSON.parse(decryptedJson);

      setIsDecrypting(false);

      // Verify the data structure
      if (!backupData.accounts || !Array.isArray(backupData.accounts)) {
        Alert.alert("Invalid Backup", "Backup file format is invalid");
        return;
      }

      // Confirm restore
      Alert.alert(
        "Confirm Restore",
        `Restore ${backupData.count} account(s) from backup?\n\nThis will replace all existing accounts.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Restore",
            style: "destructive",
            onPress: async () => {
              try {
                await accountsStorage.set(STORAGE_KEYS.ACCOUNTS, backupData.accounts);
                setDecryptModalVisible(false);
                setDecryptPassword("");
                setBackupFilePath(null);
                hapticService.trigger("success");
                Alert.alert("Success", `${backupData.count} account(s) restored successfully`);
              } catch (error) {
                console.error("Restore error:", error);
                Alert.alert("Error", "Failed to restore backup");
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert("Decryption Failed", "Incorrect password or corrupted backup file");
    }
  }, [backupFilePath, decryptPassword]);

  const togglePinEnabled = useCallback(async (value: boolean) => {
    hapticService.trigger("light");

    if (value) {
      // Enable PIN - show modal to set new PIN
      setPinInput("");
      setPinModalVisible(true);
    } else {
      // Disable PIN - prompt to confirm
      Alert.alert(
        "Disable PIN",
        "Are you sure you want to remove PIN protection?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            style: "destructive",
            onPress: async () => {
              try {
                await accountsStorage.remove(STORAGE_KEYS.PIN);
                setPinEnabled(false);
                hapticService.trigger("success");
                Alert.alert("Success", "PIN protection disabled");
              } catch (error) {
                Alert.alert("Error", "Failed to disable PIN");
              }
            },
          },
        ],
      );
    }
  }, []);

  const handlePinSubmit = useCallback(async () => {
    if (pinInput.length !== 4 || !/^\d+$/.test(pinInput)) {
      Alert.alert("Invalid PIN", "PIN must be 4 digits");
      return;
    }

    try {
      await accountsStorage.set(STORAGE_KEYS.PIN, pinInput);
      setPinEnabled(true);
      setPinModalVisible(false);
      hapticService.trigger("success");
      Alert.alert("Success", "PIN protection enabled");
    } catch (error) {
      Alert.alert("Error", "Failed to set PIN");
    }
  }, [pinInput]);

  const renderSettingItem = useCallback(
    (item: SettingItem) => {
      if (item.id === "pin") {
        return (
          <View
            key={item.id}
            style={[styles.settingItem, { borderBottomColor: colors.divider }]}
          >
            <TouchableOpacity
              style={styles.settingContentArea}
              onPress={() => handleSettingPress(item.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: isDark ? colors.input : "#ECEDEE" },
                ]}
              >
                {ICON_MAP[item.icon]}
              </View>
              <View style={styles.settingContent}>
                <Text
                  style={[
                    styles.settingTitle,
                    { color: item.destructive ? colors.danger : colors.text },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
            <Switch
              value={pinEnabled || pinModalVisible}
              onValueChange={togglePinEnabled}
              trackColor={{ false: colors.input, true: colors.accent }}
              thumbColor={
                pinEnabled || pinModalVisible
                  ? colors.accent
                  : colors.textSecondary
              }
              ios_backgroundColor={colors.input}
            />
          </View>
        );
      }

      return (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.settingItem,
            { borderBottomColor: colors.divider },
            item.destructive && { opacity: 0.8 },
          ]}
          onPress={() => handleSettingPress(item.id)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.settingIcon,
              { backgroundColor: isDark ? colors.input : "#ECEDEE" },
            ]}
          >
            {ICON_MAP[item.icon]}
          </View>
          <View style={styles.settingContent}>
            <Text
              style={[
                styles.settingTitle,
                { color: item.destructive ? colors.danger : colors.text },
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.settingDescription,
                { color: colors.textSecondary },
              ]}
            >
              {item.description}
            </Text>
          </View>
          {item.id === "theme" && (
            <View style={styles.settingValue}>
              {theme === "dark" ? (
                <Moon size={18} color={colors.accent} strokeWidth={1.5} />
              ) : (
                <Sun size={18} color={colors.accent} strokeWidth={1.5} />
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [
      colors,
      theme,
      handleSettingPress,
      pinEnabled,
      pinModalVisible,
      togglePinEnabled,
    ],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            hapticService.trigger("light");
            onBack?.();
          }}
        >
          <ArrowLeft size={20} color={colors.text} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              {section.title}
            </Text>
            <GlassCard style={styles.sectionCard}>
              {section.items.map(renderSettingItem)}
            </GlassCard>
          </View>
        ))}
        <View style={styles.developerSection}>
          <Text style={styles.developerLabel}>developer:</Text>
          <Text style={[styles.developerNames, { color: colors.text }]}>
            Favian Hugo, Syarif Abdurrahman
          </Text>
        </View>
      </ScrollView>

      {/* PIN Modal */}
      <Modal
        visible={pinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPinModalVisible(false)}
        statusBarTranslucent={Platform.OS === "ios"}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Set PIN
              </Text>
              <Text
                style={[styles.modalMessage, { color: colors.textSecondary }]}
              >
                Enter a 4-digit PIN to protect your vault
              </Text>
              <TextInput
                style={[
                  styles.pinInput,
                  {
                    backgroundColor: colors.input,
                    color: colors.text,
                    borderColor: colors.inputBorder,
                  },
                ]}
                value={pinInput}
                onChangeText={setPinInput}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                placeholder="••••"
                placeholderTextColor={colors.textMuted}
                textAlign="center"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.cancelButton,
                    { borderColor: colors.inputBorder },
                  ]}
                  onPress={() => setPinModalVisible(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    { backgroundColor: colors.accent },
                  ]}
                  onPress={handlePinSubmit}
                >
                  <Text
                    style={[styles.modalButtonText, styles.confirmButtonText]}
                  >
                    Set PIN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Encryption Password Modal */}
      <Modal
        visible={encryptModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEncryptModalVisible(false)}
        statusBarTranslucent={Platform.OS === "ios"}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
                <Lock size={32} color={colors.accent} strokeWidth={2} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Encrypt Backup
              </Text>
              <Text
                style={[styles.modalMessage, { color: colors.textSecondary }]}
              >
                Create a password to encrypt your backup file
              </Text>
              <TextInput
                style={[
                  styles.pinInput,
                  {
                    backgroundColor: colors.input,
                    color: colors.text,
                    borderColor: colors.inputBorder,
                  },
                ]}
                value={encryptPassword}
                onChangeText={setEncryptPassword}
                placeholder="Encryption password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={[
                  styles.pinInput,
                  {
                    backgroundColor: colors.input,
                    color: colors.text,
                    borderColor: colors.inputBorder,
                  },
                ]}
                value={encryptConfirmPassword}
                onChangeText={setEncryptConfirmPassword}
                placeholder="Confirm password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.cancelButton,
                    { borderColor: colors.inputBorder },
                  ]}
                  onPress={() => setEncryptModalVisible(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    { backgroundColor: colors.accent },
                  ]}
                  onPress={handleEncryptedBackup}
                >
                  <Text
                    style={[styles.modalButtonText, styles.confirmButtonText]}
                  >
                    Encrypt & Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Decryption/Restore Modal */}
      <Modal
        visible={decryptModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDecryptModalVisible(false)}
        statusBarTranslucent={Platform.OS === "ios"}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
                <Upload size={32} color={colors.accent} strokeWidth={2} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Restore Backup
              </Text>
              <Text
                style={[styles.modalMessage, { color: colors.textSecondary }]}
              >
                Select your backup file from Downloads/MaVault Backup and enter the password
              </Text>
              {isDecrypting && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={colors.accent} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Decrypting...
                  </Text>
                </View>
              )}
              {Platform.OS === 'android' && (
                <TouchableOpacity
                  style={[
                    styles.fileSelectButton,
                    { backgroundColor: colors.input, borderColor: colors.inputBorder },
                  ]}
                  onPress={async () => {
                    try {
                      const backupFolderPath = `${RNFS.DownloadDirectoryPath}/MaVault Backup`;
                      const files = await RNFS.readDir(backupFolderPath);

                      if (files.length === 0) {
                        Alert.alert("No Files", "No backup files found in Downloads/MaVault Backup");
                        return;
                      }

                      // Show file selection
                      const buttons = files
                        .filter(f => f.name.endsWith('.encrypted'))
                        .slice(0, 5)
                        .map((file) => ({
                          text: file.name,
                          onPress: () => {
                            setBackupFilePath(`${backupFolderPath}/${file.name}`);
                          },
                        }));

                      Alert.alert(
                        "Select Backup File",
                        "Choose a backup file to restore:",
                        [...buttons, { text: "Cancel", style: "cancel" }]
                      );
                    } catch (error) {
                      console.error("Error reading backup folder:", error);
                      Alert.alert("Error", "Failed to read backup folder");
                    }
                  }}
                >
                  <Text style={[styles.fileSelectText, { color: colors.text }]}>
                    Select from Downloads/MaVault Backup
                  </Text>
                </TouchableOpacity>
              )}
              {backupFilePath && (
                <Text style={[styles.selectedFileText, { color: colors.accent }]}>
                  {backupFilePath.split('/').pop()}
                </Text>
              )}
              <TextInput
                style={[
                  styles.pinInput,
                  {
                    backgroundColor: colors.input,
                    color: colors.text,
                    borderColor: colors.inputBorder,
                  },
                ]}
                value={decryptPassword}
                onChangeText={setDecryptPassword}
                placeholder="Decryption password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.cancelButton,
                    { borderColor: colors.inputBorder },
                  ]}
                  onPress={() => setDecryptModalVisible(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    { backgroundColor: colors.accent },
                  ]}
                  onPress={handleRestoreBackup}
                  disabled={!backupFilePath || decryptPassword.length < 4}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      styles.confirmButtonText,
                      !backupFilePath || decryptPassword.length < 4 ? { opacity: 0.5 } : {},
                    ]}
                  >
                    Decrypt & Restore
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "left" as const,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionCard: {
    padding: 0,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingContentArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 2,
    textAlign: "left" as const,
  },
  settingDescription: {
    fontSize: 14,
  },
  settingValue: {
    marginLeft: 12,
  },
  developerSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  developerLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  developerNames: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  pinInput: {
    fontSize: 16,
    fontWeight: "500",
    borderRadius: 12,
    borderWidth: 1.5,
    height: 50,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  cancelButton: {
    backgroundColor: "transparent",
  },
  confirmButton: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
  },
  fileSelectButton: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  fileSelectText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  selectedFileText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
});
