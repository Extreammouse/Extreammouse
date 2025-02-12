type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private static instance: Logger;
  
  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  }

  log(level: LogLevel, message: string, error?: any) {
    const formattedMessage = this.formatMessage(level, message);
    
    switch (level) {
      case 'info':
        console.log(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        if (error) {
          console.error('Error details:', error);
        }
        break;
    }
  }

  info(message: string) {
    this.log('info', message);
  }

  warn(message: string) {
    this.log('warn', message);
  }

  error(message: string, error?: any) {
    this.log('error', message, error);
  }
}

export const logger = Logger.getInstance();