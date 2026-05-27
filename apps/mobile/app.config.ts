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
const brandPrimary = "#0B5CFF";

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
    associatedDomains: ["applinks:app.qentrah.com"],
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
  },
  plugins: [
    "expo-font",
    "expo-router",
    [
      "expo-speech-recognition",
      {
        microphonePermission: `Allow ${brandName} to use the microphone for AI prompts.`,
        speechRecognitionPermission: `Allow ${brandName} to transcribe your speech into AI prompts.`,
      },
    ],
  ],
  extra: {
    authUrl: mobileEnvironment.authUrl,
    workspaceApiUrl: mobileEnvironment.workspaceApiUrl,
    mobileEnvironment: mobileEnvironment.environment,
    brand: {
      name: brandName,
      tagline: "The intelligent center of real estate.",
    },
  },
};

export default config;
