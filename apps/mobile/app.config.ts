import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ExpoConfig } from "expo/config";

const workspaceRoot = path.resolve(__dirname, "../..");
const appRoot = __dirname;
const brandName = "Qentrah";
const brandPrimary = "#0B5CFF";

function normalizeUrlEnvValue(value: string | undefined) {
  if (!value) {
    return value;
  }

  const trimmed = value.trim();
  if (/^=+https?:\/\//.test(trimmed)) {
    return trimmed.replace(/^=+/, "");
  }

  return trimmed;
}

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(appRoot, ".env.local"));
loadEnvFile(path.join(appRoot, ".env"));
loadEnvFile(path.join(workspaceRoot, ".env.local"));
loadEnvFile(path.join(workspaceRoot, ".env"));

const convexUrl = normalizeUrlEnvValue(
  process.env.EXPO_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL ?? "",
) ?? "";
const authUrl = normalizeUrlEnvValue(
  process.env.EXPO_PUBLIC_AUTH_URL
    ?? process.env.EXPO_PUBLIC_CONVEX_SITE_URL
    ?? process.env.CONVEX_SITE_URL
    ?? "",
) ?? "";
const config: ExpoConfig = {
  name: brandName,
  slug: "qentrah-mobile",
  scheme: "qentrah",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  icon: "./assets/brand/qentrah-mobile-icon.png",
  splash: {
    image: "./assets/brand/qentrah-splash-icon.png",
    resizeMode: "contain",
    backgroundColor: brandPrimary,
    dark: {
      image: "./assets/brand/qentrah-splash-icon.png",
      resizeMode: "contain",
      backgroundColor: brandPrimary,
    },
  },
  experiments: {
    typedRoutes: true,
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.qentrah.mobile",
  },
  android: {
    package: "com.qentrah.mobile",
    adaptiveIcon: {
      foregroundImage: "./assets/brand/qentrah-adaptive-icon.png",
      backgroundColor: brandPrimary,
    },
  },
  web: {
    favicon: "./assets/brand/qentrah-favicon.png",
  },
  plugins: [
    "expo-font",
    "expo-router",
    "@rnmapbox/maps",
    [
      "expo-speech-recognition",
      {
        microphonePermission: `Allow ${brandName} to use the microphone for AI prompts.`,
        speechRecognitionPermission: `Allow ${brandName} to transcribe your speech into AI prompts.`,
      },
    ],
  ],
  extra: {
    convexUrl,
    authUrl,
    brand: {
      name: brandName,
      tagline: "The intelligent center of real estate.",
    },
  },
};

export default config;
