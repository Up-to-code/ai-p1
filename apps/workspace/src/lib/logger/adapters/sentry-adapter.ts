/**
 * Sentry Adapter for Logging
 * 
 * This adapter provides Sentry integration for error tracking and monitoring.
 * It's designed for production environments where you want centralized error logging.
 */

import type { LogAdapter, LogEntry, LogLevel } from '../types';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export class SentryAdapter implements LogAdapter {
  private level: LogLevel;
  private sentry: typeof import('@sentry/nextjs') | null;

  constructor(config: { level?: LogLevel } = {}) {
    this.level = config.level ?? 'error';
    this.sentry = null;
    
    // Lazy load Sentry to avoid issues in environments where it's not configured
    try {
      this.sentry = require('@sentry/nextjs');
    } catch {
      // Sentry not available, adapter will be a no-op
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  isEnabled(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[this.level];
  }

  log(entry: LogEntry): void {
    if (!this.isEnabled(entry.level) || !this.sentry) {
      return;
    }

    const { captureException, captureMessage, withScope, addBreadcrumb } = this.sentry;

    switch (entry.level) {
      case 'error':
        if (entry.error) {
          captureException(entry.error, {
            tags: { module: entry.module },
            extra: entry.context,
          });
        } else {
          captureMessage(entry.message, {
            level: 'error',
            tags: { module: entry.module },
            extra: entry.context,
          });
        }
        break;

      case 'warn':
        addBreadcrumb({
          category: entry.module ?? 'app',
          message: entry.message,
          level: 'warning',
          data: entry.context,
        });
        break;

      case 'info':
        addBreadcrumb({
          category: entry.module ?? 'app',
          message: entry.message,
          level: 'info',
          data: entry.context,
        });
        break;

      case 'debug':
        // Debug logs are typically not sent to Sentry in production
        break;
    }
  }

  async flush(): Promise<void> {
    if (this.sentry) {
      const { flush } = this.sentry;
      await flush(2000); // Flush with 2 second timeout
    }
  }
}
