/**
 * Logger Implementation
 * 
 * This is the main Logger class that provides the logging interface
 * for the application. It uses the adapter pattern to support different
 * logging backends.
 */

import type { Logger, LogContext, LoggerConfig, PerformanceTimer, PerformanceLogger, LogAdapter } from './types';

class LoggerImpl implements Logger, PerformanceLogger {
  private config: LoggerConfig;
  private inheritedContext: LogContext;

  constructor(config: LoggerConfig, inheritedContext: LogContext = {}) {
    this.config = config;
    this.inheritedContext = inheritedContext;
  }

  private shouldLog(level: 'error' | 'warn' | 'info' | 'debug'): boolean {
    return this.config.adapter.isEnabled(level);
  }

  private log(
    level: 'error' | 'warn' | 'info' | 'debug',
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = {
      level,
      message,
      context: { ...this.inheritedContext, ...context },
      timestamp: Date.now(),
      module: this.config.module,
      error,
      stack: error?.stack,
    };

    this.config.adapter.log(entry);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, context, error);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  withContext(context: LogContext): Logger {
    return new LoggerImpl(
      this.config,
      { ...this.inheritedContext, ...context }
    );
  }

  withModule(module: string): Logger {
    return new LoggerImpl(
      { ...this.config, module },
      this.inheritedContext
    );
  }

  child(module: string, context?: LogContext): Logger {
    return new LoggerImpl(
      { ...this.config, module },
      { ...this.inheritedContext, ...context }
    );
  }

  // Performance monitoring methods
  timer(label: string): PerformanceTimer {
    return new PerformanceTimerImpl(label, this);
  }

  timing(label: string, duration: number, context?: LogContext): void {
    this.debug(`Timing: ${label}`, {
      ...context,
      duration: `${duration}ms`,
    });
  }
}

class PerformanceTimerImpl implements PerformanceTimer {
  private startTime: number = 0;
  private label: string;
  private logger: Logger;

  constructor(label: string, logger: Logger) {
    this.label = label;
    this.logger = logger;
  }

  start(): void {
    this.startTime = performance.now();
  }

  end(): number {
    const duration = performance.now() - this.startTime;
    return duration;
  }

  endAndLog(message: string, context?: LogContext): number {
    const duration = this.end();
    this.logger.timing(this.label, duration, {
      ...context,
      message,
    });
    return duration;
  }
}

/**
 * Create a new logger instance
 */
export function createLogger(config: LoggerConfig): Logger & PerformanceLogger {
  return new LoggerImpl(config) as Logger & PerformanceLogger;
}
