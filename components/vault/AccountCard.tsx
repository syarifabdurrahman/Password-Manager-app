/**
 * AccountCard Component
 * Glassmorphism-styled card for displaying saved accounts
 * Features one-tap copy with haptic feedback
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Copy, Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/common';
import { hapticService, clipboardService } from '@/services';
import type { Account } from '@/types';

interface AccountCardProps {
  account: Account;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isVisible?: boolean;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onPress,
  onEdit,
  onDelete,
  isVisible = false,
}) => {
  const { colors, isDark } = useTheme();
  const [showPassword, setShowPassword] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<'password' | 'username' | null>(
    null
  );
  const scale = useRef(new Animated.Value(1)).current;

  // Generate initials from account name
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length === 0) return '??';
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Generate consistent color based on account name
  const getAvatarColor = (name: string) => {
    const colorsList = [
      '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B',
      '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colorsList[Math.abs(hash) % colorsList.length];
  };

  const initials = getInitials(account.name);
  const avatarColor = getAvatarColor(account.name);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleCopy = async (text: string, field: 'password' | 'username') => {
    hapticService.trigger('success');
    await clipboardService.copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleDelete = () => {
    hapticService.trigger('warning');
    onDelete?.();
  };

  const displayPassword = showPassword ? account.password : '•'.repeat(12);

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <GlassCard style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.titleContainer}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {account.name}
                </Text>
                <Text style={[styles.username, { color: colors.textSecondary }]} numberOfLines={1}>
                  {account.username}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              {onEdit && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <ExternalLink size={16} color={colors.textSecondary} strokeWidth={1.5} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleDelete}
                >
                  <Trash2 size={16} color={colors.danger} strokeWidth={1.5} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={[styles.passwordContainer, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : '#ECEDEE' }]}>
            <Text style={[styles.password, { color: colors.text }]}>
              {displayPassword}
            </Text>
            <View style={styles.passwordActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  hapticService.trigger('light');
                  setShowPassword(!showPassword);
                }}
              >
                {showPassword ? (
                  <EyeOff size={16} color={colors.textSecondary} strokeWidth={1.5} />
                ) : (
                  <Eye size={16} color={colors.textSecondary} strokeWidth={1.5} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, copiedField === 'password' && styles.copied]}
                onPress={() => handleCopy(account.password, 'password')}
              >
                <Copy
                  size={16}
                  color={copiedField === 'password' ? colors.success : colors.textSecondary}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
            </View>
          </View>

          {account.website && (
            <Text style={[styles.website, { color: colors.accent }]} numberOfLines={1}>
              {account.website}
            </Text>
          )}
        </GlassCard>
      </Animated.View>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  password: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  passwordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  copied: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  website: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.8,
  },
});
