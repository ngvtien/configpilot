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
    timestamp: string
    level: string
    source: string
    message: string
    data?: any
  }
  
  class LoggingService {
    private listeners: Array<(log: LogEntry) => void> = []
    private logLevel: LogLevel = LogLevel.INFO
  
    constructor() {
      console.log("[LoggingService] Initializing LoggingService")
  
      // Set up listener for logs from main process
      if (window.electron?.logger) {
        const unsubscribe = window.electron.logger.onNewLog((logEntry: LogEntry) => {
          this.notifyListeners(logEntry)
        })
  
        // Store unsubscribe function for cleanup
        this.unsubscribe = unsubscribe
  
        // Get current log level
        this.getCurrentLogLevel()
      } else {
        console.warn("[LoggingService] Electron logger not available, using fallback")
      }
    }
  
    private unsubscribe: (() => void) | null = null
  
    // Clean up when service is destroyed
    public destroy() {
      if (this.unsubscribe) {
        this.unsubscribe()
      }
    }
  
    // Get current log level
    private async getCurrentLogLevel() {
      try {
        if (window.electron?.logger) {
          const result = await window.electron.logger.getLogs()
          if (result && result.length > 0) {
            // Find the most recent log level change
            for (let i = result.length - 1; i >= 0; i--) {
              const log = result[i]
              if (log.message === "Log level changed" && log.data?.newLevel) {
                this.logLevel = log.data.newLevel
                break
              }
            }
          }
        }
      } catch (error) {
        console.error("[LoggingService] Error getting current log level:", error)
      }
    }
  
    // Log a debug message
    public debug(source: string, message: string, data?: any): void {
      this.log(LogLevel.DEBUG, source, message, data)
    }
  
    // Log an info message
    public info(source: string, message: string, data?: any): void {
      this.log(LogLevel.INFO, source, message, data)
    }
  
    // Log a warning message
    public warn(source: string, message: string, data?: any): void {
      this.log(LogLevel.WARN, source, message, data)
    }
  
    // Log an error message
    public error(source: string, message: string, data?: any): void {
      this.log(LogLevel.ERROR, source, message, data)
    }
  
    // Main logging method
    public log(level: LogLevel, source: string, message: string, data?: any): void {
      if (window.electron?.logger) {
        // Log through Electron
        window.electron.logger[level](message, { source, ...data })
      } else {
        // Fallback to console
        const timestamp = new Date().toISOString()
        const logEntry: LogEntry = {
          timestamp,
          level,
          source,
          message,
          data,
        }
  
        // Log to console
        switch (level) {
          case LogLevel.ERROR:
            console.error(`[${source}] ${message}`, data)
            break
          case LogLevel.WARN:
            console.warn(`[${source}] ${message}`, data)
            break
          case LogLevel.INFO:
            console.info(`[${source}] ${message}`, data)
            break
          default:
            console.log(`[${source}] ${message}`, data)
        }
  
        // Notify listeners
        this.notifyListeners(logEntry)
      }
    }
  
    // Get all logs
    public async getLogs(): Promise<LogEntry[]> {
      if (window.electron?.logger) {
        return window.electron.logger.getLogs()
      }
      return []
    }
  
    // Clear all logs
    public async clearLogs(): Promise<void> {
      if (window.electron?.logger) {
        await window.electron.logger.clearLogs()
      }
    }
  
    // Set log level
    public async setLogLevel(level: LogLevel): Promise<void> {
      this.logLevel = level
      if (window.electron?.logger) {
        await window.electron.logger.setLogLevel(level)
      }
    }
  
    // Export logs to file
    public async exportLogs(
      format: "json" | "csv" | "txt" = "json",
    ): Promise<{ success: boolean; path?: string; error?: string }> {
      if (window.electron?.logger) {
        return window.electron.logger.exportLogs(format)
      }
      return { success: false, error: "Electron logger not available" }
    }
  
    // Subscribe to log updates
    public subscribe(callback: (log: LogEntry) => void): () => void {
      this.listeners.push(callback)
  
      // Return unsubscribe function
      return () => {
        this.listeners = this.listeners.filter((listener) => listener !== callback)
      }
    }
  
    // Notify all listeners
    private notifyListeners(logEntry: LogEntry): void {
      this.listeners.forEach((listener) => {
        try {
          listener(logEntry)
        } catch (error) {
          console.error("[LoggingService] Error in log listener:", error)
        }
      })
    }
  }
  
  // Create a singleton instance
  const loggingService = new LoggingService()
  
  // Log service initialization
  loggingService.info("LoggingService", "Logging service initialized")
  
  export default loggingService
  