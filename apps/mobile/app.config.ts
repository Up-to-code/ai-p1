import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ExpoConfig } from "expo/config";
const {
  getMobileEnvironmentIssues,
  resolveMobileEnvironmentConfig,
} = require("./src/runtime/mobileEnvironment.js") as typeof import("./src/runtime/mobileEnvironment");

const workspaceRoot = path.resolve(__dirname, "../..");
const appRoot = __dirname;
const brandName = "Qentrah";
const brandDescription =
  "AI workspace for real estate teams to manage conversations, tasks, properties, and operations from one mobile command center.";
const brandPrimary = "#0066cc";
const splashBackground = "#FFFFFF";
const splashDarkBackground = "#000000";

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

const mobileEnvironment = resolveMobileEnvironmentConfig(process.env);
const environmentIssues = getMobileEnvironmentIssues(mobileEnvironment);
if (environmentIssues.length > 0) {
  throw new Error(`Invalid mobile environment configuration:\n- ${environmentIssues.join("\n- ")}`);
}

const config: ExpoConfig = {
  name: brandName,
  slug: "qentrah-mobile",
  scheme: "qentrah",
  version: "0.1.0",
  description: brandDescription,
  primaryColor: brandPrimary,
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  icon: "./assets/brand/qentrah-mobile-icon.png",
  locales: {
    ar: "./locales/ar.json",
    "en-US": "./locales/en-US.json",
    "ar-SA": "./locales/ar-SA.json",
    "fr-FR": "./locales/fr-FR.json",
  },
  experiments: {
    typedRoutes: true,
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.qentrah.mobile",
    buildNumber: "8",
    usesAppleSignIn: true,
    associatedDomains: ["applinks:app.qentrah.com"],
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
      CFBundleDevelopmentRegion: "en",
      CFBundleLocalizations: ["en", "ar", "fr"],
      ITSAppUsesNonExemptEncryption: false,
      NSPhotoLibraryUsageDescription:
        "Allow Qentrah to let you attach photos and documents to workspace messages.",
      NSCameraUsageDescription: "Allow Qentrah to let you capture photos for workspace messages.",
      NSLocalNetworkUsageDescription:
        "Allow Qentrah to connect to the development server while testing on your device.",
    },
  },
  android: {
    package: "com.qentrah.mobile",
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "app.qentrah.com",
            pathPrefix: "/accept-invite",
          },
          {
            scheme: "https",
            host: "app.qentrah.com",
            pathPrefix: "/en/accept-invite",
          },
          {
            scheme: "https",
            host: "app.qentrah.com",
            pathPrefix: "/ar/accept-invite",
          },
          {
            scheme: "https",
            host: "app.qentrah.com",
            pathPrefix: "/fr/accept-invite",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
    adaptiveIcon: {
      foregroundImage: "./assets/brand/qentrah-adaptive-icon.png",
      backgroundColor: brandPrimary,
    },
  },
  web: {
    favicon: "./assets/brand/qentrah-favicon.png",
    name: brandName,
  },
  plugins: [
    "expo-font",
    "expo-router",
    "expo-apple-authentication",
    "expo-image",
    "expo-secure-store",
    "expo-notifications",
    [
      "expo-splash-screen",
      {
        image: "./assets/brand/qentrah-splash-icon.png",
        imageWidth: 28,
        resizeMode: "contain",
        backgroundColor: splashBackground,
        dark: {
          backgroundColor: splashDarkBackground,
          image: "./assets/brand/qentrah-splash-icon-dark.png",
        },
      },
    ],
    "expo-status-bar",
    "expo-web-browser",
    [
      "expo-speech-recognition",
      {
        microphonePermission: `Allow ${brandName} to use the microphone for AI prompts.`,
        speechRecognitionPermission: `Allow ${brandName} to transcribe your speech into AI prompts.`,
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "514606c6-a5f7-4512-a73d-4916d051eb6b",
    },
    authUrl: mobileEnvironment.authUrl,
    clerkPublishableKey: mobileEnvironment.clerkPublishableKey,
    workspaceApiUrl: mobileEnvironment.workspaceApiUrl,
    mobileEnvironment: mobileEnvironment.environment,
    supportedLocales: ["en", "ar", "fr"],
    supportsRTL: true,
    brand: {
      name: brandName,
      tagline: "The intelligent center of operations.",
      description: brandDescription,
    },
  },
};

export default config;
