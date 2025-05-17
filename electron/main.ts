import { app, BrowserWindow } from 'electron';
import path from 'path';
import { setupIpcHandlers } from './ipc-handlers';
import waitOn from 'wait-on';

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged; // True in dev, false when packaged

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    const devUrl = 'http://localhost:5173';
    try {
      await waitOn({ resources: [devUrl], timeout: 15000 }); // 15s timeout
      console.log('[MAIN] Loading Dev URL:', devUrl);
      await mainWindow.loadURL(devUrl);
    } catch (err) {
      console.error('[MAIN] Failed to load dev server:', err);
      await mainWindow.loadURL('data:text/html,<h1>Dev server not running</h1>');
    }
  } else {
    const indexPath = path.join(__dirname, '../renderer/index.html');
    console.log('[MAIN] Loading Prod File:', indexPath);
    await mainWindow.loadFile(indexPath);
  }
};


app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
