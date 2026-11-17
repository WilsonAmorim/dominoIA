const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Permite que o bundler empacote o modelo best.tflite nos assets
config.resolver.assetExts.push('tflite');

module.exports = config;