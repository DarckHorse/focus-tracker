const { shouldIgnoreProcess } = require("./processFilters");

function isValidWindow(rawWindow) {
  if (!rawWindow) return false;

  if (!rawWindow.appName) return false;
  if (shouldIgnoreProcess(rawWindow.appName)) return false;

  if (!rawWindow.bounds) return false;

  const { width, height } = rawWindow.bounds;

  if (typeof width !== "number" || typeof height !== "number") return false;
  if (width <= 0 || height <= 0) return false;

  if (rawWindow.isMinimized === true) return false;
  if (rawWindow.isSystemWindow === true) return false;
  if (rawWindow.isToolWindow === true) return false;

  return true;
}

function filterWindows(rawWindows = []) {
  return rawWindows.filter(isValidWindow);
}

module.exports = {
  isValidWindow,
  filterWindows,
};