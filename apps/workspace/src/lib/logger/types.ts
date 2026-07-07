/**
 * Deepened Logging Module Types
 * 
 * This module provides the core types for the logging system.
 * The design follows the adapter pattern to allow different logging backends
 * while maintaining a consistent interface across the application.
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: number;
  module?: string;
  error?: Error;
  stack?: string;
}

export interface LogAdapter {
  /**
   * Process a log entry
   */
  log(entry: LogEntry): void | Promise<void>;

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void;

  /**
   * Check if a log level is enabled
   */
  isEnabled(level: LogLevel): boolean;

  /**
   * Flush any buffered logs (for async adapters)
   */
  flush?(): Promise<void>;
}

export interface LoggerConfig {
  level: LogLevel;
  module?: string;
  context?: LogContext;
  adapter: LogAdapter;
}

export interface Logger {
  error(message: string, context?: LogContext, error?: Error): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  timer(label: string): PerformanceTimer;
  timing(label: string, duration: number, context?: LogContext): void;
  
  /**
   * Create a new logger with additional context
   */
  withContext(context: LogContext): Logger;
  
  /**
   * Create a new logger with a different module name
   */
  withModule(module: string): Logger;
  
  /**
   * Create a child logger with both context and module
   */
  child(module: string, context?: LogContext): Logger;
}

/**
 * Performance monitoring interface
 */
export interface PerformanceTimer {
  start(): void;
  end(): number;
  endAndLog(message: string, context?: LogContext): number;
}

export interface PerformanceLogger {
  /**
   * Create a performance timer
   */
  timer(label: string): PerformanceTimer;
  
  /**
   * Log a timing measurement
   */
  timing(label: string, duration: number, context?: LogContext): void;
}
