/**
 * MaVault - Password Manager App
 * Dark Mode First | Glassmorphism UI | Secure Vault
 *
 * Main App Entry Point
 */

import React, { useState, useCallback } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Sparkles,
  Settings,
  Home,
} from 'lucide-react-native';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { VaultScreen, GeneratorScreen, SettingsScreen } from '@/screens';
import { hapticService } from '@/services';

type ScreenType = 'vault' | 'generator' | 'settings';

function AppContent() {
  const { colors, isDark } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('vault');
  const [navAnim] = useState(new Animated.Value(0));

  const navigateTo = useCallback((screen: ScreenType) => {
    hapticService.trigger('light');

    // Animate navigation
    Animated.timing(navAnim, {
      toValue: screen === 'vault' ? 0 : screen === 'generator' ? 1 : 2,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setCurrentScreen(screen);
  }, [navAnim]);

  const renderScreen = useCallback(() => {
    switch (currentScreen) {
      case 'vault':
        return <VaultScreen onNavigateToGenerator={() => navigateTo('generator')} />;
      case 'generator':
        return <GeneratorScreen onBack={() => navigateTo('vault')} />;
      case 'settings':
        return <SettingsScreen onBack={() => navigateTo('vault')} />;
      default:
        return <VaultScreen />;
    }
  }, [currentScreen, navigateTo]);

  // Avoid type narrowing by using a helper function
  const getNavIconColor = (screenType: ScreenType) =>
    currentScreen === screenType ? colors.accent : colors.textSecondary;

  const getNavIconBg = (screenType: ScreenType) =>
    currentScreen === screenType ? colors.accentLight : 'transparent';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Main Content */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Bottom Navigation */}
      <Animated.View
        style={[
          styles.navigationBar,
          {
            backgroundColor: colors.glass.bg,
            borderTopColor: colors.glass.border,
          },
        ]}
      >
          <SafeAreaView edges={['bottom']} style={styles.navContent}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigateTo('vault')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.navIconContainer,
                  { backgroundColor: getNavIconBg('vault') },
                ]}
              >
                <Home
                  size={22}
                  color={getNavIconColor('vault')}
                  strokeWidth={2}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigateTo('generator')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.navIconContainer,
                  { backgroundColor: getNavIconBg('generator') },
                ]}
              >
                <Sparkles
                  size={22}
                  color={getNavIconColor('generator')}
                  strokeWidth={2}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigateTo('settings')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.navIconContainer,
                  { backgroundColor: getNavIconBg('settings') },
                ]}
              >
                <Settings
                  size={22}
                  color={getNavIconColor('settings')}
                  strokeWidth={2}
                />
              </View>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: 'Montserrat',
  },
  content: {
    flex: 1,
  },
  navigationBar: {
    borderTopWidth: 1,
  },
  navContent: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 8,
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
