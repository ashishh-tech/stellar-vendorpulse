type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private enabled: boolean;
  private level: LogLevel;

  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor() {
    this.enabled = process.env.NEXT_PUBLIC_ENABLE_LOGGING !== 'false';
    this.level = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(targetLevel: LogLevel): boolean {
    if (!this.enabled) return false;
    return this.levels[targetLevel] >= this.levels[this.level];
  }

  debug(message: string, ...meta: any[]) {
    if (this.shouldLog('debug')) {
      console.debug(`[VendorPulse:DEBUG] ${message}`, ...meta);
    }
  }

  info(message: string, ...meta: any[]) {
    if (this.shouldLog('info')) {
      console.info(`[VendorPulse:INFO] ${message}`, ...meta);
    }
  }

  warn(message: string, ...meta: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(`[VendorPulse:WARN] ${message}`, ...meta);
    }
  }

  error(message: string, error?: any, ...meta: any[]) {
    if (this.shouldLog('error')) {
      console.error(`[VendorPulse:ERROR] ${message}`, error, ...meta);
    }
    // Abstract error reporting (e.g. Sentry)
    this.reportError(message, error);
  }

  private reportError(message: string, error?: any) {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error || new Error(message));
    }
  }
}

export const logger = new Logger();
