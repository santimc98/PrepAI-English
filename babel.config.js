module.exports = function (api) {
  api.cache(true);
  return {
    // 1. PRESETS  ──────────────────────
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],

    // 2. PLUGINS ───────────────────────
    plugins: [
      ["module:react-native-dotenv", { moduleName: "@env", safe: false }],
      "react-native-reanimated/plugin",
    ],
  };
};
