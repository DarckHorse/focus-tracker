const path = require('path');
const { windowManager } = require('node-window-manager');
const CONFIG = require('../../config/config');

const RAW_IGNORED_APPS =
  CONFIG && CONFIG.ignored instanceof Set ? CONFIG.ignored : new Set();

const IGNORED_APPS = new Set(
  Array.from(RAW_IGNORED_APPS).map((app) => app.toLowerCase())
);

function getAppName(win) {
  if (!win.path) return null;
  return path.basename(win.path);
}

function getBounds(win) {
  if (typeof win.getBounds === 'function') {
    return win.getBounds();
  }
  return null;
}

function getIsMinimized(win) {
  if (typeof win.isMinimized === 'function') {
    return win.isMinimized();
  }
  return false;
}

function isVisibleWindow(win) {
  if (typeof win.isVisible === 'function') {
    return win.isVisible();
  }
  return true;
}

function hasValidBounds(bounds) {
  if (!bounds) return false;
  return bounds.width > 100 && bounds.height > 100;
}

function collectWindows() {
  const windows = windowManager.getWindows();

  return windows
    .map((win) => {
      const bounds = getBounds(win);
      const appName = getAppName(win);

      return {
        appName,
        monitor_id: 1,
        bounds: bounds
          ? {
              width: bounds.width,
              height: bounds.height,
            }
          : null,
        isMinimized: getIsMinimized(win),
        isVisible: isVisibleWindow(win),
        pid: win.processId,
        windowId: win.id,
        path: win.path,
      };
    })
    .filter((w) => {
      if (!w.appName) return false;

      if (IGNORED_APPS.has(w.appName.toLowerCase())) return false;

      if (!w.isVisible && !w.isMinimized) return false;

      if (!hasValidBounds(w.bounds)) return false;

      return true;
    });
}

module.exports = { collectWindows };