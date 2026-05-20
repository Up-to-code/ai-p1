type DebugFields = Record<string, unknown>;

const sensitivePattern = /authorization|cookie|secret|token|code|verifier|challenge|state/i;

export function isOAuthDebugEnabled(env: Record<string, string | undefined> = process.env) {
  return /^(1|true|yes)$/iu.test(env.QENTRAH_OAUTH_DEBUG ?? "");
}

export function safeOAuthDebugFields(fields: DebugFields) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      sensitivePattern.test(key) ? "[redacted]" : value,
    ]),
  );
}

export function oauthDebug(event: string, fields: DebugFields = {}) {
  if (!isOAuthDebugEnabled()) return;
  console.info("[qentrah:oauth:workspace]", JSON.stringify({
    event,
    ...safeOAuthDebugFields(fields),
  }));
}
