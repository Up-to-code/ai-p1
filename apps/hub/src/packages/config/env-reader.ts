function readEnvValue(key: string, fallback: string) {
  const value = process.env[key];
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
