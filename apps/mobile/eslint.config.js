const expoConfig = require("eslint-config-expo/flat");
const { defineConfig } = require("eslint/config");
const { MOBILE_CODE_LINE_LIMIT, mobileSizeIgnore, mobileSizeInclude } = require("./scripts/mobile-size-config.cjs");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/*"],
  },
  {
    files: mobileSizeInclude,
    ignores: mobileSizeIgnore,
    rules: {
      "max-lines": ["error", { max: MOBILE_CODE_LINE_LIMIT, skipBlankLines: false, skipComments: false }],
    },
  },
]);
