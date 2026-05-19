import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ExpoConfig } from "expo/config";

const workspaceRoot = path.resolve(__dirname, "../..");
const appRoot = __dirname;

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
  name: "ZaneAI",
  slug: "zane-ai-mobile",
  scheme: "zane-ai",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  icon: "./assets/brand/zaneai-mobile-icon.png",
  splash: {
    image: "./assets/brand/zaneai-splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#EC2D35",
    dark: {
      image: "./assets/brand/zaneai-splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#EC2D35",
    },
  },
  experiments: {
    typedRoutes: true,
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.zaneai.mobile",
  },
  android: {
    package: "com.zaneai.mobile",
    adaptiveIcon: {
      foregroundImage: "./assets/brand/zaneai-adaptive-icon.png",
      backgroundColor: "#EC2D35",
    },
  },
  web: {
    favicon: "./assets/brand/favicon.png",
  },
  plugins: [
    "expo-font",
    "expo-router",
    "@rnmapbox/maps",
    [
      "expo-speech-recognition",
      {
        microphonePermission: "Allow ZaneAI to use the microphone for voice search and guided prompts.",
        speechRecognitionPermission: "Allow ZaneAI to transcribe your speech into real estate prompts.",
      },
    ],
  ],
  extra: {
    convexUrl,
    authUrl,
    brand: {
      name: "ZaneAI",
      tagline: "The intelligent center of real estate.",
    },
  },
};

export default config;
