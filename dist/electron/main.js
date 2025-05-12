"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const ipc_handlers_1 = require("./ipc-handlers");
const createWindow = () => {
    const win = new electron_1.BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
        },
    });
    //win.loadURL('http://localhost:5173'); // Vite dev server
    setTimeout(() => {
        win.loadURL('http://localhost:5173');
    }, 3000); // 3s delay
};
electron_1.app.whenReady().then(() => {
    createWindow();
    (0, ipc_handlers_1.setupIpcHandlers)();
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
