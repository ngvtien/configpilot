// types/electron.d.ts
import { LogLevel, LogEntry } from '../src/services/LoggingService';

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  // Add any other properties your LogEntry has
}

interface ElectronLogger {
  onNewLog: (callback: (logEntry: LogEntry) => void) => () => void;
  // Add any other methods your electron.logger has
}

interface ElectronAPI {
  logger: ElectronLogger;
  // Add any other properties your electron API has
    getChartDetails: (chartPath: string) => Promise<ChartDetails>;
    saveValues: (chartPath: string, values: string) => Promise<{ success: boolean }>;
    templateHelm: (releaseName: string, namespace: string, valuesYaml: string, chartPath: string) => 
      Promise<TemplateResult>;
    selectDirectory: (options?: any) => Promise<string | null>;

}


interface ElectronLogger {
  /**
   * Subscribe to new log entries from the main process
   */
  onNewLog: (callback: (logEntry: LogEntry) => void) => (() => void);
  
  /**
   * Get all stored logs
   */
  getLogs: () => Promise<LogEntry[]>;
  
  /**
   * Clear all stored logs
   */
  clearLogs: () => Promise<void>;
  
  /**
   * Set the current log level
   */
  setLogLevel: (level: LogLevel) => Promise<void>;
  
  /**
   * Export logs to a file
   */
  exportLogs: (format: "json" | "csv" | "txt") => Promise<{ 
    success: boolean; 
    path?: string; 
    error?: string 
  }>;
  
  /**
   * Log methods for different log levels
   */
  error: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  debug: (message: string, data?: any) => void;
  verbose: (message: string, data?: any) => void;
  silly: (message: string, data?: any) => void;
  
  /**
   * Allow for any additional methods that might be added in the future
   */
  [key: string]: any;
}

/**
 * Main Electron API interface
 */
interface ElectronAPI {
  /**
   * Logger API for interacting with the main process logger
   */
  logger: ElectronLogger;
  
  /**
   * Allow for any additional APIs that might be added in the future
   */
  [key: string]: any;
}

/**
 * Extend the Window interface to include the Electron property
 */
declare global {
  interface Window {
    /**
     * Electron API exposed to the renderer process
     */
    Electron?: ElectronAPI;
  }
}

// This export is needed to make this file a module
export {};