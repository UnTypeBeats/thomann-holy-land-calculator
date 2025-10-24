/**
 * Logging utility for debugging and error tracking
 */

import { EXTENSION_INFO } from '../shared/constants';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private static instance: Logger;
  private level: LogLevel = LogLevel.INFO;

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private formatMessage(level: string, message: string): string {
    return `${EXTENSION_INFO.PREFIX} [${level}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  error(message: string, error?: Error, context?: unknown): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message), error, context);

      // Send to background for potential analytics/logging
      try {
        chrome.runtime.sendMessage({
          type: 'LOG_ERROR',
          payload: {
            message,
            error: error?.message,
            stack: error?.stack,
            context,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        // Ignore if messaging fails (e.g., background not ready)
      }
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
