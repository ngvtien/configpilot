// electron/logger.ts
import { app, ipcMain, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { LogEntry, LogLevel, Logger } from './logging';

// Configure log file location with rotation
class MainLogger implements Logger {
  logs: LogEntry[] = [];
  maxEntries: number = 10000;
  logFile: string;

  constructor() {
    this.logFile = path.join(app.getPath("userData"), "logs", "main-process.log");
    this.ensureLogDirectory();
  }

  ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level: string, source: string, message: string, data?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      data,
    };

    // Add to internal array
    this.logs.push(entry);

    // Trim if exceeding max entries
    if (this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(this.logs.length - this.maxEntries);
    }

    // Format for file output
    const formattedLog = `[${entry.timestamp}] [${level}] [${source}] ${message}${data ? " " + JSON.stringify(data) : ""}\n`;

    // Write to log file
    this.ensureLogDirectory();
    fs.appendFileSync(this.logFile, formattedLog);

    // Output to console
    const formattedTime = entry.timestamp.split("T")[1].split(".")[0];
    const prefix = `[${formattedTime}] [${level}] [${source}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data || "");
        break;
      case LogLevel.INFO:
        console.info(prefix, message, data || "");
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data || "");
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, data || "");
        break;
    }

    // Send to all renderer processes
    BrowserWindow.getAllWindows().forEach((window) => {
      if (!window.isDestroyed()) {
        window.webContents.send("log-entry", entry);
      }
    });

    return entry;
  }

  debug(source: string, message: string, data?: any): LogEntry {
    return this.log(LogLevel.DEBUG, source, message, data);
  }

  info(source: string, message: string, data?: any): LogEntry {
    return this.log(LogLevel.INFO, source, message, data);
  }

  warn(source: string, message: string, data?: any): LogEntry {
    return this.log(LogLevel.WARN, source, message, data);
  }

  error(source: string, message: string, data?: any): LogEntry {
    return this.log(LogLevel.ERROR, source, message, data);
  }
}

// Create a singleton instance
const mainLogger = new MainLogger();

// Export the logger instance
export default mainLogger;