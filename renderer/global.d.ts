import type { ElectronAPI } from "../electron/types/electron-api";

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
