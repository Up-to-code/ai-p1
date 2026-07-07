/**
 * @deprecated Use the new deepened logging module from '@/lib/logger/index' instead
 * This file is kept for backward compatibility and will be removed in a future update
 */

// Re-export from the new logging module for backward compatibility
export { logger, createLogger } from './logger/index';
export type { Logger, LogContext, LogLevel, LogAdapter, PerformanceTimer } from './logger/types';
