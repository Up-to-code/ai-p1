/**
 * Logging Configuration
 * 
 * This module handles environment-based logging configuration.
 * It reads environment variables and configures the appropriate logger adapter.
 */

import type { LogLevel, LogAdapter } from './types';
import { ConsoleAdapter } from './adapters/console-adapter';
import { SentryAdapter } from './adapters/sentry-adapter';

export interface LoggingConfig {
  level: LogLevel;
  adapter: 'console' | 'sentry' | 'custom';
  isProduction: boolean;
  moduleDefaults?: {
    [key: string]: LogLevel;
  };
}

/**
 * Get log level from environment variable
 */
export function getEnvLogLevel(): LogLevel {
  const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL;
  if (envLevel && ['error', 'warn', 'info', 'debug'].includes(envLevel)) {
    return envLevel as LogLevel;
  }
  
  // Default based on environment
  if (process.env.NODE_ENV === 'production') {
    return 'error';
  }
  return 'info';
}

/**
 * Get adapter type from environment variable
 */
export function getEnvAdapterType(): 'console' | 'sentry' | 'custom' {
  const envAdapter = process.env.NEXT_PUBLIC_LOG_ADAPTER;
  if (envAdapter === 'sentry') return 'sentry';
  if (envAdapter === 'custom') return 'custom';
  return 'console'; // default
}

/**
 * Get logging configuration from environment
 */
export function getLoggingConfig(): LoggingConfig {
  return {
    level: getEnvLogLevel(),
    adapter: getEnvAdapterType(),
    isProduction: process.env.NODE_ENV === 'production',
    moduleDefaults: {
      // You can add module-specific log levels here
      // e.g., 'database': 'warn', 'api': 'info'
    },
  };
}

/**
 * Create adapter based on configuration
 */
export function createAdapterFromConfig(config: LoggingConfig): LogAdapter {
  switch (config.adapter) {
    case 'sentry':
      return new SentryAdapter({ level: config.level });
    case 'console':
    default:
      return new ConsoleAdapter({ 
        level: config.level, 
        isProduction: config.isProduction 
      });
  }
}

/**
 * Get module-specific log level
 */
export function getModuleLogLevel(
  moduleName: string, 
  config: LoggingConfig
): LogLevel {
  return config.moduleDefaults?.[moduleName] ?? config.level;
}
