module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      require.resolve('expo-router/babel'),
      // 'nativewind/babel', // desactivado temporalmente
      // 'react-native-reanimated/plugin', // solo si está en deps y se usa
    ],
  };
};
