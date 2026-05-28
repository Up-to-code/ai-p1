import authSdkPackage from "../../../packages/auth-sdk/package.json";

export const qentrahAuthSdkVersion = authSdkPackage.version;
export const qentrahAuthBrowserBundlePath = "dist/qentrah-auth.js";
export const qentrahAuthSdkJsdelivrUrl = `https://cdn.jsdelivr.net/npm/@qentrah/auth-sdk@${qentrahAuthSdkVersion}/${qentrahAuthBrowserBundlePath}`;
export const qentrahAuthSdkUnpkgUrl = `https://unpkg.com/@qentrah/auth-sdk@${qentrahAuthSdkVersion}/${qentrahAuthBrowserBundlePath}`;
