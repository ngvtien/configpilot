"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// contextBridge.exposeInMainWorld('electronAPI', {
//   saveYaml: (content: string, env: string) => ipcRenderer.send('save-yaml', content, env),
//   commitYamlToGit: (content: string, env: string) => ipcRenderer.send('commit-yaml-to-git', content, env)
// });
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Chart operations
    getChartDetails: (chartPath) => electron_1.ipcRenderer.invoke('chart:getDetails', { path: chartPath }),
    saveValues: (chartPath, values) => electron_1.ipcRenderer.invoke('chart:saveValues', { chartPath, values }),
    // Helm operations
    templateHelm: (releaseName, namespace, valuesYaml, chartPath) => electron_1.ipcRenderer.invoke('helm:template', { releaseName, namespace, valuesYaml, chartPath }),
    // Dialog operations
    selectDirectory: (options) => electron_1.ipcRenderer.invoke('dialog:selectDirectory', options)
});
