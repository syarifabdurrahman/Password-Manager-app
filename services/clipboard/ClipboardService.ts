/**
 * Clipboard Service
 * Implements IClipboardService interface using React Native's Clipboard API
 * Follows Single Responsibility Principle - only handles clipboard operations
 */

import { Clipboard } from 'react-native';
import type { IClipboardService } from '@/types';

/**
 * Clipboard Service Implementation
 */
export class ClipboardService implements IClipboardService {
  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await Clipboard.setString(text);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  /**
   * Get text from clipboard
   */
  async getFromClipboard(): Promise<string> {
    try {
      return await Clipboard.getString();
    } catch (error) {
      console.error('Error reading from clipboard:', error);
      return '';
    }
  }
}

/**
 * Singleton instance
 */
export const clipboardService = new ClipboardService();
