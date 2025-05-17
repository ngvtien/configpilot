import { contextBridge, ipcRenderer } from "electron";
import fs from "fs";
import os from "os";
import path from "path";
import type { ElectronAPI } from "./types/electron-api";

let log: any;
try {
  log = require("electron-log/renderer");
  console.log("[PRELOAD] electron-log loaded successfully");
} catch {
  log = {
    info: (...args: any[]) => console.info("[INFO]", ...args),
    warn: (...args: any[]) => console.warn("[WARN]", ...args),
    error: (...args: any[]) => console.error("[ERROR]", ...args),
    debug: (...args: any[]) => console.debug("[DEBUG]", ...args),
  };
  console.warn("[PRELOAD] electron-log not available, using fallback logger");
}

log.info("Preload script executing", { source: "preload" });

const electronAPI: ElectronAPI = {
  saveYaml: (content, env) => ipcRenderer.send("save-yaml", content, env),
  commitYamlToGit: (content, env) => ipcRenderer.send("commit-yaml-to-git", content, env),
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  saveFile: (content) => ipcRenderer.invoke("dialog:saveFile", content),
  getAppVersion: () => ipcRenderer.invoke("app:getVersion"),
  log: (message) => ipcRenderer.send("log:message", "info", message),
  error: (message) => ipcRenderer.send("log:message", "error", message),
  warn: (message) => ipcRenderer.send("log:message", "warn", message),

  loadKubeConfig: async () => {
    try {
      console.log("[PRELOAD] loadKubeConfig called");
      const kubeconfigPath = path.join(os.homedir(), ".kube", "config");
      console.log("[PRELOAD] Looking for kubeconfig at:", kubeconfigPath);

      if (fs.existsSync(kubeconfigPath)) {
        console.log("[PRELOAD] Kubeconfig file found");
        const config = fs.readFileSync(kubeconfigPath, "utf8");
        console.log("[PRELOAD] Kubeconfig loaded successfully");
        return config;
      } else {
        console.error("[PRELOAD] Kubeconfig file not found at:", kubeconfigPath);
        throw new Error("Kubeconfig file not found");
      }
    } catch (error) {
      console.error("[PRELOAD] Error loading kubeconfig:", error);
      throw error;
    }
  },

  setKubeContext: async (contextName) => {
    console.log("[PRELOAD] setKubeContext called with:", contextName);
    try {
      const result = await ipcRenderer.invoke("set-kube-context", contextName);
      console.log("[PRELOAD] setKubeContext result:", result);
      return result;
    } catch (error) {
      console.error("[PRELOAD] setKubeContext error:", error);
      throw error;
    }
  },

  logger: {
    debug: (message, data = {}) =>
      ipcRenderer.send("log-message", { level: "debug", source: "renderer", message, data }),
    info: (message, data = {}) =>
      ipcRenderer.send("log-message", { level: "info", source: "renderer", message, data }),
    warn: (message, data = {}) =>
      ipcRenderer.send("log-message", { level: "warn", source: "renderer", message, data }),
    error: (message, data = {}) =>
      ipcRenderer.send("log-message", { level: "error", source: "renderer", message, data }),
    getLogs: () => ipcRenderer.invoke("get-logs"),
    clearLogs: () => ipcRenderer.invoke("clear-logs"),
    setLogLevel: (level) => ipcRenderer.invoke("set-log-level", level),
    exportLogs: (format) => ipcRenderer.invoke("export-logs", format),
    onNewLog: (callback) => {
      const listener = (_: any, logEntry: any) => callback(logEntry);
      ipcRenderer.on("new-log-entry", listener);
      return () => {
        ipcRenderer.removeListener("new-log-entry", listener);
      };
    },
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
