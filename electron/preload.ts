import { contextBridge, ipcRenderer } from "electron"
import fs from "fs"
import os from "os"
import path from "path"
// We'll use a try-catch for the electron-log import to make it optional
let log: any
try {
  // Use dynamic import to avoid build issues
  log = require("electron-log/renderer")
  console.log("[PRELOAD] electron-log loaded successfully")
} catch (error) {
  // Fallback logger if electron-log isn't available
  log = {
    info: (...args: any[]) => console.info("[INFO]", ...args),
    warn: (...args: any[]) => console.warn("[WARN]", ...args),
    error: (...args: any[]) => console.error("[ERROR]", ...args),
    debug: (...args: any[]) => console.debug("[DEBUG]", ...args),
  }
  console.warn("[PRELOAD] electron-log not available, using fallback logger")
}

// Log that preload is running
log.info("Preload script executing", { source: "preload" })
contextBridge.exposeInMainWorld('electronAPI', {
  saveYaml: (content: string, env: string) => ipcRenderer.send('save-yaml', content, env),
  commitYamlToGit: (content: string, env: string) => ipcRenderer.send('commit-yaml-to-git', content, env),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content:string) => ipcRenderer.invoke('dialog:saveFile', content),
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  log: (message: any) => ipcRenderer.send('log:message', 'info', message),
  error: (message: any) => ipcRenderer.send('log:message', 'error', message),
  warn: (message: any) => ipcRenderer.send('log:message', 'warn', message),
  loadKubeConfig: async () => {
    try {
      console.log("[PRELOAD] loadKubeConfig called")
      // Default kubeconfig path
      const kubeconfigPath = path.join(os.homedir(), ".kube", "config")
      console.log("[PRELOAD] Looking for kubeconfig at:", kubeconfigPath)

      // Check if the file exists
      if (fs.existsSync(kubeconfigPath)) {
        console.log("[PRELOAD] Kubeconfig file found")
        const config = fs.readFileSync(kubeconfigPath, "utf8")
        console.log("[PRELOAD] Kubeconfig loaded successfully")
        return config
      } else {
        console.error("[PRELOAD] Kubeconfig file not found at:", kubeconfigPath)
        throw new Error("Kubeconfig file not found")
      }
    } catch (error) {
      console.error("[PRELOAD] Error loading kubeconfig:", error)
      throw error
    }
  },

  setKubeContext: async (contextName: string) => {
    console.log("[PRELOAD] setKubeContext called with:", contextName)
    // Use IPC to call the main process to change the context
    try {
      const result = await ipcRenderer.invoke("set-kube-context", contextName)
      console.log("[PRELOAD] setKubeContext result:", result)
      return result
    } catch (error) {
      console.error("[PRELOAD] setKubeContext error:", error)
      throw error
    }
  },

  logger: {
    debug: (message: string, data = {}) => {
      ipcRenderer.send("log-message", { level: "debug", source: "renderer", message, data })
    },
    info: (message: string, data = {}) => {
      ipcRenderer.send("log-message", { level: "info", source: "renderer", message, data })
    },
    warn: (message: string, data = {}) => {
      ipcRenderer.send("log-message", { level: "warn", source: "renderer", message, data })
    },
    error: (message: string, data = {}) => {
      ipcRenderer.send("log-message", { level: "error", source: "renderer", message, data })
    },
    getLogs: () => ipcRenderer.invoke("get-logs"),
    clearLogs: () => ipcRenderer.invoke("clear-logs"),
    setLogLevel: (level: string) => ipcRenderer.invoke("set-log-level", level),
    exportLogs: (format: string) => ipcRenderer.invoke("export-logs", format),
    onNewLog: (callback: any) => {
      const listener = (_: any, logEntry: any) => callback(logEntry)
      ipcRenderer.on("new-log-entry", listener)
      return () => {
        ipcRenderer.removeListener("new-log-entry", listener)
      }
    },
  },

});

