const MOBILE_CODE_LINE_LIMIT = 60;

const mobileSizeInclude = ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"];

const mobileSizeIgnore = [
  "src/persistence/convex/_generated/**",
  "src/tests/**",
  "src/e2e/**",
  "**/*.d.ts",
  "**/*Dictionary.ts",
  "**/*dictionary.ts",
  "**/*PromptData.ts",
  "**/*Copy.ts",
  "**/tokens.ts",
  "**/errorStates.ts",
];

function isMobileSizeIgnored(file) {
  return file.startsWith("src/persistence/convex/_generated/")
    || file.startsWith("src/tests/")
    || file.startsWith("src/e2e/")
    || file.endsWith(".d.ts")
    || file.endsWith("Dictionary.ts")
    || file.endsWith("dictionary.ts")
    || file.endsWith("PromptData.ts")
    || file.endsWith("Copy.ts")
    || file.endsWith("/tokens.ts")
    || file.endsWith("/errorStates.ts");
}

module.exports = { MOBILE_CODE_LINE_LIMIT, isMobileSizeIgnored, mobileSizeIgnore, mobileSizeInclude };
