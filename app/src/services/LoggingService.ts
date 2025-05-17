
//   export default loggingService
  
// Add this at the top of your LoggingService.ts file
declare global {
  interface Window {
    Electron?: {
      logger?: {
        onNewLog: (callback: (logEntry: LogEntry) => void) => (() => void);
        getLogs: () => Promise<LogEntry[]>;
        clearLogs: () => Promise<void>;
        setLogLevel: (level: LogLevel) => Promise<void>;
        exportLogs: (format: "json" | "csv" | "txt") => Promise<{ 
          success: boolean; 
          path?: string; 
          error?: string 
        }>;
        error: (message: string, data?: Record<string, any>) => void;
        warn: (message: string, data?: Record<string, any>) => void;
        info: (message: string, data?: Record<string, any>) => void;
        debug: (message: string, data?: Record<string, any>) => void;
        verbose: (message: string, data?: Record<string, any>) => void;
        silly: (message: string, data?: Record<string, any>) => void;
        [key: string]: any;
      };
      [key: string]: any;
    };
  }
}

// Logging levels
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
  VERBOSE = "verbose",
  SILLY = "silly",
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: string;
  source: string;
  message: string;
  data?: Record<string, any>;
}

class LoggingService {
  private listeners: Array<(log: LogEntry) => void> = [];
  private logLevel: LogLevel = LogLevel.INFO;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    console.log("[LoggingService] Initializing LoggingService");

    // Set up listener for logs from main process
    if (window.Electron?.logger && typeof window.Electron.logger.onNewLog === "function") {
      this.unsubscribe = window.Electron.logger.onNewLog((logEntry: LogEntry) => {
        // Normalize timestamp if missing
        if (!logEntry.timestamp) {
          logEntry.timestamp = new Date().toISOString();
        }
        this.notifyListeners(logEntry);
      });

      // Get current log level from existing logs
      this.getCurrentLogLevel();
    } else {
      console.warn("[LoggingService] Electron logger not available, using fallback");
    }
  }

  // Clean up when service is destroyed
  public destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners = [];
  }

  // Get current log level by scanning logs for most recent "Log level changed"
  private async getCurrentLogLevel() {
    try {
      if (window.Electron?.logger && typeof window.Electron.logger.getLogs === "function") {
        const result = await window.Electron.logger.getLogs();
        if (result && result.length > 0) {
          for (let i = result.length - 1; i >= 0; i--) {
            const log = result[i];
            if (log.message === "Log level changed" && log.data?.newLevel) {
              this.logLevel = log.data.newLevel as LogLevel;
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error("[LoggingService] Error getting current log level:", error);
    }
  }

  // Log a debug message
  public debug(source: string, message: string, data?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, source, message, data);
  }

  // Log an info message
  public info(source: string, message: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, source, message, data);
  }

  // Log a warning message
  public warn(source: string, message: string, data?: Record<string, any>): void {
    this.log(LogLevel.WARN, source, message, data);
  }

  // Log an error message
  public error(source: string, message: string, data?: Record<string, any>): void {
    this.log(LogLevel.ERROR, source, message, data);
  }

  // Main logging method with filtering and safe calls
  public log(level: LogLevel, source: string, message: string, data?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    if (window.Electron?.logger && typeof window.Electron.logger[level] === "function") {
      const logData = { ...(data || {}) };
      // Ensure 'source' key is not overwritten
      if ("source" in logData) delete logData.source;
      window.Electron.logger[level](message, { source, ...logData });
    } else {
      // Fallback console logging
      const timestamp = new Date().toISOString();
      const logEntry: LogEntry = {
        timestamp,
        level,
        source,
        message,
        data,
      };

      switch (level) {
        case LogLevel.ERROR:
          console.error(`[${source}] ${message}`, data);
          break;
        case LogLevel.WARN:
          console.warn(`[${source}] ${message}`, data);
          break;
        case LogLevel.INFO:
          console.info(`[${source}] ${message}`, data);
          break;
        default:
          console.log(`[${source}] ${message}`, data);
      }

      this.notifyListeners(logEntry);
    }
  }

  // Returns true if the message level meets or exceeds the current log level
  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.SILLY,
      LogLevel.VERBOSE,
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
    ];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  // Get all logs
  public async getLogs(): Promise<LogEntry[]> {
    if (window.Electron?.logger && typeof window.Electron.logger.getLogs === "function") {
      return window.Electron.logger.getLogs();
    }
    return [];
  }

  // Clear all logs
  public async clearLogs(): Promise<void> {
    if (window.Electron?.logger && typeof window.Electron.logger.clearLogs === "function") {
      await window.Electron.logger.clearLogs();
    }
  }

  // Set log level
  public async setLogLevel(level: LogLevel): Promise<void> {
    this.logLevel = level;
    if (window.Electron?.logger && typeof window.Electron.logger.setLogLevel === "function") {
      await window.Electron.logger.setLogLevel(level);
    }
  }

  // Export logs to file
  public async exportLogs(
    format: "json" | "csv" | "txt" = "json",
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    if (window.Electron?.logger && typeof window.Electron.logger.exportLogs === "function") {
      return window.Electron.logger.exportLogs(format);
    }
    return { success: false, error: "Electron logger not available" };
  }

  // Subscribe to log updates
  public subscribe(callback: (log: LogEntry) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  // Notify all listeners of new log entry
  private notifyListeners(logEntry: LogEntry): void {
    this.listeners.forEach((listener) => {
      try {
        listener(logEntry);
      } catch (error) {
        console.error("[LoggingService] Error in log listener:", error);
      }
    });
  }
}

// Create a singleton instance
const loggingService = new LoggingService();

// Log service initialization
loggingService.info("LoggingService", "Logging service initialized");

export default loggingService;
