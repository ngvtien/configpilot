import { app, BrowserWindow } from 'electron';
import path from 'path';
import { setupIpcHandlers } from './ipc-handlers';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  //win.loadURL('http://localhost:5173'); // Vite dev server
  setTimeout(() => {
    win.loadURL('http://localhost:5173');
  }, 3000); // 3s delay
  
};

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
