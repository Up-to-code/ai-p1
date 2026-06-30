const isProd = process.env.NODE_ENV === "production";

export const logger = {
  error: (event: string, meta?: Record<string, unknown>) => {
    if (isProd) return;
    console.error(`[${event}]`, meta ?? "");
  },
  warn: (event: string, meta?: Record<string, unknown>) => {
    if (isProd) return;
    console.warn(`[${event}]`, meta ?? "");
  },
  info: (event: string, meta?: Record<string, unknown>) => {
    if (isProd) return;
    console.info(`[${event}]`, meta ?? "");
  },
};
