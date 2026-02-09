/**
 * Haptic Feedback Service
 * Implements IHapticService interface using react-native-haptic-feedback
 * Follows Single Responsibility Principle - only handles haptic feedback
 */

import RNHapticFeedback from 'react-native-haptic-feedback';
import type { HapticType, IHapticService } from '@/types';

/**
 * Haptic feedback options
 */
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Mapping of haptic types to native haptic types
 */
const HAPTIC_TYPE_MAP: Record<HapticType, string> = {
  light: 'impactLight',
  medium: 'impactMedium',
  heavy: 'impactHeavy',
  success: 'notificationSuccess',
  warning: 'notificationWarning',
  error: 'notificationError',
} as const;

/**
 * Haptic Service Implementation
 */
export class HapticService implements IHapticService {
  private enabled: boolean = true;

  /**
   * Trigger haptic feedback
   */
  trigger(type: HapticType): void {
    if (!this.enabled) return;

    try {
      const nativeType = HAPTIC_TYPE_MAP[type];
      RNHapticFeedback.trigger(nativeType, hapticOptions);
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  }

  /**
   * Enable or disable haptic feedback
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if haptic feedback is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

/**
 * Singleton instance
 */
export const hapticService = new HapticService();
