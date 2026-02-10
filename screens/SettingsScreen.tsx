/**
 * SettingsScreen Component
 * App settings and preferences
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
        id: 'biometric',
        icon: 'fingerprint',
        title: 'Biometric Unlock',
        description: 'Coming soon',
      },
      {
        id: 'auto-lock',
        icon: 'lock',
        title: 'Auto-Lock',
        description: 'Coming soon',
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
  fingerprint: <Shield size={18} strokeWidth={1.5} />,
  lock: <Shield size={18} strokeWidth={1.5} />,
  download: <Download size={18} strokeWidth={1.5} />,
  upload: <Upload size={18} strokeWidth={1.5} />,
  trash: <Trash2 size={18} strokeWidth={1.5} />,
  info: <Info size={18} strokeWidth={1.5} />,
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { colors, theme, setTheme, isDark } = useTheme();

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

        default:
          Alert.alert('Coming Soon', 'This feature will be available soon');
      }
    },
    [theme, setTheme]
  );

  const renderSettingItem = useCallback(
    (item: SettingItem) => (
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
    ),
    [colors, theme, handleSettingPress]
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
});
