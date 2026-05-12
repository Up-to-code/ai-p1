export type AuthRuntimeEnv = Record<string, string | undefined>;

export function readAuthEnv(name: string, env: AuthRuntimeEnv = process.env): string | undefined {
  const value = env[name]?.trim();
  return value ? value : undefined;
}

export function readRequiredAuthEnv(name: string, env: AuthRuntimeEnv = process.env): string {
  const value = readAuthEnv(name, env);
  if (!value) {
    throw new Error(`Missing environment variable \`${name}\``);
  }
  return value;
}
