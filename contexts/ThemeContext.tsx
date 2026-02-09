/**
 * MaVault Theme Context
 * Dark Mode First - Designed with midnight slate and deep navy colors
 * Provides glassmorphism styling support
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
  isDark: boolean;
}

interface ThemeColors {
  // Base colors
  background: string;
  backgroundSecondary: string;

  // Glassmorphism colors
  glass: {
    bg: string;
    bgLight: string;
    border: string;
    borderLight: string;
  };

  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Accent colors
  accent: string;
  accentSecondary: string;
  accentLight: string;

  // Status colors
  success: string;
  warning: string;
  danger: string;
  info: string;

  // UI elements
  input: string;
  inputBorder: string;
  divider: string;

  // Password strength colors
  strength: {
    weak: string;
    fair: string;
    good: string;
    strong: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * MaVault Dark Mode First Color Palette
 * Optimized for glassmorphism UI with midnight slate and deep navy tones
 */
const darkColors: ThemeColors = {
  // Base - Midnight slate background
  background: '#0F172A',
  backgroundSecondary: '#1E293B',

  // Glassmorphism - Semi-transparent layers
  glass: {
    bg: 'rgba(30, 41, 59, 0.7)',
    bgLight: 'rgba(30, 41, 59, 0.4)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
  },

  // Text - High contrast for readability
  text: '#FFFFFF',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textInverse: '#0F172A',

  // Accent - Indigo/Purple gradient vibes
  accent: '#6366F1',
  accentSecondary: '#8B5CF6',
  accentLight: 'rgba(99, 102, 241, 0.15)',

  // Status - Clear semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // UI elements - Higher contrast for visibility
  input: 'rgba(51, 65, 85, 0.8)',
  inputBorder: 'rgba(148, 163, 184, 0.3)',
  divider: 'rgba(255, 255, 255, 0.05)',

  // Password strength indicators
  strength: {
    weak: '#EF4444',
    fair: '#F59E0B',
    good: '#10B981',
    strong: '#6366F1',
  },
};

const lightColors: ThemeColors = {
  // Base - Clean light background
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',

  // Glassmorphism - Light version
  glass: {
    bg: 'rgba(255, 255, 255, 0.8)',
    bgLight: 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(0, 0, 0, 0.1)',
    borderLight: 'rgba(0, 0, 0, 0.05)',
  },

  // Text
  text: '#1E293B',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textInverse: '#F8FAFC',

  // Accent
  accent: '#6366F1',
  accentSecondary: '#8B5CF6',
  accentLight: 'rgba(99, 102, 241, 0.1)',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // UI elements - Higher contrast for visibility
  input: '#F1F5F9',
  inputBorder: 'rgba(71, 85, 105, 0.3)',
  divider: 'rgba(0, 0, 0, 0.05)',

  // Password strength
  strength: {
    weak: '#EF4444',
    fair: '#F59E0B',
    good: '#10B981',
    strong: '#6366F1',
  },
};

/**
 * Get theme colors based on theme mode
 */
export const getThemeColors = (theme: Theme): ThemeColors => {
  return theme === 'dark' ? darkColors : lightColors;
};

/**
 * Theme Provider Component
 * Dark Mode First - defaults to dark theme
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(() => {
    // Default to dark mode (Dark Mode First)
    return 'dark';
  });

  const isDark = useMemo(() => theme === 'dark', [theme]);
  const colors = useMemo(() => getThemeColors(theme), [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      colors,
      isDark,
    }),
    [theme, colors, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * useTheme Hook
 * Access theme context throughout the app
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
