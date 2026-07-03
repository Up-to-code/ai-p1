import * as Sentry from "@sentry/nextjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const tracesSampleRate = process.env.NODE_ENV === "development" ? 1.0 : 0.1;
const profileSessionSampleRate =
  process.env.NODE_ENV === "production" ? 0.1 : 1.0;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate,
  includeLocalVariables: true,
  enableLogs: true,
  profileSessionSampleRate,
  profileLifecycle: "trace",
  integrations: [
    nodeProfilingIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ] as any,
});
