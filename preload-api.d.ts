// interface LogEntry {
//     timestamp: string
//     level: string
//     source: string
//     message: string
//     data?: any
//   }
  
//   interface ElectronLogger {
//     debug: (message: string, data?: any) => void
//     info: (message: string, data?: any) => void
//     warn: (message: string, data?: any) => void
//     error: (message: string, data?: any) => void
//     getLogs: () => Promise<LogEntry[]>
//     clearLogs: () => Promise<{ success: boolean }>
//     setLogLevel: (level: string) => Promise<{ success: boolean; level: string }>
//     exportLogs: (format: "json" | "csv" | "txt") => Promise<{ success: boolean; path?: string; error?: string }>
//     onNewLog: (callback: (logEntry: LogEntry) => void) => () => void
//   }
  
// interface ChartDetails {
//     name: string;
//     namespace: string;
//     values: string;
//     schema: any;
//   }
  
//   interface TemplateResult {
//     templates: Record<string, string>;
//   }
  
//   interface ElectronAPI {
//     getChartDetails: (chartPath: string) => Promise<ChartDetails>;
//     saveValues: (chartPath: string, values: string) => Promise<{ success: boolean }>;
//     templateHelm: (releaseName: string, namespace: string, valuesYaml: string, chartPath: string) => 
//       Promise<TemplateResult>;
//     selectDirectory: (options?: any) => Promise<string | null>;
//   }
  
//   interface Window {
//     electronAPI: ElectronAPI;
//   }

// src/electron.d.ts

// interface LogEntry {
//     timestamp: string;
//     level: string;
//     source: string;
//     message: string;
//     data?: any;
//   }
  
//   interface ElectronLogger {
//     debug: (message: string, data?: any) => void;
//     info: (message: string, data?: any) => void;
//     warn: (message: string, data?: any) => void;
//     error: (message: string, data?: any) => void;
//     getLogs: () => Promise<LogEntry[]>;
//     clearLogs: () => Promise<{ success: boolean }>;
//     setLogLevel: (level: string) => Promise<{ success: boolean; level: string }>;
//     exportLogs: (format: "json" | "csv" | "txt") => Promise<{ success: boolean; path?: string; error?: string }>;
//     onNewLog: (callback: (logEntry: LogEntry) => void) => () => void;
//   }
  
//   interface KubernetesContext {
//     name: string;
//     cluster: string;
//     user: string;
//     namespace?: string;
//   }
  
//   interface Electron {
//     loadKubeConfig: () => Promise<string>;
//     setKubeContext: (contextName: string) => Promise<{ success: boolean; message?: string; error?: string }>;
//     logger: ElectronLogger;
//     saveFile: (options: { 
//       content: string; 
//       defaultPath: string; 
//       filters?: Array<{ name: string; extensions: string[] }> 
//     }) => Promise<{ success: boolean; path?: string; error?: string }>;
//     // Add other methods as needed
//   }
  
//   interface Window {
//     electron?: Electron;
//   }

// electron.d.ts
// This should be a declaration file, not a module

// Don't use export statements in this file
declare interface LogEntry {
    timestamp: string;
    level: string;
    source: string;
    message: string;
    data?: any;
  }
  
  declare interface ElectronLogger {
    debug: (message: string, data?: any) => void;
    info: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
    error: (message: string, data?: any) => void;
    getLogs: () => Promise<LogEntry[]>;
    clearLogs: () => Promise<{ success: boolean }>;
    setLogLevel: (level: string) => Promise<{ success: boolean; level: string }>;
    exportLogs: (format: "json" | "csv" | "txt") => Promise<{ success: boolean; path?: string; error?: string }>;
    onNewLog: (callback: (logEntry: LogEntry) => void) => () => void;
  }
  
  declare interface Window {
    electron?: {
      loadKubeConfig: () => Promise<string>;
      setKubeContext: (contextName: string) => Promise<{ success: boolean; message?: string; error?: string }>;
      logger: ElectronLogger;
      saveFile: (options: { 
        content: string; 
        defaultPath: string; 
        filters?: Array<{ name: string; extensions: string[] }> 
      }) => Promise<{ success: boolean; path?: string; error?: string }>;
      // Add other methods as needed
    };
  }