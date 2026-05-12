import * as Sentry from "@sentry/nextjs";

const tracesSampleRate = process.env.NODE_ENV === "development" ? 1.0 : 0.1;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate,
  enableLogs: true,
});
