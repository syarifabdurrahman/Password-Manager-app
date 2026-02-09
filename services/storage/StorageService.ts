/**
 * MMKV Storage Service Implementation (v2)
 * Implements IStorageService interface using react-native-mmkv v2
 * Follows Single Responsibility Principle - only handles storage operations
 * MMKV is much faster than AsyncStorage for password vault
 */

import { MMKV } from 'react-native-mmkv';
import type { IStorageService } from '@/types';

// Create MMKV instance with encryption for security
const storage = new MMKV();

/**
 * Generic MMKV Storage Service
 * @template T The type of data to store
 */
export class StorageService<T> implements IStorageService<T> {
  /**
   * Retrieve data from storage
   */
  async get(key: string): Promise<T | null> {
    try {
      const value = storage.getString(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error reading from storage for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Store data in storage
   */
  async set(key: string, value: T): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      storage.set(key, jsonString);
    } catch (error) {
      console.error(`Error writing to storage for key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Remove data from storage
   */
  async remove(key: string): Promise<void> {
    try {
      storage.delete(key);
    } catch (error) {
      console.error(`Error removing from storage for key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Clear all data from storage
   */
  async clear(): Promise<void> {
    try {
      storage.clearAll();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Check if a key exists in storage
   */
  contains(key: string): boolean {
    return storage.contains(key);
  }

  /**
   * Get all keys from storage
   */
  getAllKeys(): string[] {
    return storage.getAllKeys();
  }
}

/**
 * Singleton instance for accounts storage
 */
export const accountsStorage = new StorageService<any[]>();

/**
 * Singleton instance for settings storage
 */
export const settingsStorage = new StorageService<Record<string, unknown>>();
