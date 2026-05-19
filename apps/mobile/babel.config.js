const path = require("path");

function needsManualExpoRouterPlugin() {
  try {
    const presetPackagePath = require.resolve("babel-preset-expo/package.json");
    const presetRoot = path.dirname(presetPackagePath);

    require.resolve("expo-router", { paths: [presetRoot] });
    return false;
  } catch (error) {
    if (error && error.code === "MODULE_NOT_FOUND") {
      return true;
    }

    throw error;
  }
}

module.exports = function (api) {
  const isTest = api.env("test");
  api.cache(() => isTest);

  const plugins = [];

  // In this workspace, expo-router is installed under apps/mobile/node_modules,
  // which babel-preset-expo cannot always detect from its own package location.
  if (needsManualExpoRouterPlugin()) {
    const { expoRouterBabelPlugin } = require("babel-preset-expo/build/expo-router-plugin");
    plugins.push(expoRouterBabelPlugin);
  }

  if (!isTest) {
    plugins.push(require.resolve("react-native-reanimated/plugin"));
  }

  return {
    presets: [require.resolve("babel-preset-expo")],
    plugins,
  };
};
