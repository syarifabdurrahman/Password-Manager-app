/**
 * SettingsScreen Component
 * App settings and preferences
 */

import React, { useCallback, useState, useEffect } from 'react';
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
} from 'react-native';
import {
  ArrowLeft,
  Shield,
  Moon,
  Sun,
  Info,
  Trash2,
  Download,
  Upload,
  Palette,
  Lock,
} from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components';
import { hapticService, accountsStorage } from '@/services';
import { STORAGE_KEYS } from '@/types';

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
    title: 'Appearance',
    items: [
      {
        id: 'theme',
        icon: 'palette',
        title: 'Theme',
        description: 'Dark mode is always on',
      },
    ],
  },
  {
    title: 'Security',
    items: [
      {
        id: 'pin',
        icon: 'lock',
        title: 'PIN Protection',
        description: 'Require PIN to access vault',
      },
    ],
  },
  {
    title: 'Data',
    items: [
      {
        id: 'backup',
        icon: 'download',
        title: 'Backup Data',
        description: 'Export your vault',
      },
      {
        id: 'restore',
        icon: 'upload',
        title: 'Restore Backup',
        description: 'Import from backup',
      },
      {
        id: 'clear',
        icon: 'trash',
        title: 'Clear All Data',
        description: 'Delete all accounts',
        destructive: true,
      },
    ],
  },
  {
    title: 'About',
    items: [
      {
        id: 'about',
        icon: 'info',
        title: 'About MaVault',
        description: 'Version 1.0.0',
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
  const [pinInput, setPinInput] = useState('');
  const [pinMode, setPinMode] = useState<'set' | 'disable'>('set');

  // Load PIN setting on mount
  useEffect(() => {
    const loadPinSetting = async () => {
      try {
        const savedPin = await accountsStorage.get(STORAGE_KEYS.PIN);
        setPinEnabled(!!savedPin);
      } catch (error) {
        console.log('Error loading PIN setting:', error);
      }
    };
    loadPinSetting();
  }, []);

  const handleSettingPress = useCallback(
    async (settingId: string) => {
      hapticService.trigger('light');

      switch (settingId) {
        case 'theme':
          setTheme(theme === 'dark' ? 'light' : 'dark');
          hapticService.trigger('medium');
          break;

        case 'backup':
          try {
            const accounts = await accountsStorage.get(STORAGE_KEYS.ACCOUNTS);
            if (accounts && accounts.length > 0) {
              // Show backup options - in a real app, this would share/export
              Alert.alert(
                'Backup Created',
                `Backup contains ${accounts.length} account(s)`
              );
            } else {
              Alert.alert('No Data', 'No accounts to backup');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to create backup');
          }
          break;

        case 'restore':
          Alert.alert(
            'Restore Backup',
            'This feature will be available in future updates',
            [{ text: 'OK' }]
          );
          break;

        case 'clear':
          Alert.alert(
            'Clear All Data',
            'This will permanently delete all your accounts. This action cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Clear All',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await accountsStorage.remove(STORAGE_KEYS.ACCOUNTS);
                    Alert.alert('Success', 'All data has been cleared');
                  } catch (error) {
                    Alert.alert('Error', 'Failed to clear data');
                  }
                },
              },
            ]
          );
          break;

        case 'about':
          Alert.alert(
            'About MaVault',
            'A secure Password manager',
            [{ text: 'OK' }]
          );
          break;

        case 'pin':
          // Toggle is handled by Switch component
          break;

        default:
          Alert.alert('Coming Soon', 'This feature will be available soon');
      }
    },
    [theme, setTheme]
  );

  const togglePinEnabled = useCallback(async (value: boolean) => {
    hapticService.trigger('light');

    if (value) {
      // Enable PIN - show modal to set new PIN
      setPinMode('set');
      setPinInput('');
      setPinModalVisible(true);
    } else {
      // Disable PIN - prompt to confirm
      Alert.alert(
        'Disable PIN',
        'Are you sure you want to remove PIN protection?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              try {
                await accountsStorage.remove(STORAGE_KEYS.PIN);
                setPinEnabled(false);
                hapticService.trigger('success');
                Alert.alert('Success', 'PIN protection disabled');
              } catch (error) {
                Alert.alert('Error', 'Failed to disable PIN');
              }
            },
          },
        ]
      );
    }
  }, []);

  const handlePinSubmit = useCallback(async () => {
    if (pinInput.length !== 4 || !/^\d+$/.test(pinInput)) {
      Alert.alert('Invalid PIN', 'PIN must be 4 digits');
      return;
    }

    try {
      await accountsStorage.set(STORAGE_KEYS.PIN, pinInput);
      setPinEnabled(true);
      setPinModalVisible(false);
      hapticService.trigger('success');
      Alert.alert('Success', 'PIN protection enabled');
    } catch (error) {
      Alert.alert('Error', 'Failed to set PIN');
    }
  }, [pinInput]);

  const renderSettingItem = useCallback(
    (item: SettingItem) => {
      if (item.id === 'pin') {
        return (
          <View
            key={item.id}
            style={[
              styles.settingItem,
              { borderBottomColor: colors.divider },
            ]}
          >
            <TouchableOpacity
              style={styles.settingContentArea}
              onPress={() => handleSettingPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIcon, { backgroundColor: isDark ? colors.input : '#ECEDEE' }]}>
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
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
            <Switch
              value={pinEnabled}
              onValueChange={togglePinEnabled}
              trackColor={{ false: colors.input, true: colors.accent }}
              thumbColor={pinEnabled ? colors.accent : colors.textSecondary}
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
          <View style={[styles.settingIcon, { backgroundColor: isDark ? colors.input : '#ECEDEE' }]}>
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
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
          {item.id === 'theme' && (
            <View style={styles.settingValue}>
              {theme === 'dark' ? (
                <Moon size={18} color={colors.accent} strokeWidth={1.5} />
              ) : (
                <Sun size={18} color={colors.accent} strokeWidth={1.5} />
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [colors, theme, handleSettingPress, pinEnabled, togglePinEnabled]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            hapticService.trigger('light');
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
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Set PIN
            </Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Enter a 4-digit PIN to protect your vault
            </Text>
            <TextInput
              style={[styles.pinInput, {
                backgroundColor: colors.input,
                color: colors.text,
                borderColor: colors.inputBorder
              }]}
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
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.inputBorder }]}
                onPress={() => setPinModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: colors.accent }]}
                onPress={handlePinSubmit}
              >
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>Set PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'left' as const,
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
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingContentArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
    textAlign: 'left' as const,
  },
  settingDescription: {
    fontSize: 14,
  },
  settingValue: {
    marginLeft: 12,
  },
  developerSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  developerLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  developerNames: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  pinInput: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    height: 60,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  confirmButton: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
});
