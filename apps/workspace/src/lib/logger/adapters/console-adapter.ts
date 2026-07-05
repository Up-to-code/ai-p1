/**
 * Console Adapter for Logging
 * 
 * This adapter provides console-based logging with formatting and level filtering.
 * It's the default adapter for development environments.
 */

import type { LogAdapter, LogEntry, LogLevel } from '../types';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export class ConsoleAdapter implements LogAdapter {
  private level: LogLevel;
  private isProduction: boolean;

  constructor(config: { level?: LogLevel; isProduction?: boolean } = {}) {
    this.level = config.level ?? (this.getEnvLevel() ?? 'info');
    this.isProduction = config.isProduction ?? process.env.NODE_ENV === 'production';
  }

  private getEnvLevel(): LogLevel | undefined {
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL;
    if (envLevel && ['error', 'warn', 'info', 'debug'].includes(envLevel)) {
      return envLevel as LogLevel;
    }
    return undefined;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  isEnabled(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[this.level];
  }

  log(entry: LogEntry): void {
    if (!this.isEnabled(entry.level)) {
      return;
    }

    // In production, only log errors and warnings
    if (this.isProduction && (entry.level === 'info' || entry.level === 'debug')) {
      return;
    }

    const formatted = this.formatEntry(entry);
    const method = this.getConsoleMethod(entry.level);

    method(formatted);
  }

  private formatEntry(entry: LogEntry): string {
    const parts: string[] = [];
    
    // Add timestamp
    const timestamp = new Date(entry.timestamp).toISOString();
    parts.push(`[${timestamp}]`);
    
    // Add level
    parts.push(`[${entry.level.toUpperCase()}]`);
    
    // Add module if present
    if (entry.module) {
      parts.push(`[${entry.module}]`);
    }
    
    // Add message
    parts.push(entry.message);
    
    // Add context if present
    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push('\nContext:', JSON.stringify(entry.context, null, 2));
    }
    
    // Add error if present
    if (entry.error) {
      parts.push('\nError:', entry.error.message);
      if (entry.stack) {
        parts.push('\nStack:', entry.stack);
      }
    }
    
    return parts.join(' ');
  }

  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case 'error':
        return console.error;
      case 'warn':
        return console.warn;
      case 'info':
        return console.info;
      case 'debug':
        return console.debug;
    }
  }
}
