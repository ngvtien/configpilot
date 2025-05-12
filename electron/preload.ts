import { contextBridge, ipcRenderer } from 'electron';

// contextBridge.exposeInMainWorld('electronAPI', {
//   saveYaml: (content: string, env: string) => ipcRenderer.send('save-yaml', content, env),
//   commitYamlToGit: (content: string, env: string) => ipcRenderer.send('commit-yaml-to-git', content, env)
// });

contextBridge.exposeInMainWorld('electronAPI', {
  // Chart operations
  getChartDetails: (chartPath: string) => 
    ipcRenderer.invoke('chart:getDetails', { path: chartPath }),
  saveValues: (chartPath: string, values: string) => 
    ipcRenderer.invoke('chart:saveValues', { chartPath, values }),
  
  // Helm operations
  templateHelm: (releaseName: string, namespace: string, valuesYaml: string, chartPath: string) => 
    ipcRenderer.invoke('helm:template', { releaseName, namespace, valuesYaml, chartPath }),
  
  // Dialog operations
  selectDirectory: (options?: any) => 
    ipcRenderer.invoke('dialog:selectDirectory', options)
});