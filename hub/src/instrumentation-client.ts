import * as Sentry from "@sentry/nextjs";

const tracesSampleRate = process.env.NODE_ENV === "development" ? 1.0 : 0.1;
const profileSessionSampleRate =
  process.env.NODE_ENV === "production" ? 0.1 : 1.0;
const replaysSessionSampleRate =
  process.env.NODE_ENV === "development" ? 1.0 : 0.1;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate,
  replaysSessionSampleRate,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
  profileSessionSampleRate,
  profileLifecycle: "trace",
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
    Sentry.browserProfilingIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
