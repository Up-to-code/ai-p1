type DebugFields = Record<string, unknown>;

const sensitivePattern = /authorization|cookie|secret|token|key|code|verifier|challenge|state/i;

export function isAuthDebugEnabled(env: Record<string, string | undefined> = process.env) {
  return /^(1|true|yes)$/iu.test(env.QENTRAH_AUTH_DEBUG ?? env.QENTRAH_OAUTH_DEBUG ?? "");
}

export function safeAuthDebugFields(fields: DebugFields) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      sensitivePattern.test(key) ? "[redacted]" : value,
    ]),
  );
}

export function authDebug(event: string, fields: DebugFields = {}) {
  if (!isAuthDebugEnabled()) return;
  console.info("[qentrah:auth:demo]", JSON.stringify({
    event,
    ...safeAuthDebugFields(fields),
  }));
}
