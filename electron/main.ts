import { app, BrowserWindow, screen } from "electron"
import path from "path"
import { setupIpcHandlers } from "./ipc-handlers"
import waitOn from "wait-on"
import Store from "electron-store"

// Define the interface for window state
interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized: boolean
}

// The simplest approach that works reliably
// Create a helper function to avoid type issues
function getWindowState(store: any): WindowState {
  return store.get("windowState")
}

function setWindowState(store: any, state: WindowState): void {
  store.set("windowState", state)
}

// Create the store
const store = new Store({
  name: "window-state",
  defaults: {
    windowState: {
      width: 1200,
      height: 900,
      isMaximized: false,
    },
  },
})

let mainWindow: BrowserWindow | null = null

const isDev = !app.isPackaged // True in dev, false when packaged

// Ensure the window is visible on some display
function ensureVisibleOnSomeDisplay(windowState: WindowState): WindowState {
  const { x, y, width, height } = windowState

  // If we don't have position data, return just the size
  if (x === undefined || y === undefined) {
    return { width, height, isMaximized: windowState.isMaximized }
  }

  // Check if the window would be visible on any display
  const displays = screen.getAllDisplays()

  let isVisible = false
  for (const display of displays) {
    const bounds = display.bounds

    // Check if the window is at least partially visible on this display
    if (x + width > bounds.x && y + height > bounds.y && x < bounds.x + bounds.width && y < bounds.y + bounds.height) {
      isVisible = true
      break
    }
  }

  // If not visible, return just the size without position
  if (!isVisible) {
    return { width, height, isMaximized: windowState.isMaximized }
  }

  return windowState
}

const createWindow = async () => {
  // Get the window state using our helper function
  const savedWindowState = getWindowState(store)
  const windowState = ensureVisibleOnSomeDisplay(savedWindowState)

  // Create the browser window with saved dimensions
  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  })

  // If the window was maximized last time, maximize it again
  if (windowState.isMaximized) {
    mainWindow.maximize()
  }

  // Set up event listeners to save window state
  let debounceTimeout: NodeJS.Timeout | null = null

  const saveWindowState = () => {
    if (!mainWindow) return

    const isMaximized = mainWindow.isMaximized()

    // Only update the position and size if not maximized
    if (!isMaximized) {
      const bounds = mainWindow.getBounds()
      setWindowState(store, {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        isMaximized,
      })
    } else {
      // Just update the maximized state
      setWindowState(store, {
        ...savedWindowState,
        isMaximized,
      })
    }
  }

  // Debounced window state save
  const debouncedSave = () => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }
    debounceTimeout = setTimeout(saveWindowState, 500)
  }

  mainWindow.on("resize", debouncedSave)
  mainWindow.on("move", debouncedSave)
  mainWindow.on("close", saveWindowState)

  if (isDev) {
    const devUrl = "http://localhost:5173"
    try {
      await waitOn({ resources: [devUrl], timeout: 15000 }) // 15s timeout
      console.log("[MAIN] Loading Dev URL:", devUrl)
      await mainWindow.loadURL(devUrl)
    } catch (err) {
      console.error("[MAIN] Failed to load dev server:", err)
      await mainWindow.loadURL("data:text/html,<h1>Dev server not running</h1>")
    }
  } else {
    const indexPath = path.join(__dirname, "../renderer/index.html")
    console.log("[MAIN] Loading Prod File:", indexPath)
    await mainWindow.loadFile(indexPath)
  }
}

app.whenReady().then(() => {
  createWindow()
  setupIpcHandlers()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
