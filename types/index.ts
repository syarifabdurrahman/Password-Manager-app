/**
 * Domain Models and Types for MaVault
 * Following SOLID principles with clear separation of concerns
 */

// ==================== Core Domain Types ====================

/**
 * Account entity representing a stored password entry
 */
export interface Account {
  id: string;
  name: string;
  username: string;
  password: string;
  website?: string;
  category: AccountCategory;
  icon?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Supported account categories
 */
export type AccountCategory =
  | 'entertainment'
  | 'development'
  | 'social'
  | 'finance'
  | 'work'
  | 'other';

/**
 * Password generation options
 */
export interface PasswordGenerationOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

/**
 * Vault state for search and filtering
 */
export interface VaultState {
  accounts: Account[];
  filteredAccounts: Account[];
  searchQuery: string;
  selectedCategory: AccountCategory | 'all';
}

// ==================== Service Interfaces (SOLID: Interface Segregation) ====================

/**
 * Storage service interface for data persistence
 */
export interface IStorageService<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Password generation service interface
 */
export interface IPasswordGeneratorService {
  generate(options: PasswordGenerationOptions): string;
  calculateEntropy(password: string): number;
  estimateStrength(password: string): PasswordStrength;
}

/**
 * Clipboard service interface
 */
export interface IClipboardService {
  copyToClipboard(text: string): Promise<boolean>;
  getFromClipboard(): Promise<string>;
}

/**
 * Haptic feedback service interface
 */
export interface IHapticService {
  trigger(type: HapticType): void;
}

/**
 * Analytics service interface (optional, for future use)
 */
export interface IAnalyticsService {
  trackEvent(event: string, data?: Record<string, unknown>): void;
}

// ==================== Supporting Types ====================

/**
 * Password strength levels
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

/**
 * Haptic feedback types
 */
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * App navigation screens
 */
export type AppScreen = 'vault' | 'generator' | 'settings';

/**
 * Modal states
 */
export type ModalState = {
  type: 'add' | 'edit' | 'delete' | null;
  account?: Account;
};

/**
 * Toast notification data
 */
export interface ToastData {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

// ==================== Storage Keys ====================

export const STORAGE_KEYS = {
  ACCOUNTS: '@mavault_accounts',
  SETTINGS: '@mavault_settings',
  BACKUP: '@mavault_backup',
  PIN: '@mavault_pin',
} as const;

// ==================== Constants ====================

export const DEFAULT_PASSWORD_OPTIONS: PasswordGenerationOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
};

export const PASSWORD_RANGES = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 64,
  DEFAULT_LENGTH: 16,
} as const;

export const ACCOUNT_CATEGORIES: { value: AccountCategory; label: string; icon: 'Film' | 'Code' | 'MessageCircle' | 'CreditCard' | 'Briefcase' | 'Folder' }[] = [
  { value: 'entertainment', label: 'Entertainment', icon: 'Film' },
  { value: 'development', label: 'Development', icon: 'Code' },
  { value: 'social', label: 'Social', icon: 'MessageCircle' },
  { value: 'finance', label: 'Finance', icon: 'CreditCard' },
  { value: 'work', label: 'Work', icon: 'Briefcase' },
  { value: 'other', label: 'Other', icon: 'Folder' },
] as const;