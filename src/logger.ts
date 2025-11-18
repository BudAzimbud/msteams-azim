/**
 * Logger utility with different log levels
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface ILogger {
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  debug(...args: any[]): void;
}

export class Logger implements ILogger {
  constructor(private level: LogLevel = LogLevel.INFO) {}

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  error(...args: any[]): void {
    if (this.level >= LogLevel.ERROR) {
      console.error('❌ [ERROR]', ...args);
    }
  }

  warn(...args: any[]): void {
    if (this.level >= LogLevel.WARN) {
      console.warn('⚠️  [WARN]', ...args);
    }
  }

  info(...args: any[]): void {
    if (this.level >= LogLevel.INFO) {
      console.log('ℹ️  [INFO]', ...args);
    }
  }

  debug(...args: any[]): void {
    if (this.level >= LogLevel.DEBUG) {
      console.log('🔍 [DEBUG]', ...args);
    }
  }
}

/**
 * Silent logger (for production)
 */
export class SilentLogger implements ILogger {
  error(): void {}
  warn(): void {}
  info(): void {}
  debug(): void {}
}

/**
 * Console logger (always logs to console)
 */
export class ConsoleLogger implements ILogger {
  error(...args: any[]): void {
    console.error('❌', ...args);
  }

  warn(...args: any[]): void {
    console.warn('⚠️ ', ...args);
  }

  info(...args: any[]): void {
    console.log('ℹ️ ', ...args);
  }

  debug(...args: any[]): void {
    console.log('🔍', ...args);
  }
}
