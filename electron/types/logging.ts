// Define the log levels
export enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug",
    VERBOSE = "verbose",
    SILLY = "silly"
  }
  
  // Define the structure of a log entry
  export interface LogEntry {
    timestamp: string;
    level: string;
    source: string;
    message: string;
    data?: any; // Use any for now, can be more specific later
  }
  
  // Define the logger interface
  export interface Logger {
    logs: LogEntry[];
    maxEntries: number;
    logFile: string;
    
    ensureLogDirectory(): void;
    log(level: string, source: string, message: string, data?: any): LogEntry;
    debug(source: string, message: string, data?: any): LogEntry;
    info(source: string, message: string, data?: any): LogEntry;
    warn(source: string, message: string, data?: any): LogEntry;
    error(source: string, message: string, data?: any): LogEntry;
  }