const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');
const {resolver: defaultResolver} = getDefaultConfig(__dirname);

/**
 * Metro configuration for MaVault with NATIVEWind
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    ...defaultResolver,
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
    resolveRequest: (context, moduleName, platform) => {
      // Handle @/ alias
      if (moduleName.startsWith('@/')) {
        const absolutePath = path.resolve(__dirname, '.' + moduleName.substring(1));
        return context.resolveRequest(context, absolutePath, platform);
      }
      // Default resolution
      return context.resolveRequest(context, moduleName, platform);
    },
  },
  watchFolders: [],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
