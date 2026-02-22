/**
 * AdMob Service
 * Handles AdMob interstitial ads
 * Follows Single Responsibility Principle - only handles ad operations
 */

import { Platform } from 'react-native';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import type { IAdMobService } from '@/types';

// Test ad unit IDs (replace with your actual ad unit IDs in production)
const AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      android: 'ca-app-pub-3940256099942544/1033173712', // Replace with your Android ad unit ID
      ios: 'ca-app-pub-3940256099942544/1033173712', // Replace with your iOS ad unit ID
    });

/**
 * AdMob Service Implementation
 */
export class AdMobService implements IAdMobService {
  private interstitial: InterstitialAd | null = null;
  private isLoaded = false;
  private isLoading = false;
  private loadResolver: (() => void) | null = null;
  private lastAdShownTime = 0;
  private readonly COOLDOWN_MS = 30000; // 30 seconds cooldown between ads

  constructor() {
    this.initializeInterstitial();
  }

  /**
   * Initialize interstitial ad
   */
  private initializeInterstitial(): void {
    if (!AD_UNIT_ID) return;

    this.interstitial = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
      keywords: ['password', 'security', 'productivity'],
    });

    this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
      this.isLoaded = true;
      this.isLoading = false;
      this.loadResolver?.();
      this.loadResolver = null;
      console.log('[AdMob] Interstitial ad loaded');
    });

    this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      this.isLoaded = false;
      // Preload next ad after current one is closed
      this.loadInterstitial();
    });

    this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('[AdMob] Interstitial ad error:', error);
      this.isLoaded = false;
      this.isLoading = false;
      this.loadResolver?.();
      this.loadResolver = null;
    });
  }

  /**
   * Load interstitial ad
   */
  async loadInterstitial(): Promise<void> {
    if (this.isLoaded || this.isLoading) {
      return;
    }

    if (!this.interstitial) {
      console.warn('[AdMob] Interstitial ad not initialized');
      return;
    }

    this.isLoading = true;

    return new Promise((resolve) => {
      this.loadResolver = resolve;
      this.interstitial?.load();
    });
  }

  /**
   * Show interstitial ad (with cooldown check)
   */
  async showInterstitial(): Promise<boolean> {
    const now = Date.now();
    const timeSinceLastAd = now - this.lastAdShownTime;

    // Check if cooldown period has passed
    if (timeSinceLastAd < this.COOLDOWN_MS) {
      const remainingTime = Math.ceil((this.COOLDOWN_MS - timeSinceLastAd) / 1000);
      console.log(`[AdMob] Ad on cooldown. Wait ${remainingTime}s more.`);
      return false;
    }

    if (!this.isLoaded || !this.interstitial) {
      console.warn('[AdMob] Interstitial ad not loaded yet');
      return false;
    }

    try {
      await this.interstitial.show();
      this.isLoaded = false;
      this.lastAdShownTime = Date.now();
      return true;
    } catch (error) {
      console.error('[AdMob] Error showing interstitial ad:', error);
      return false;
    }
  }

  /**
   * Check if interstitial ad is loaded
   */
  isInterstitialLoaded(): boolean {
    return this.isLoaded;
  }
}

/**
 * Singleton instance
 */
export const adMobService = new AdMobService();