// contextBridge.exposeInMainWorld('electronAPI', {
//   // Chart operations
//   getChartDetails: (chartPath: string) => 
//     ipcRenderer.invoke('chart:getDetails', { path: chartPath }),
//   saveValues: (chartPath: string, values: string) => 
//     ipcRenderer.invoke('chart:saveValues', { chartPath, values }),
  
//   // Helm operations
//   templateHelm: (releaseName: string, namespace: string, valuesYaml: string, chartPath: string) => 
//     ipcRenderer.invoke('helm:template', { releaseName, namespace, valuesYaml, chartPath }),
  
//   // Dialog operations
//   selectDirectory: (options?: any) => 
//     ipcRenderer.invoke('dialog:selectDirectory', options)
// });

// import { contextBridge, ipcRenderer } from "electron"
// import fs from "fs"
// import os from "os"
// import path from "path"
// import log from "electron-log/renderer"

// // Log that preload is running
// log.info("Preload script executing", { source: "preload" })

// console.log("[PRELOAD] Loading preload.js from:", __dirname)

// // Expose protected methods that allow the renderer process to use
// // the ipcRenderer without exposing the entire object
// contextBridge.exposeInMainWorld("electron", {
//   loadKubeConfig: async () => {
//     try {
//       console.log("[PRELOAD] loadKubeConfig called")
//       // Default kubeconfig path
//       const kubeconfigPath = path.join(os.homedir(), ".kube", "config")
//       console.log("[PRELOAD] Looking for kubeconfig at:", kubeconfigPath)

//       // Check if the file exists
//       if (fs.existsSync(kubeconfigPath)) {
//         console.log("[PRELOAD] Kubeconfig file found")
//         const config = fs.readFileSync(kubeconfigPath, "utf8")
//         console.log("[PRELOAD] Kubeconfig loaded successfully")
//         return config
//       } else {
//         console.error("[PRELOAD] Kubeconfig file not found at:", kubeconfigPath)
//         throw new Error("Kubeconfig file not found")
//       }
//     } catch (error) {
//       console.error("[PRELOAD] Error loading kubeconfig:", error)
//       throw error
//     }
//   },

//   setKubeContext: async (contextName) => {
//     console.log("[PRELOAD] setKubeContext called with:", contextName)
//     // Use IPC to call the main process to change the context
//     try {
//       const result = await ipcRenderer.invoke("set-kube-context", contextName)
//       console.log("[PRELOAD] setKubeContext result:", result)
//       return result
//     } catch (error) {
//       console.error("[PRELOAD] setKubeContext error:", error)
//       throw error
//     }
//   },

//   // Logging methods
//   logger: {
//     debug: (message, data = {}) => {
//       ipcRenderer.send("log-message", { level: "debug", source: "renderer", message, data })
//     },
//     info: (message, data = {}) => {
//       ipcRenderer.send("log-message", { level: "info", source: "renderer", message, data })
//     },
//     warn: (message, data = {}) => {
//       ipcRenderer.send("log-message", { level: "warn", source: "renderer", message, data })
//     },
//     error: (message, data = {}) => {
//       ipcRenderer.send("log-message", { level: "error", source: "renderer", message, data })
//     },
//     getLogs: () => ipcRenderer.invoke("get-logs"),
//     clearLogs: () => ipcRenderer.invoke("clear-logs"),
//     setLogLevel: (level) => ipcRenderer.invoke("set-log-level", level),
//     exportLogs: (format) => ipcRenderer.invoke("export-logs", format),
//     onNewLog: (callback) => {
//       const listener = (_, logEntry) => callback(logEntry)
//       ipcRenderer.on("new-log-entry", listener)
//       return () => {
//         ipcRenderer.removeListener("new-log-entry", listener)
//       }
//     },
//   },

//   saveFile: async (options) => {
//     return await ipcRenderer.invoke("save-file", options)
//   },

//   // Other methods remain the same...
// })

// console.log("[PRELOAD] Preload script loaded successfully")
// log.info("Preload script completed", { source: "preload" })
