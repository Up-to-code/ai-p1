import test from "node:test";
import assert from "node:assert/strict";

import {
  getMobileEnvironmentIssues,
  resolveReachableDevUrl,
  resolveMobileEnvironmentConfig,
  resolveMobileEnvironmentName,
} from "@/runtime/mobileEnvironment";

test("mobile environment defaults to development outside release builds", () => {
  assert.equal(resolveMobileEnvironmentName({}), "development");
});

test("mobile environment treats production build signals as production", () => {
  assert.equal(resolveMobileEnvironmentName({ NODE_ENV: "production" }), "production");
  assert.equal(resolveMobileEnvironmentName({ EAS_BUILD_PROFILE: "production" }), "production");
  assert.equal(resolveMobileEnvironmentName({ QENTRAH_MOBILE_ENV: "app-store" }), "production");
});

test("mobile development config prefers local API overrides for real-device testing", () => {
  const config = resolveMobileEnvironmentConfig({
    QENTRAH_MOBILE_ENV: "development",
    EXPO_PUBLIC_DEV_WORKSPACE_API_URL: "http://192.168.1.20:3000",
    EXPO_PUBLIC_DEV_AUTH_URL: "http://192.168.1.20:3000",
  });

  assert.deepEqual(config, {
    environment: "development",
    workspaceApiUrl: "http://192.168.1.20:3000",
    authUrl: "http://192.168.1.20:3000",
  });
});

test("mobile development config defaults to the Workspace production API", () => {
  const config = resolveMobileEnvironmentConfig({
    QENTRAH_MOBILE_ENV: "development",
  });

  assert.deepEqual(config, {
    environment: "development",
    workspaceApiUrl: "https://app.qentrah.com",
    authUrl: "https://app.qentrah.com",
  });
});

test("mobile runtime can rewrite localhost dev URLs to the Expo host", () => {
  assert.equal(
    resolveReachableDevUrl("http://localhost:3000", "192.168.1.20:8081"),
    "http://192.168.1.20:3000",
  );
  assert.equal(
    resolveReachableDevUrl("http://127.0.0.1:3000/api", "exp://10.0.0.7:8081"),
    "http://10.0.0.7:3000/api",
  );
  assert.equal(
    resolveReachableDevUrl("https://app.qentrah.com", "192.168.1.20:8081"),
    "https://app.qentrah.com",
  );
});

test("mobile production config ignores generic local workspace URLs", () => {
  const config = resolveMobileEnvironmentConfig({
    QENTRAH_MOBILE_ENV: "production",
    EXPO_PUBLIC_WORKSPACE_API_URL: "http://localhost:3000",
    EXPO_PUBLIC_AUTH_URL: "http://localhost:3000",
  });

  assert.equal(config.workspaceApiUrl, "https://app.qentrah.com");
  assert.equal(config.authUrl, "https://app.qentrah.com");
  assert.deepEqual(getMobileEnvironmentIssues(config), []);
});

test("mobile production config rejects local release URLs", () => {
  const config = resolveMobileEnvironmentConfig({
    QENTRAH_MOBILE_ENV: "production",
    EXPO_PUBLIC_PRODUCTION_WORKSPACE_API_URL: "http://localhost:3000",
    EXPO_PUBLIC_PRODUCTION_AUTH_URL: "http://127.0.0.1:3000",
  });

  assert.deepEqual(getMobileEnvironmentIssues(config), [
    "Production mobile builds require an HTTPS Workspace API URL.",
    "Production mobile builds require an HTTPS auth URL.",
    "Production mobile builds cannot use a local Workspace API URL.",
    "Production mobile builds cannot use a local auth URL.",
  ]);
});

test("mobile production config rejects non-HTTPS remote auth and API URLs", () => {
  const config = resolveMobileEnvironmentConfig({
    QENTRAH_MOBILE_ENV: "production",
    EXPO_PUBLIC_PRODUCTION_WORKSPACE_API_URL: "http://api.qentrah.com",
    EXPO_PUBLIC_PRODUCTION_AUTH_URL: "http://auth.qentrah.com",
  });

  assert.deepEqual(getMobileEnvironmentIssues(config), [
    "Production mobile builds require an HTTPS Workspace API URL.",
    "Production mobile builds require an HTTPS auth URL.",
  ]);
});
