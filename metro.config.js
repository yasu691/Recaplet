const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// GitHub Pages subpath support
if (process.env.EXPO_BASE_URL) {
  config.transformer = {
    ...config.transformer,
    publicPath: process.env.EXPO_BASE_URL + '/_expo/static',
  };
}

module.exports = config;
