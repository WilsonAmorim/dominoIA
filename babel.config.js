module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Habilita o compilador de worklets para react-native-worklets-core
      'react-native-worklets-core/plugin',
    ],
  };
};
