import { contextBridge, ipcRenderer } from "electron"

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  invoke: (channel, data) => {
    const validChannels = [
      "chart:getDetails",
      "chart:saveValues",
      "helm:template",
      "dialog:selectDirectory",
      "helm:getRepositories",
      "helm:searchCharts",
      "helm:pullChart",
      "values:getHistory",
      "values:saveVersion",
    ]
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data)
    }
  },
})
