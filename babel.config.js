module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      require.resolve('expo-router/babel'),
      'nativewind/babel',
      // 'react-native-reanimated/plugin', // solo si existe en deps y se usa
    ],
  };
};
