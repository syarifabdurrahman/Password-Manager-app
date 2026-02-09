/**
 * VaultScreen Component
 * Main screen for the password vault with search functionality
 * Features: search, filter by category, one-tap copy
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import {
  Plus,
  Search as SearchIcon,
  Lock,
  Sparkles,
  SlidersHorizontal,
  Film,
  Code,
  MessageCircle,
  CreditCard,
  Briefcase,
  Folder,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SearchBar, GlassCard, GlassButton } from '@/components';
import { AccountCard, AddAccountModal } from '@/components/vault';
import { accountsStorage, hapticService } from '@/services';
import { STORAGE_KEYS, ACCOUNT_CATEGORIES, type Account, type AccountCategory } from '@/types';

interface VaultScreenProps {
  onNavigateToGenerator?: () => void;
  onNavigateToSettings?: () => void;
}

export const VaultScreen: React.FC<VaultScreenProps> = ({
  onNavigateToGenerator,
  onNavigateToSettings,
}) => {
  const { colors, isDark } = useTheme();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AccountCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [deletingAccount, setDeletingAccount] = useState<Account | undefined>();

  // Icon map for categories
  const CATEGORY_ICONS: Record<string, React.ReactElement> = {
    all: <Lock size={16} strokeWidth={1.5} />,
    entertainment: <Film size={16} strokeWidth={1.5} />,
    development: <Code size={16} strokeWidth={1.5} />,
    social: <MessageCircle size={16} strokeWidth={1.5} />,
    finance: <CreditCard size={16} strokeWidth={1.5} />,
    work: <Briefcase size={16} strokeWidth={1.5} />,
    other: <Folder size={16} strokeWidth={1.5} />,
  };

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  // Filter accounts based on search and category
  useEffect(() => {
    let filtered = accounts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (acc) =>
          acc.name.toLowerCase().includes(query) ||
          acc.username.toLowerCase().includes(query) ||
          acc.website?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((acc) => acc.category === selectedCategory);
    }

    setFilteredAccounts(filtered);
  }, [accounts, searchQuery, selectedCategory]);

  const loadAccounts = async () => {
    try {
      const stored = await accountsStorage.get(STORAGE_KEYS.ACCOUNTS);
      if (stored) {
        setAccounts(stored);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const saveAccounts = async (updatedAccounts: Account[]) => {
    try {
      await accountsStorage.set(STORAGE_KEYS.ACCOUNTS, updatedAccounts);
      setAccounts(updatedAccounts);
    } catch (error) {
      console.error('Error saving accounts:', error);
      Alert.alert('Error', 'Failed to save account');
    }
  };

  const handleAddAccount = useCallback(() => {
    hapticService.trigger('medium');
    setEditingAccount(undefined);
    setModalVisible(true);
  }, []);

  const handleEditAccount = useCallback((account: Account) => {
    hapticService.trigger('medium');
    setEditingAccount(account);
    setModalVisible(true);
  }, []);

  const handleDeleteAccount = useCallback((account: Account) => {
    hapticService.trigger('warning');
    setDeletingAccount(account);
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = accounts.filter((a) => a.id !== account.id);
            saveAccounts(updated);
            setDeletingAccount(undefined);
          },
        },
      ]
    );
  }, [accounts]);

  const handleSaveAccount = useCallback(
    (accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (editingAccount) {
        // Update existing account
        const updated = accounts.map((a) =>
          a.id === editingAccount.id
            ? { ...a, ...accountData, updatedAt: Date.now() }
            : a
        );
        saveAccounts(updated);
      } else {
        // Add new account
        const newAccount: Account = {
          ...accountData,
          id: Date.now().toString(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        saveAccounts([...accounts, newAccount]);
      }
    },
    [editingAccount, accounts]
  );

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleCategoryChange = useCallback((category: AccountCategory | 'all') => {
    hapticService.trigger('light');
    setSelectedCategory(category);
  }, []);

  const renderAccount = useCallback(
    ({ item, index }: { item: Account; index: number }) => (
      <AccountCard
        account={item}
        onEdit={() => handleEditAccount(item)}
        onDelete={() => handleDeleteAccount(item)}
      />
    ),
    [handleEditAccount, handleDeleteAccount]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Lock size={56} color={colors.textMuted} strokeWidth={1} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Your Vault is Empty</Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        Start by adding your first account
      </Text>
      <GlassButton
        title="Add Account"
        onPress={handleAddAccount}
      />
    </View>
  );

  const renderNoResults = () => (
    <View style={styles.emptyContainer}>
      <SearchIcon size={56} color={colors.textMuted} strokeWidth={1} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Results Found</Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        Try adjusting your search or filters
      </Text>
      <GlassButton
        title="Clear Filters"
        variant="secondary"
        onPress={() => {
          setSearchQuery('');
          setSelectedCategory('all');
        }}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Welcome back
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Your Vault</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.inputBorder }]}
            onPress={() => {
              hapticService.trigger('light');
              setShowFilters(!showFilters);
            }}
          >
            <SlidersHorizontal
              size={18}
              color={selectedCategory !== 'all' ? colors.accent : colors.textSecondary}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.inputBorder }]}
            onPress={() => {
              hapticService.trigger('light');
              onNavigateToGenerator?.();
            }}
          >
            <Sparkles
              size={18}
              color={colors.accent}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filters - Toggleable */}
      {showFilters && (
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ value: 'all' as const, label: 'All' }, ...ACCOUNT_CATEGORIES]}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory === item.value ? colors.accent : colors.backgroundSecondary,
                    borderColor:
                      selectedCategory === item.value ? colors.accent : colors.inputBorder,
                  },
                ]}
                onPress={() => handleCategoryChange(item.value as AccountCategory | 'all')}
              >
                {React.cloneElement(CATEGORY_ICONS[item.value], {
                  color: selectedCategory === item.value ? '#FFFFFF' : colors.textSecondary,
                } as { color: string })}
                <Text
                  style={[
                    styles.categoryLabel,
                    {
                      color: selectedCategory === item.value ? '#FFFFFF' : colors.textSecondary,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      )}

      {/* Search Bar - Full width */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        renderEmpty()
      ) : filteredAccounts.length === 0 ? (
        renderNoResults()
      ) : (
        <FlatList
          data={filteredAccounts}
          keyExtractor={(item) => item.id}
          renderItem={renderAccount}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent }, !isDark && styles.fabLight]}
        onPress={handleAddAccount}
        activeOpacity={0.9}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={2} />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <AddAccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveAccount}
        editAccount={editingAccount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  categoriesContainer: {
    marginBottom: 12,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1.5,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 0,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  emptyButton: {
    minWidth: 160,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabLight: {},
});
