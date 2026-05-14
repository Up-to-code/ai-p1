import { readBrandEnv } from "@qentrah/brand-identity";

function readEnvValue(key: string, fallback: string) {
  const brandedKey = key.startsWith("QENTRAH_") ? key.slice("QENTRAH_".length) : key;
  const value = readBrandEnv(brandedKey, process.env) ?? process.env[key];
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}

function requireMinLength(key: string, value: string, minLength: number) {
  if (value.trim().length < minLength) {
    throw new Error(`${key} must be at least ${minLength} characters.`);
  }

  return value;
}

export const envReader = {
  read: readEnvValue,
  min: requireMinLength,
};
