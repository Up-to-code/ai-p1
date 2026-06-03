type TamaraEnv = Record<string, string | undefined>;

function readUrl(value: string | undefined) {
  return value?.trim().replace(/\/+$/u, "") ?? "";
}

function normalizeSiteUrl(env: TamaraEnv) {
  return readUrl(env.SITE_URL || env.BETTER_AUTH_URL || env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
}

export function getTamaraRuntimeConfig(env: TamaraEnv = process.env) {
  const isProduction = env.NODE_ENV === "production";
  const baseUrl = readUrl(env.TAMARA_API_BASE_URL || (isProduction ? "" : "https://api-sandbox.tamara.co"));
  const apiToken = env.TAMARA_API_TOKEN?.trim() ?? "";
  const notificationToken = env.TAMARA_NOTIFICATION_TOKEN?.trim() ?? "";
  const publicKey = env.TAMARA_PUBLIC_KEY?.trim() ?? "";
  const siteUrl = normalizeSiteUrl(env);
  const webhookUrl = readUrl(env.TAMARA_WEBHOOK_URL || `${siteUrl}/api/v1/billing/tamara/webhook`);
  const captureMode = env.TAMARA_CAPTURE_MODE === "manual" ? "manual" : "immediate";

  if (!baseUrl) {
    throw new Error("TAMARA_API_BASE_URL is required for Tamara billing.");
  }

  return {
    baseUrl,
    apiToken,
    notificationToken,
    publicKey,
    siteUrl,
    webhookUrl,
    captureMode,
  };
}

export function assertTamaraApiConfig(env: TamaraEnv = process.env) {
  const config = getTamaraRuntimeConfig(env);
  if (!config.apiToken) {
    throw new Error("TAMARA_API_TOKEN is required for Tamara billing.");
  }
  return config;
}

export function assertTamaraWebhookConfig(env: TamaraEnv = process.env) {
  const config = assertTamaraApiConfig(env);
  if (!config.notificationToken) {
    throw new Error("TAMARA_NOTIFICATION_TOKEN is required for Tamara webhooks.");
  }
  return config;
}
