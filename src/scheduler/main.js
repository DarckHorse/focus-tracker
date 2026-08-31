const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const { startProcessTracker } = require("../capture/processTracker");
const { startFocusTracker } = require("../capture/focusTracker");
const { startWindowSnapshotTracker } = require("../capture/windowSnapshotTracker");
const { initializeLogFile } = require("../logger/logger");
const { buildBehaviorModel } = require("../data/behaviorModel");

function createWindow() {
  console.log("Creating browser window...");

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.on("did-fail-load", (_, errorCode, errorDescription) => {
    console.error("Window failed to load:", errorCode, errorDescription);
  });

  win.webContents.on("did-finish-load", () => {
    console.log("Window finished loading.");
  });

  const url = "http://127.0.0.1:5173/";
  console.log("Loading URL:", url);
  win.loadURL(url);

  win.loadURL("http://127.0.0.1:5173/");
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  console.log("Electron app is ready.");

  initializeLogFile(app);
  createWindow();
  startProcessTracker();
  startFocusTracker();
  startWindowSnapshotTracker();

  ipcMain.handle("focus-tracker:get-behavior-model", () => {
    return buildBehaviorModel();
  });
});

app.on("window-all-closed", () => {
  console.log("All windows closed.");
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  console.log("App activated.");
});