module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      'nativewind/babel',
      ["module:react-native-dotenv", { moduleName: "@env", safe: false }],
      "react-native-reanimated/plugin",
    ],
  };
};
