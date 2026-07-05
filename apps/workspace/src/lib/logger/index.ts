/**
 * Deepened Logging Module
 * 
 * This module provides a structured logging system with:
 * - Multiple log levels (error, warn, info, debug)
 * - Context preservation across logger instances
 * - Adapter pattern for different backends (console, Sentry, custom)
 * - Performance monitoring capabilities
 * - Module-specific logging
 * - Environment-based configuration
 * 
 * Usage:
 * ```ts
 * import { logger } from '@/lib/logger';
 * 
 * // Basic logging
 * logger.error('Something went wrong', { userId: '123' }, error);
 * logger.warn('Deprecated API used', { endpoint: '/api/v1/old' });
 * logger.info('User logged in', { userId: '123' });
 * logger.debug('Cache state', { keys: 5, size: '1MB' });
 * 
 * // Module-specific logging
 * const dbLogger = logger.withModule('database');
 * dbLogger.error('Connection failed', { database: 'postgres' });
 * 
 * // Context preservation
 * const userLogger = logger.withContext({ userId: '123' });
 * userLogger.info('Action performed'); // Automatically includes userId
 * 
 * // Performance monitoring
 * const timer = logger.timer('db-query');
 * timer.start();
 * // ... do work ...
 * timer.endAndLog('User fetch completed');
 * ```
 */

import { createLogger } from './logger';
import { getLoggingConfig, createAdapterFromConfig } from './config';
import type { Logger, LogContext, LogLevel, LogAdapter, PerformanceTimer } from './types';

/**
 * Default logger instance
 * Configured based on environment variables
 */
const config = getLoggingConfig();
const adapter = createAdapterFromConfig(config);
const defaultLogger = createLogger({
  level: config.level,
  adapter,
});

/**
 * Main logger instance
 */
export const logger = defaultLogger;

/**
 * Create a custom logger instance
 */
export { createLogger };

/**
 * Export configuration utilities
 */
export { getLoggingConfig, createAdapterFromConfig, getEnvLogLevel, getEnvAdapterType } from './config';

/**
 * Export types for custom implementations
 */
export type {
  Logger,
  LogContext,
  LogLevel,
  LogAdapter,
  PerformanceTimer,
};

/**
 * Re-export for convenience
 */
export const {
  error,
  warn,
  info,
  debug,
  withContext,
  withModule,
  child,
  timer,
  timing,
} = logger;
