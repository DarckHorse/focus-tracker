const { classifySize } = require("./sizeClassifier");
const { filterWindows } = require("./windowFilter");
const { getAppId } = require("./appIdentity");

function getMonitorArea(monitor) {
  if (!monitor) return 0;
  return monitor.width * monitor.height;
}

function getWindowArea(bounds) {
  if (!bounds) return 0;
  return bounds.width * bounds.height;
}

function findMonitor(monitors = [], monitorId) {
  return monitors.find((monitor) => monitor.monitor_id === monitorId);
}

function buildMonitorRecord(rawMonitor) {
  return {
    monitor_id: rawMonitor.monitor_id,
    width: rawMonitor.width,
    height: rawMonitor.height,
  };
}

function buildWindowRecord(rawWindow, monitors) {
  const monitor = findMonitor(monitors, rawWindow.monitor_id);
  const monitorArea = getMonitorArea(monitor);
  const windowArea = getWindowArea(rawWindow.bounds);

  return {
    app_name: rawWindow.appName,
    app_id: getAppId(rawWindow.appName),
    monitor_id: rawWindow.monitor_id,
    size_class: classifySize(windowArea, monitorArea),
    is_minimized: Boolean(rawWindow.isMinimized),
  };
}

function buildWindowSnapshot({ timestamp, rawWindows = [], rawMonitors = [] }) {
  const monitors = rawMonitors.map(buildMonitorRecord);
  const validWindows = filterWindows(rawWindows);
  const windows = validWindows.map((rawWindow) =>
    buildWindowRecord(rawWindow, monitors)
  );

  return {
    event_type: "window_snapshot",
    timestamp,
    monitors,
    windows,
  };
}

module.exports = {
  buildWindowSnapshot,
};