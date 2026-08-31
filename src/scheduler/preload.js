const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("focusTracker", {
  getBehaviorModel: () => ipcRenderer.invoke("focus-tracker:get-behavior-model"),
});